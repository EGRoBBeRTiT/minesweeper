import { Canvas } from '@/components/Canvas';
import { debounce, isDefined, throttle } from '@/utils';
import type { CanvasCell } from '@/modules/CanvasGame/components/CanvasCell';
import {
    XYToPosition,
    getCellCoordinates,
    positionToXY,
} from '@/modules/utils';
import { Flag } from '@/components/Flag';
import { BigMap } from '@/library';
import { styleVariable } from '@/shared/constants';
import { IndexDB } from '@/library/IndexDB';
import { IndexDBKey } from '@/types/IndexDB.types';

import {
    drawAllEmptyCells,
    drawAllMines,
    drawAnimationCells,
    drawOpenedCell,
    generateCell,
    hoverCell,
    markCell,
    openCell,
    setOpenedCell,
} from './utils';
import {
    ANIMATION_CANVAS_ID,
    CANVAS_CONTAINER_ID,
    HOVER_CANVAS_ID,
    MAIN_CANVAS_ID,
    MARKED_CELLS_CANVAS_ID,
    OPENED_BG_CELLS_CANVAS_ID,
    OPENED_CELLS_CANVAS_ID,
} from './CanvasGame.constants';

export type MinesPositionsMatrix = ((boolean | undefined)[] | undefined)[];

export type OpenedCellsMatrix = (number | undefined)[][];

interface AnimationCell {
    canAnimate?: boolean;
    width: number;
}

class CanvasGame {
    protected mainCanvas = new Canvas();

    protected hoverCanvas = new Canvas();

    protected openedBgCellsCanvas = new Canvas();

    protected openedCellsCanvas = new Canvas();

    protected markedCellsCanvas = new Canvas();

    protected animationCanvas = new Canvas();

    protected cellSize = 0;

    protected cellsWidth = 0;

    protected cellsHeight = 0;

    protected cellsPerRow = 0;

    protected cellsPerColumn = 0;

    protected minCellSize = 2;

    protected openedCells: OpenedCellsMatrix = [];

    protected minesPositions: MinesPositionsMatrix = [];

    protected markedCells = new Set<number>();

    protected animatingCells = new BigMap<AnimationCell>();

    protected firstOpenedCell = Number.NaN;

    protected minedCellPosition = Number.NaN;

    protected minesCount = 0;

    protected openedCellsCount = 0;

    protected minX = 0;

    protected maxX = 0;

    protected minY = 0;

    protected maxY = 0;

    protected hoveredCell?: CanvasCell | null = null;

    protected gameOvered = false;

    protected requestAnimationId = Number.NaN;

    protected statedTime = Number.NaN;

    protected timeIntervalId: ReturnType<typeof setInterval> | number =
        Number.NaN;

    protected saveGameStorage: IndexDB;

    public readyState: 'ready' | 'loading' = 'loading';

    private loadFromStorage = false;

    public loadState: 'from-storage' | 'new' = 'new';

    constructor() {
        this.saveGameStorage = new IndexDB(
            IndexDBKey.STORE_NAME,
            IndexDBKey.VERSION,
            IndexDBKey.DB_NAME,
            IndexDBKey.KEY_PATH,
        );

        const storage = this.saveGameStorage;

        void Promise.all([
            storage.get<number>(IndexDBKey.GAME_TIME),
            storage.get<MinesPositionsMatrix>(IndexDBKey.MINES_POSITIONS),
            storage.get<OpenedCellsMatrix>(IndexDBKey.OPENED_CELLS),
            storage.get<Set<number>>(IndexDBKey.MARKED_CELLS_POSITIONS),
            storage.get<number>(IndexDBKey.MINES_COUNT),
        ]).then(
            ([
                gameTime,
                minesPositions,
                openedCells,
                markedCells,
                minesCount,
            ]) => {
                const loadFromStorage =
                    isDefined(minesPositions) &&
                    isDefined(openedCells) &&
                    isDefined(minesCount);

                if (loadFromStorage) {
                    this.loadFromStorage = true;
                    this.loadState = 'from-storage';
                    this.minesPositions = minesPositions;
                    this.openedCells = openedCells;
                    this.markedCells = markedCells ?? new Set();
                    this.statedTime = Date.now() - (gameTime ?? 0) * 1000;
                    this.minesCount = minesCount;
                    this.cellsPerRow = minesPositions.length;
                    this.cellsPerColumn = minesPositions[0]?.length ?? 0;
                }

                this.readyState = 'ready';
                this.onReady?.();

                if (loadFromStorage) {
                    this.start(
                        this.cellsPerRow,
                        this.cellsPerColumn,
                        this.minesCount,
                    );

                    this.handleStart(this.statedTime);
                }
            },
        );
    }

    /* Срабатывает, когда открывается первая ячейка */
    public onStart?: () => void;

    /* Срабатывает, когда все возможные ячейки открыты */
    public onWin?: () => void;

    /* Срабатывает, когда открывается ячейка с миной */
    public onGameOver?: () => void;

    /* Срабатывает, когда меняется кол-во установленных  флажков */
    public onFlagsChange?: (flagsCount?: number) => void;

    /* Срабатывает каждую секунду игрового времени */
    public onTimeChange?: (gameTime: number) => void;

    /* Срабатывает, когда игра готова к старту */
    public onReady?: () => void;

    protected XYToPosition(x: number, y: number) {
        return XYToPosition(x, y, this.cellsPerRow);
    }

    protected positionToXY(position: number) {
        return positionToXY(position, this.cellsPerRow);
    }

    protected generateCell(x: number, y: number) {
        return generateCell.call(this, x, y);
    }

    protected mapChunk(callback: (x: number, y: number) => void) {
        for (let i = this.minX; i <= this.maxX; i++) {
            for (let j = this.minY; j <= this.maxY; j++) {
                callback(i, j);
            }
        }
    }

    private defineProperties(
        cellsPerRow: number,
        cellsPerColumn: number,
        minesCount: number,
        minCellSize = 40,
    ) {
        this.cellsPerRow = cellsPerRow;
        this.cellsPerColumn = cellsPerColumn;
        this.minCellSize = minCellSize;
        this.minesCount = Math.min(
            Math.max(minesCount, 2),
            cellsPerRow * cellsPerColumn - 1,
        );

        if (!this.loadFromStorage) {
            this.openedCells = Array.from(
                { length: this.cellsPerRow },
                () => [],
            );
        }

        const canvasContainer = document.getElementById(CANVAS_CONTAINER_ID);

        const containerWidth = canvasContainer?.clientWidth ?? 0;
        const containerHeight = canvasContainer?.clientHeight ?? 0;

        const cellWidth = containerWidth / cellsPerRow;
        const cellHeight = containerHeight / cellsPerColumn;

        this.cellSize = Math.max(
            Math.floor(Math.min(cellWidth, cellHeight)),
            minCellSize,
        );

        this.cellSize =
            this.cellSize % 2 === 0 ? this.cellSize : this.cellSize - 1;

        this.cellsWidth = this.cellSize * this.cellsPerRow;
        this.cellsHeight = this.cellSize * this.cellsPerColumn;

        const canvasWidth = Math.min(
            this.cellSize * cellsPerRow,
            containerWidth,
        );
        const canvasHeight = Math.min(
            this.cellSize * cellsPerColumn,
            containerHeight,
        );

        this.maxX = Math.ceil(canvasWidth / this.cellSize) - 1;
        this.maxY = Math.ceil(canvasHeight / this.cellSize) - 1;

        this.mainCanvas = new Canvas(MAIN_CANVAS_ID, canvasWidth, canvasHeight);

        this.hoverCanvas = new Canvas(
            HOVER_CANVAS_ID,
            canvasWidth,
            canvasHeight,
        );

        this.openedBgCellsCanvas = new Canvas(
            OPENED_BG_CELLS_CANVAS_ID,
            canvasWidth,
            canvasHeight,
        );

        this.openedCellsCanvas = new Canvas(
            OPENED_CELLS_CANVAS_ID,
            canvasWidth,
            canvasHeight,
        );

        this.markedCellsCanvas = new Canvas(
            MARKED_CELLS_CANVAS_ID,
            canvasWidth,
            canvasHeight,
        );

        this.animationCanvas = new Canvas(
            ANIMATION_CANVAS_ID,
            canvasWidth,
            canvasHeight,
        );
    }

    protected canDrawCell(x: number, y: number) {
        return (
            x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY
        );
    }

    /**
     * Находит позицию ячейки
     * @param x позиция x в px относительно элемента
     * @param y позиция y в px относительно элемента
     * @returns [x, y] – Позиция ячейки
     */
    protected getCellCoordinates(x: number, y: number) {
        return getCellCoordinates(
            x,
            y,
            this.cellSize,
            this.cellsPerRow,
            this.cellsPerColumn,
        );
    }

    protected clearHoverArea = () => {
        this.hoverCanvas.clear();
        this.hoveredCell = null;
    };

    private handleMouseMove = throttle((e?: MouseEvent) => {
        const transform = this.mainCanvas.context?.getTransform();

        const x = transform?.e ?? 0;
        const y = transform?.f ?? 0;

        this.hoverCell((e?.offsetX ?? 0) - x, (e?.offsetY ?? 0) - y);
    }, 30);

    private handleMouseEnter = () => {
        document.addEventListener('wheel', this.handleWheelListener);

        window.oncontextmenu = (e) => {
            e.preventDefault();

            return false;
        };
    };

    private handleMouseLeave = () => {
        document.removeEventListener('wheel', this.handleWheelListener);

        this.clearHoverArea();

        window.oncontextmenu = null;
    };

    private handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const transform = this.mainCanvas.context?.getTransform();

        const x = transform?.e ?? 0;
        const y = transform?.f ?? 0;

        const offsetX = (e?.offsetX ?? 0) - x;
        const offsetY = (e?.offsetY ?? 0) - y;

        if (e.button === 2) {
            this.markCell(offsetX, offsetY);
        } else {
            this.openCell(offsetX, offsetY);
        }

        return false;
    };

    private redrawDebounce = debounce(() => {
        this.redraw();
    }, 100);

    private handleWheelListener = (e?: WheelEvent) => {
        requestAnimationFrame(() => {
            this.redraw();
            this.translateCanvases(e?.deltaX ?? 0, e?.deltaY ?? 0);
            this.redrawDebounce();
        });
    };

    /**
     * Делает ячейку открытой
     * @param x - Позиция по x
     * @param y - Позиция по y
     * @param withMinesCalculating - Если true, то посчитается кол-во мин вокруг
     */
    protected setOpenedCell(
        x: number,
        y: number,
        withMinesCalculating?: boolean,
    ) {
        setOpenedCell.call(this, x, y, withMinesCalculating);
    }

    /**
     *  Создает hover эффект ячейки
     * @param positionX позиция X внутри элемента
     * @param positionY позиция Y внутри элемента
     */
    protected hoverCell(positionX: number, positionY: number) {
        hoverCell.call(this, positionX, positionY);
    }

    /**
     * Рисует линию вокруг всех открытых ячеек
     * @param x - позиция по x
     * @param y - позиция по y
     */
    protected drawOpenedCell(x: number, y: number) {
        drawOpenedCell.call(this, x, y);
    }

    /**
     * Открывает все близлежащие ячейки, вокруг которых нет бомб
     * @param x - позиция по x
     * @param y - позиция по y
     */
    protected drawAllEmptyCells(x: number, y: number) {
        drawAllEmptyCells.call(this, x, y);
    }

    /**
     * Открывает все ячейки с бомбами
     * @param x - позиция по x
     * @param y - позиция по y
     */
    protected drawAllMines(x: number, y: number) {
        drawAllMines.call(this, x, y);
    }

    /**
     *  Открывает ячейку по клику
     * @param positionX позиция X внутри элемента
     * @param positionY позиция Y внутри элемента
     */
    protected openCell(positionX: number, positionY: number) {
        openCell.call(this, positionX, positionY);
    }

    /**
     *  Открывает ячейку по клику
     * @param positionX позиция X внутри элемента
     * @param positionY позиция Y внутри элемента
     */
    protected markCell(positionX: number, positionY: number) {
        markCell.call(this, positionX, positionY);
    }

    protected setAllListeners() {
        this.animationCanvas.canvas.onmousemove = this.handleMouseMove;
        this.animationCanvas.canvas.onmouseenter = this.handleMouseEnter;
        this.animationCanvas.canvas.onmouseleave = this.handleMouseLeave;
        this.animationCanvas.canvas.onmousedown = this.handleMouseDown;
    }

    protected removeAllListeners() {
        this.animationCanvas.canvas.onmousemove = null;
        this.animationCanvas.canvas.onmouseenter = null;
        this.animationCanvas.canvas.onmouseleave = null;
        this.animationCanvas.canvas.onmousedown = null;
        document.removeEventListener('wheel', this.handleWheelListener);
    }

    start(
        cellsPerRow: number,
        cellsPerColumn: number,
        minesCount: number,
        minCellSize = 40,
    ) {
        if (!this.loadFromStorage) {
            this.destroy();
        }

        this.defineProperties(
            cellsPerRow,
            cellsPerColumn,
            minesCount,
            minCellSize,
        );

        this.mainCanvas.insertIntoElement(CANVAS_CONTAINER_ID);
        this.hoverCanvas.insertIntoElement(CANVAS_CONTAINER_ID);
        this.markedCellsCanvas.insertIntoElement(CANVAS_CONTAINER_ID);
        this.openedBgCellsCanvas.insertIntoElement(CANVAS_CONTAINER_ID);
        this.openedCellsCanvas.insertIntoElement(CANVAS_CONTAINER_ID);
        this.animationCanvas.insertIntoElement(CANVAS_CONTAINER_ID);

        this.drawAll();

        this.setAllListeners();

        this.loadFromStorage = false;
        this.loadState = 'new';
    }

    private drawMainCanvas() {
        this.mapChunk((x, y) => {
            const notOpened = this.openedCells[x][y] === undefined;

            if (notOpened) {
                const cell = this.generateCell(x, y);

                cell?.draw(this.mainCanvas.context);
            }
        });
    }

    private drawOpenedCellsCanvas() {
        this.mapChunk((x, y) => {
            const opened = this.openedCells[x][y] !== undefined;
            const mined = this.minesPositions[x]?.[y];
            const marked = this.markedCells.has(this.XYToPosition(x, y));

            if (this.gameOvered && mined && !marked) {
                const cell = this.generateCell(x, y);
                cell.opened = true;

                if (cell.position === this.minedCellPosition) {
                    cell.color = styleVariable.mineColorRed();
                }

                cell.draw(this.mainCanvas.context);

                return;
            }

            if (opened) {
                this.drawOpenedCell(x, y);
            }
        });
    }

    protected drawMarkedCellsCanvas() {
        this.mapChunk((x, y) => {
            const position = this.XYToPosition(x, y);
            const marked = this.markedCells.has(position);

            if (marked) {
                const offsetX = x * this.cellSize;
                const offsetY = y * this.cellSize;

                const paddingInline = Math.round(this.cellSize * 0.15);
                const paddingBlock = Math.round(this.cellSize * 0.15);

                const flag = new Flag(
                    offsetX + paddingInline,
                    offsetY + paddingInline,
                    this.cellSize - 2 * paddingInline,
                    this.cellSize - 2 * paddingBlock,
                );

                flag.draw(this.markedCellsCanvas.context);
            }
        });
    }

    private setTransform(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number,
    ) {
        this.mainCanvas.context?.setTransform(a, b, c, d, e, f);
        this.hoverCanvas.context?.setTransform(a, b, c, d, e, f);
        this.markedCellsCanvas.context?.setTransform(a, b, c, d, e, f);
        this.openedBgCellsCanvas.context?.setTransform(a, b, c, d, e, f);
        this.openedCellsCanvas.context?.setTransform(a, b, c, d, e, f);
        this.animationCanvas.context?.setTransform(a, b, c, d, e, f);
    }

    private translateCanvases(deltaX: number, deltaY: number) {
        const transform = this.mainCanvas.context?.getTransform();

        const currentX = transform?.e ?? 0;
        const currentY = transform?.f ?? 0;

        const translateX = -deltaX;
        const translateY = -deltaY;

        const maxScrollX = this.mainCanvas.canvas.width - this.cellsWidth;
        const maxScrollY = this.mainCanvas.canvas.height - this.cellsHeight;

        const nextX = currentX + translateX;
        const nextY = currentY + translateY;

        const transformX = Math.min(Math.max(nextX, maxScrollX), 0);
        const transformY = Math.min(Math.max(nextY, maxScrollY), 0);

        const [minX, minY] = this.getCellCoordinates(-transformX, -transformY);

        const [maxX, maxY] = this.getCellCoordinates(
            this.mainCanvas.canvas.width - transformX - 1,
            this.mainCanvas.canvas.height - transformY - 1,
        );

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        this.setTransform(1, 0, 0, 1, transformX, transformY);
    }

    private clearAll() {
        this.mainCanvas.clear();
        this.clearHoverArea();
        this.openedBgCellsCanvas.clear();
        this.openedCellsCanvas.clear();
        this.markedCellsCanvas.clear();
        this.animationCanvas.clear();
    }

    private drawAll() {
        this.drawMainCanvas();
        this.drawOpenedCellsCanvas();
        this.drawMarkedCellsCanvas();
        this.drawAnimationCells();
    }

    private drawAnimationCells() {
        return drawAnimationCells.call(this);
    }

    protected showAnimation() {
        if (!Number.isNaN(this.requestAnimationId)) {
            cancelAnimationFrame(this.requestAnimationId);
        }

        const animate = () => {
            this.animationCanvas.clear();

            const hasAnimatingCells = this.drawAnimationCells();

            this.requestAnimationId = requestAnimationFrame(animate);

            if (!hasAnimatingCells) {
                cancelAnimationFrame(this.requestAnimationId);
                this.requestAnimationId = Number.NaN;
            }
        };

        this.requestAnimationId = requestAnimationFrame(animate);
    }

    redraw() {
        this.clearAll();

        this.drawAll();
    }

    protected resetState() {
        this.clearAll();

        this.openedCells = Array.from({ length: this.cellsPerRow }, () => []);
        this.minesPositions = [];
        this.firstOpenedCell = Number.NaN;
        this.minedCellPosition = Number.NaN;
        this.requestAnimationId = Number.NaN;
        this.gameOvered = false;
        this.animatingCells.clear();
        this.markedCells.clear();
        this.minX = 0;
        this.minY = 0;
        this.hoveredCell = null;
        this.openedCellsCount = 0;

        this.maxX = Math.ceil(this.mainCanvas.canvas.width / this.cellSize) - 1;
        this.maxY =
            Math.ceil(this.mainCanvas.canvas.height / this.cellSize) - 1;

        this.setTransform(1, 0, 0, 1, 0, 0);

        clearInterval(this.timeIntervalId);
    }

    restart() {
        this.resetSave();
        this.resetState();
        this.drawAll();
        this.setAllListeners();
    }

    protected handleGameOver() {
        this.animationCanvas.canvas.onmousemove = null;
        this.animationCanvas.canvas.onmousedown = null;
        this.gameOvered = true;
        clearInterval(this.timeIntervalId);

        this.onGameOver?.();
        this.resetSave();
    }

    private saveGame(time: number) {
        this.saveGameTime(time);
    }

    protected saveGameTime(time: number) {
        void this.saveGameStorage.add(IndexDBKey.GAME_TIME, time, true);
    }

    protected saveMarkedCells() {
        void this.saveGameStorage.add(
            IndexDBKey.MARKED_CELLS_POSITIONS,
            this.markedCells,
            true,
        );
    }

    protected saveOpenedCells() {
        void this.saveGameStorage.add(
            IndexDBKey.OPENED_CELLS,
            this.openedCells,
            true,
        );
    }

    protected saveMinesPositions() {
        void this.saveGameStorage.add(
            IndexDBKey.MINES_POSITIONS,
            this.minesPositions,
            true,
        );
    }

    protected saveMinesCount() {
        void this.saveGameStorage.add(
            IndexDBKey.MINES_COUNT,
            this.minesCount,
            true,
        );
    }

    private resetSave() {
        void this.saveGameStorage.clear();
    }

    protected handleStart(statedTime: number) {
        this.statedTime = statedTime;

        if (Number.isNaN(this.timeIntervalId)) {
            clearInterval(this.timeIntervalId);
        }

        this.onStart?.();

        this.timeIntervalId = setInterval(() => {
            const currentTime = Date.now();

            const diff = Math.floor((currentTime - this.statedTime) / 1000);

            this.onTimeChange?.(diff);

            this.saveGame(diff);
        }, 1000);
    }

    protected handleWin() {
        this.animationCanvas.canvas.onmousemove = null;
        this.animationCanvas.canvas.onmousedown = null;
        clearInterval(this.timeIntervalId);
        this.resetSave();

        this.onWin?.();
    }

    stop() {
        this.removeAllListeners();
        clearInterval(this.timeIntervalId);
    }

    destroy() {
        this.stop();
        this.resetState();

        this.mainCanvas.destroy();
        this.hoverCanvas.destroy();
        this.markedCellsCanvas.destroy();
        this.openedBgCellsCanvas.destroy();
        this.openedCellsCanvas.destroy();
        this.animationCanvas.destroy();
        this.resetSave();
    }
}

export type CanvasGameType = CanvasGame;

export const canvasGame = new CanvasGame();

import { debounce, isDefined, throttle } from '@/utils';
import type { Cell } from '@/modules/CanvasGame/components/Cell';
import {
    XYToPosition,
    getCellCoordinates,
    positionToXY,
} from '@/modules/utils';
import { BigMap } from '@/library';
import { styleVariable } from '@/shared/constants';
import { IndexDB } from '@/library/IndexDB';
import { IndexDBKey } from '@/types/IndexDB.types';
import { Canvas } from '@/modules/CanvasGame/components/Canvas';
import { Flag } from '@/modules/CanvasGame/components/Flag';
import { defineProperties } from '@/modules/CanvasGame/utils/defineProperties';
import { translateCanvases } from '@/modules/CanvasGame/utils/translateCanvases';

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
import { CANVAS_CONTAINER_ID } from './CanvasGame.constants';

export type MinesPositionsMatrix = ((boolean | undefined)[] | undefined)[];

export type OpenedCellsMatrix = (number | undefined)[][];

interface AnimationCell {
    canAnimate?: boolean;
    width: number;
}

class CanvasGame {
    /** canvas для отображения неоткрытых ячеек */
    protected mainCanvas = new Canvas();

    /** canvas для отображения ховера */
    protected hoverCanvas = new Canvas();

    /**
     * canvas для отображения ячеек,
     * имитирующих границу вокруг открытых ячеек
     */
    protected openedBgCellsCanvas = new Canvas();

    /** canvas для отображения открытых ячеек */
    protected openedCellsCanvas = new Canvas();

    /** canvas для отображения флажков */
    protected markedCellsCanvas = new Canvas();

    /** canvas для отображения анимации */
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

    /** Позиция заминированной ячейки, которую нажали  */
    protected minedCellPosition = Number.NaN;

    protected minesCount = 0;

    protected openedCellsCount = 0;

    /** Минимальная видимая позиция по X  */
    protected minX = 0;

    /** Максимальная видимая позиция по X  */
    protected maxX = 0;

    /** Минимальная видимая позиция по Y  */
    protected minY = 0;

    /** Максимальная видимая позиция по Y  */
    protected maxY = 0;

    protected hoveredCell?: Cell | null = null;

    protected gameOvered = false;

    protected requestAnimationId = Number.NaN;

    protected statedTime = Number.NaN;

    protected timeIntervalId: ReturnType<typeof setInterval> | number =
        Number.NaN;

    protected saveGameStorage: IndexDB = new IndexDB(
        IndexDBKey.STORE_NAME,
        IndexDBKey.VERSION,
        IndexDBKey.DB_NAME,
        IndexDBKey.KEY_PATH,
    );

    public readyState: 'ready' | 'loading' = 'loading';

    protected loadFromStorage = false;

    public loadState: 'from-storage' | 'new' = 'new';

    constructor() {
        const storage = this.saveGameStorage;

        void Promise.all([
            storage.get<number>(IndexDBKey.GAME_TIME),
            storage.get<MinesPositionsMatrix>(IndexDBKey.MINES_POSITIONS),
            storage.get<OpenedCellsMatrix>(IndexDBKey.OPENED_CELLS),
            storage.get<Set<number>>(IndexDBKey.MARKED_CELLS_POSITIONS),
            storage.get<number>(IndexDBKey.MINES_COUNT),
            storage.get<number>(IndexDBKey.OPENED_CELLS_COUNT),
        ]).then(
            ([
                gameTime,
                minesPositions,
                openedCells,
                markedCells,
                minesCount,
                openedCellsCount,
            ]) => {
                const loadFromStorage =
                    isDefined(minesPositions) &&
                    isDefined(openedCells) &&
                    isDefined(minesCount) &&
                    isDefined(openedCellsCount);

                if (loadFromStorage) {
                    this.loadFromStorage = true;
                    this.loadState = 'from-storage';
                    this.minesPositions = minesPositions;
                    this.openedCells = openedCells;
                    this.openedCellsCount = openedCellsCount;
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

    protected getXYCanvasTransform() {
        const transform = this.mainCanvas.context?.getTransform();

        return [transform?.e ?? 0, transform?.f ?? 0] as const;
    }

    protected getCanvases() {
        return [
            this.mainCanvas,
            this.hoverCanvas,
            this.markedCellsCanvas,
            this.openedBgCellsCanvas,
            this.openedCellsCanvas,
            this.animationCanvas,
        ];
    }

    private defineProperties(
        cellsPerRow: number,
        cellsPerColumn: number,
        minesCount: number,
        minCellSize = 40,
    ) {
        defineProperties.call(
            this,
            cellsPerRow,
            cellsPerColumn,
            minesCount,
            minCellSize,
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
        const [x, y] = this.getXYCanvasTransform();

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

        const [x, y] = this.getXYCanvasTransform();

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

        this.getCanvases().forEach((canvas) => {
            canvas.insertIntoElement(CANVAS_CONTAINER_ID);
        });

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

    protected setTransform(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number,
    ) {
        this.getCanvases().forEach((canvas) => {
            canvas.context?.setTransform(a, b, c, d, e, f);
        });
    }

    private translateCanvases(deltaX: number, deltaY: number) {
        translateCanvases.call(this, deltaX, deltaY);
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
        void this.saveGameStorage.add(
            IndexDBKey.OPENED_CELLS_COUNT,
            this.openedCellsCount,
            true,
        );
    }

    protected saveMinesPositions() {
        void this.saveGameStorage.add(
            IndexDBKey.MINES_POSITIONS,
            this.minesPositions,
            true,
        );
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

        if (!Number.isNaN(this.timeIntervalId)) {
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

        this.getCanvases().forEach((canvas) => {
            canvas.destroy();
        });

        this.resetSave();
    }
}

export type CanvasGameType = CanvasGame;

export const canvasGame = new CanvasGame();

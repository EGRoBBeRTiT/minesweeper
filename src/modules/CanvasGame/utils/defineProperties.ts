import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import {
    ANIMATION_CANVAS_ID,
    CANVAS_CONTAINER_ID,
    HOVER_CANVAS_ID,
    MAIN_CANVAS_ID,
    MARKED_CELLS_CANVAS_ID,
    OPENED_BG_CELLS_CANVAS_ID,
    OPENED_CELLS_CANVAS_ID,
} from '@/modules/CanvasGame/CanvasGame.constants';
import { Canvas } from '@/modules/CanvasGame/components/Canvas';

/**
 * Устанавливает все переменные при старте игры
 * @param cellsPerRow  - количество ячеек по горизонтали
 * @param cellsPerColumn - количество ячеек по вертикали
 * @param minesCount - количество мин
 * @param minCellSize - минимальный размер ячейки
 */
export function defineProperties(
    this: CanvasGameType,
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
        this.openedCells = Array.from({ length: this.cellsPerRow }, () => []);
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

    this.cellSize = this.cellSize % 2 === 0 ? this.cellSize : this.cellSize - 1;

    this.cellsWidth = this.cellSize * this.cellsPerRow;
    this.cellsHeight = this.cellSize * this.cellsPerColumn;

    const canvasWidth = Math.min(this.cellSize * cellsPerRow, containerWidth);
    const canvasHeight = Math.min(
        this.cellSize * cellsPerColumn,
        containerHeight,
    );

    this.maxX = Math.ceil(canvasWidth / this.cellSize) - 1;
    this.maxY = Math.ceil(canvasHeight / this.cellSize) - 1;

    this.mainCanvas = new Canvas(MAIN_CANVAS_ID, canvasWidth, canvasHeight);

    this.hoverCanvas = new Canvas(HOVER_CANVAS_ID, canvasWidth, canvasHeight);

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

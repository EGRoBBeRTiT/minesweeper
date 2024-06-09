import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { CanvasCell } from '@/modules/CanvasGame/components/CanvasCell';

/**
 * Генерирует класс ячейки для последующей отрисовки
 * @param x - позиция по x
 * @param y - позиция по y
 * @returns класс ячейки
 */
export function generateCell(this: CanvasGameType, x: number, y: number) {
    const offsetX = x * this.cellSize;
    const offsetY = y * this.cellSize;

    const position = this.XYToPosition(x, y);

    const mined = this.minesPositions[x]?.[y];

    const opened = this.openedCells[x][y] !== undefined;

    const cell = new CanvasCell(
        offsetX,
        offsetY,
        this.cellSize,
        this.cellSize,
        undefined,
        x,
        y,
    );

    cell.position = position;
    cell.opened = opened;
    cell.mined = !!mined;
    cell.nearMinesCount = this.openedCells[x][y] ?? 0;
    cell.marked = this.markedCells.has(position);

    return cell;
}

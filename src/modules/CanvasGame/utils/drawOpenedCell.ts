import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { Cell } from '@/modules/CanvasGame/components/Cell';
import { styleVariable } from '@/shared/constants';

/**
 * Рисует линию вокруг всех открытых ячеек
 * @param x - позиция по x
 * @param y - позиция по y
 */
export function drawOpenedCell(this: CanvasGameType, x: number, y: number) {
    const opened = this.openedCells[x][y] !== undefined;

    if (!opened) {
        return;
    }

    const ctx = this.openedCellsCanvas.context;

    const cell = this.generateCell(x, y);

    if (cell.nearMinesCount) {
        const bgCtx = this.openedBgCellsCanvas.context;

        const lineWidth = Math.round(this.cellSize / 16);

        const bgCell = new Cell(
            cell.x - lineWidth,
            cell.y - lineWidth,
            cell.width + lineWidth * 2,
            cell.height + lineWidth * 2,
            styleVariable.primaryColor(),
        );
        bgCell.draw(bgCtx);
    }

    cell.draw(ctx);
}

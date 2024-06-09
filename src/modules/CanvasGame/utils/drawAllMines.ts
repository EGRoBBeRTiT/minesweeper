import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { styleVariable } from '@/shared/constants';

/**
 * Открывает все ячейки с минами
 * @param x - позиция по x
 * @param y - позиция по y
 */
export function drawAllMines(this: CanvasGameType, x: number, y: number) {
    this.clearHoverArea();
    this.setOpenedCell(x, y);

    this.minedCellPosition = this.XYToPosition(x, y);

    const clickedCell = this.generateCell(x, y);

    clickedCell.color = styleVariable.mineColorRed();
    clickedCell.draw(this.mainCanvas.context);

    this.mapChunk((x, y) => {
        const position = this.XYToPosition(x, y);
        const mined = this.minesPositions[x]?.[y];
        const marked = this.markedCells.has(position);

        if (mined && !marked && position !== clickedCell.position) {
            this.setOpenedCell(x, y);

            const cell = this.generateCell(x, y);
            cell.opened = true;

            cell.draw(this.mainCanvas.context);
        }
    });
}

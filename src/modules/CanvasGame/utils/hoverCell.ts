import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { Cell } from '@/modules/CanvasGame/components/Cell';
import { styleVariable } from '@/shared/constants';

/**
 *  Создает hover эффект ячейки
 * @param positionX позиция X внутри элемента
 * @param positionY позиция Y внутри элемента
 */
export function hoverCell(
    this: CanvasGameType,
    positionX: number,
    positionY: number,
) {
    const [x, y] = this.getCellCoordinates(positionX, positionY);

    const cell = this.generateCell(x, y);

    if (cell !== this.hoveredCell) {
        if (!cell?.opened && cell) {
            this.clearHoverArea();
            this.hoveredCell = cell;

            const hoveredCell = new Cell(
                cell.x,
                cell.y,
                cell.width,
                cell.height,
                styleVariable.cellHoverColor(),
            );

            hoveredCell.draw(this.hoverCanvas.context);
        } else {
            this.clearHoverArea();
        }
    }
}

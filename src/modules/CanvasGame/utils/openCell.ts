import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { generateMinesPositions } from '@/modules/utils';

/**
 *  Открывает ячейку по клику
 * @param offsetX позиция X внутри элемента (в px)
 * @param offsetY позиция Y внутри элемента (в px)
 */
export function openCell(
    this: CanvasGameType,
    offsetX: number,
    offsetY: number,
) {
    const [x, y, position] = this.getCellCoordinates(offsetX, offsetY);

    if (Number.isNaN(position)) {
        return;
    }

    const mined = this.minesPositions[x]?.[y];
    const marked = this.markedCells.has(position);
    const opened = this.openedCells[x][y] !== undefined;

    if (mined && !marked) {
        this.gameOver();

        this.drawAllMines(x, y);

        this.showAnimation();

        return;
    }

    if (!opened && !marked) {
        this.clearHoverArea();

        if (Number.isNaN(this.firstOpenedCell)) {
            this.firstOpenedCell = position;

            this.minesPositions = generateMinesPositions(
                this.minesCount,
                this.cellsPerRow,
                this.cellsPerColumn,
                position,
            );
        }

        this.drawAllEmptyCells(x, y);

        this.showAnimation();
    }
}

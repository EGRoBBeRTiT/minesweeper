import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { mapAround } from '@/modules/utils';

/**
 * Открывает все близлежащие ячейки, вокруг которых нет бомб
 * @param clickedX - Позиция по x
 * @param clickedY - Позиция по y
 */
export function drawAllEmptyCells(
    this: CanvasGameType,
    clickedX: number,
    clickedY: number,
) {
    const emptyMinesCellsStack: number[] = [];

    this.setOpenedCell(clickedX, clickedY, true);
    this.drawOpenedCell(clickedX, clickedY);

    const nearMinesCount = this.openedCells[clickedX][clickedY];

    if (!nearMinesCount) {
        const position = this.XYToPosition(clickedX, clickedY);

        emptyMinesCellsStack.push(position);
    }

    while (emptyMinesCellsStack.length) {
        const currentPosition = emptyMinesCellsStack.pop() ?? 0;

        const [currentX, currentY] = this.positionToXY(currentPosition);

        mapAround(
            currentX,
            currentY,
            this.cellsPerRow,
            this.cellsPerColumn,
            (x, y) => {
                const mined = this.minesPositions[x]?.[y];
                const opened = this.openedCells[x][y] !== undefined;

                if (!mined && !opened) {
                    this.setOpenedCell(x, y, true);

                    const nearMinesCount = this.openedCells[x][y];

                    if (!nearMinesCount) {
                        emptyMinesCellsStack.push(this.XYToPosition(x, y));
                    }

                    if (this.canDrawCell(x, y)) {
                        this.drawOpenedCell(x, y);
                    }
                }
            },
        );
    }
}

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
        this.handleGameOver();

        this.drawAllMines(x, y);

        this.showAnimation();

        return;
    }

    if (!opened && !marked) {
        this.clearHoverArea();

        const isFirstClick = !this.minesPositions.length;

        const doAfterGenerating = () => {
            this.drawAllEmptyCells(x, y);

            this.saveOpenedCells();

            this.showAnimation();

            if (isFirstClick) {
                this.handleStart(Date.now());
            }

            const cellsCount = this.cellsPerRow * this.cellsPerColumn;

            if (this.openedCellsCount === cellsCount - this.minesCount) {
                this.handleWin();
            }
        };

        if (isFirstClick) {
            this.firstOpenedCell = position;

            void generateMinesPositions(
                this.minesCount,
                this.cellsPerRow,
                this.cellsPerColumn,
                position,
            ).then((minesPositions) => {
                this.minesPositions = minesPositions;

                this.saveMinesPositions();
                this.saveMinesCount();

                doAfterGenerating();
            });

            return;
        }

        doAfterGenerating();
    }
}

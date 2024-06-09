import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { getMinesCount } from '@/modules/utils';

/**
 * Делает ячейку открытой
 * @param x - Позиция по x
 * @param y - Позиция по y
 * @param withMinesCalculating - Если true, то посчитается кол-во мин вокруг
 */
export function setOpenedCell(
    this: CanvasGameType,
    x: number,
    y: number,
    withMinesCalculating?: boolean,
) {
    if (this.openedCells[x][y] === undefined) {
        let minesCount = 0;

        if (withMinesCalculating) {
            minesCount = getMinesCount(
                x,
                y,
                this.cellsPerRow,
                this.cellsPerColumn,
                this.minesPositions,
            );
        }

        this.openedCells[x][y] = minesCount;

        if (this.canDrawCell(x, y)) {
            const position = this.XYToPosition(x, y);

            if (!this.animatingCells.has(position)) {
                this.animatingCells.set(position, {
                    width: this.cellSize,
                    canAnimate: false,
                });

                setTimeout(() => {
                    this.animatingCells.set(position, {
                        width: this.cellSize,
                        canAnimate: true,
                    });
                }, this.animatingCells.getSize() * 8);
            }
        }
    }
}

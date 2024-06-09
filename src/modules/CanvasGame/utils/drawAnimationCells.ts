import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';

/**
 * Рисует ячейки для последующей анимации
 * @returns {boolean} - true - есть ячейки для анимации, false - нет
 */
export function drawAnimationCells(this: CanvasGameType): boolean {
    let hasAnimatingCells = false;

    this.mapChunk((x, y) => {
        const position = this.XYToPosition(x, y);

        if (this.animatingCells.has(position)) {
            const cell = this.generateCell(x, y);

            cell.opened = false;

            const animatingCell = this.animatingCells.get(position);
            const width = animatingCell?.width ?? 0;

            if (width > 0) {
                hasAnimatingCells = true;

                cell.draw(this.animationCanvas.context, { width });

                if (animatingCell?.canAnimate) {
                    this.animatingCells.set(position, {
                        width: width - this.cellSize / 40,
                        canAnimate: true,
                    });
                }
            } else {
                this.animatingCells.delete(position);
            }
        }
    });

    return hasAnimatingCells;
}

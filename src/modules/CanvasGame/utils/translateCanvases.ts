import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';

/**
 * Сдвигает канвасы на deltaX и deltaY
 * @param deltaX - Сдвиг по x
 * @param deltaY - Сдвиг по y
 */
export function translateCanvases(
    this: CanvasGameType,
    deltaX: number,
    deltaY: number,
) {
    const [currentX, currentY] = this.getXYCanvasTransform();

    const translateX = -deltaX;
    const translateY = -deltaY;

    const maxScrollX = this.mainCanvas.canvas.width - this.cellsWidth;
    const maxScrollY = this.mainCanvas.canvas.height - this.cellsHeight;

    const nextX = currentX + translateX;
    const nextY = currentY + translateY;

    const transformX = Math.min(Math.max(nextX, maxScrollX), 0);
    const transformY = Math.min(Math.max(nextY, maxScrollY), 0);

    const [minX, minY] = this.getCellCoordinates(-transformX, -transformY);

    const [maxX, maxY] = this.getCellCoordinates(
        this.mainCanvas.canvas.width - transformX - 1,
        this.mainCanvas.canvas.height - transformY - 1,
    );

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;

    this.setTransform(1, 0, 0, 1, transformX, transformY);
}

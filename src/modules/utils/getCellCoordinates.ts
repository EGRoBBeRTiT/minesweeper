import { XYToPosition } from '@/modules/utils/XYToPosition';

/**
 * Находит позицию ячейки
 * @param x позиция x в px относительно элемента
 * @param y позиция y в px относительно элемента
 * @param cellSize размер ячейки
 * @param cellsPerRow кол-во ячеек по горизонтали
 * @param cellsPerColumn кол-во ячеек по вертикали
 * @returns [x, y] – Позиция ячейки
 */
export const getCellCoordinates = (
    x: number,
    y: number,
    cellSize: number,
    cellsPerRow: number,
    cellsPerColumn: number,
) => {
    const positionX = Math.floor(Math.max(x - 1, 0) / cellSize);
    const positionY = Math.floor(Math.max(y - 1, 0) / cellSize);

    const isXSafe = positionX >= 0 && positionX <= cellsPerRow - 1;
    const isYSafe = positionY >= 0 && positionY <= cellsPerColumn - 1;

    if (!isXSafe || !isYSafe) {
        return [Number.NaN, Number.NaN, Number.NaN];
    }

    const safeX = Math.min(Math.max(positionX, 0), cellsPerRow - 1);
    const safeY = Math.min(Math.max(positionY, 0), cellsPerColumn - 1);

    const position = XYToPosition(safeX, safeY, cellsPerRow);

    return [safeX, safeY, position] as const;
};

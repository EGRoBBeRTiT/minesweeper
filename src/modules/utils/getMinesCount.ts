import type { MinesPositionsMatrix } from '@/modules/CanvasGame/CanvasGame';
import { mapAround } from '@/modules/utils/mapAround';

/**
 *  Поиск количества мин вокруг ячейки
 * @param x - Позиция по x
 * @param y - Позиция по y
 * @param cellsPerRow - Кол-во ячеей в строке
 * @param cellsPerColumn - Кол-во ячеек в колонке
 * @param minesPositions - Множество позиций мин
 * @returns minesCount – Количество мин
 */
export const getMinesCount = (
    x: number,
    y: number,
    cellsPerRow: number,
    cellsPerColumn: number,
    minesPositions: MinesPositionsMatrix,
) => {
    let minesCount = 0;

    mapAround(x, y, cellsPerRow, cellsPerColumn, (x, y) => {
        if (minesPositions[x]?.[y]) {
            minesCount++;
        }
    });

    return minesCount;
};

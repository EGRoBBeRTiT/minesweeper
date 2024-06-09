export interface CellProps {
    x?: number;
    y?: number;
    color?: string;
    width?: number;
    height?: number;
}

export class Cell {
    /** Позиция x внутри сетки */
    positionX: number;

    /** Позиция y внутри сетки  */
    positionY: number;

    position?: number;

    mined: boolean;

    opened: boolean;

    nearMinesCount: number;

    marked = false;

    constructor(positionX?: number, positionY?: number) {
        this.positionX = positionX ?? 0;
        this.positionY = positionY ?? 0;

        this.mined = false;
        this.opened = false;
        this.nearMinesCount = 0;
    }

    /**
     * Проходит по всем ячейкам вокруг
     * @param maxX - Максимальный индекс по X
     * @param maxY - Максимальный индекс по Y
     * @param callback Колбек
     */
    mapAround(
        maxX: number,
        maxY: number,
        callback: (x: number, y: number) => void,
    ) {
        const positionX = this.positionX ?? 0;
        const positionY = this.positionY ?? 0;

        for (let x = positionX - 1; x <= positionX + 1; x++) {
            for (let y = positionY - 1; y <= positionY + 1; y++) {
                const isXSafe = x >= 0 && x <= maxX;
                const isYSafe = y >= 0 && y <= maxY;

                if (
                    (x === positionX && y === positionY) ||
                    !isXSafe ||
                    !isYSafe
                ) {
                    continue;
                }

                callback(x, y);
            }
        }
    }
}

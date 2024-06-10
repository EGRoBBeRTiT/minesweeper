import { positionToXY } from '@/modules/utils';

export interface GenerateMinesWorkerMessage {
    minesCount: number;
    cellsPerRow: number;
    cellsPerColumn: number;
    omitPosition: number;
}

onmessage = (e) => {
    const { minesCount, cellsPerRow, cellsPerColumn, omitPosition } =
        (e.data as GenerateMinesWorkerMessage | undefined) ?? {};

    if (minesCount && cellsPerRow && cellsPerColumn && omitPosition) {
        const cellsCount = cellsPerRow * cellsPerColumn;
        const notMinesCount = cellsCount - minesCount;

        const minesPositions: (boolean | undefined)[][] = Array.from(
            { length: cellsPerRow },
            () => Array.from({ length: cellsPerColumn }),
        );

        let addedMinesCount = 0;

        if (minesCount <= notMinesCount) {
            while (addedMinesCount < minesCount) {
                const randomPosition = Math.floor(Math.random() * cellsCount);

                const [x, y] = positionToXY(randomPosition, cellsPerRow);

                if (randomPosition !== omitPosition && !minesPositions[x][y]) {
                    minesPositions[x][y] = true;

                    addedMinesCount++;
                }
            }
        } else {
            const notMinesPositions: (boolean | undefined)[][] = Array.from(
                { length: cellsPerRow },
                () => Array.from({ length: cellsPerColumn }),
            );

            const [omitX, omitY] = positionToXY(omitPosition, cellsPerRow);

            notMinesPositions[omitX][omitY] = true;

            let addedNotMinesCount = 1;

            while (addedNotMinesCount < notMinesCount) {
                const randomPosition = Math.floor(Math.random() * cellsCount);

                const [x, y] = positionToXY(randomPosition, cellsPerRow);

                if (!notMinesPositions[x]) {
                    notMinesPositions[x] = Array.from({
                        length: cellsPerColumn,
                    });
                }

                if (!notMinesPositions[x][y]) {
                    notMinesPositions[x][y] = true;

                    addedNotMinesCount++;
                }
            }

            for (let i = 0; i < cellsPerRow; i++) {
                for (let j = 0; j < cellsPerColumn; j++) {
                    if (!notMinesPositions[i][j]) {
                        minesPositions[i][j] = true;
                    }
                }
            }
        }

        postMessage(minesPositions);
    }
};

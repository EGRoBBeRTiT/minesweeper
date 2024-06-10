import type { GenerateMinesWorkerMessage } from '@/workers/generateMinesWorker';

export const generateMinesPositions = (
    minesCount: number,
    cellsPerRow: number,
    cellsPerColumn: number,
    omitPosition: number,
) =>
    new Promise<(boolean | undefined)[][]>((resolve) => {
        const generateMinesWorker = new Worker('generateMinesWorker.js');

        const message: GenerateMinesWorkerMessage = {
            minesCount,
            cellsPerColumn,
            cellsPerRow,
            omitPosition,
        };

        generateMinesWorker.postMessage(message);
        generateMinesWorker.onmessage = (e) => {
            if (e.data instanceof Array) {
                resolve(e.data as (boolean | undefined)[][]);
            }
        };
    });

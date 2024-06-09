export const mapAround = (
    x: number,
    y: number,
    cellsPerRow: number,
    cellsPerColumn: number,
    callback: (x: number, y: number) => void,
) => {
    const minX = Math.max(x - 1, 0);
    const maxX = Math.min(x + 1, cellsPerRow - 1);

    const minY = Math.max(y - 1, 0);
    const maxY = Math.min(y + 1, cellsPerColumn - 1);

    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
            if (i === x && j === y) {
                continue;
            }

            callback(i, j);
        }
    }
};

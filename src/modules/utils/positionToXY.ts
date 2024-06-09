export const positionToXY = (position: number, cellsPerRow: number) => {
    const y = Math.floor(position / cellsPerRow);
    const x = position % cellsPerRow;

    return [x, y] as const;
};

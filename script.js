// const e = require('express');

// const MAX_MAP_SIZE = 2 ** 24;

// class BigMap extends Map {
//     mapsBuffer = new Map();

//     set(key, value) {
//         const mapIndex = Math.floor(key / MAX_MAP_SIZE);

//         if (!this.mapsBuffer.has(mapIndex)) {
//             this.mapsBuffer.set(mapIndex, new Map());
//         }

//         const map = this.mapsBuffer.get(mapIndex);

//         map?.set(key % MAX_MAP_SIZE, value);

//         return this;
//     }

//     get(key) {
//         const mapIndex = Math.floor(key / MAX_MAP_SIZE);

//         if (this.mapsBuffer.has(mapIndex)) {
//             return this.mapsBuffer.get(mapIndex).get(key % MAX_MAP_SIZE);
//         }

//         return undefined;
//     }

//     has(key) {
//         const mapIndex = Math.floor(key / MAX_MAP_SIZE);

//         if (this.mapsBuffer.has(mapIndex)) {
//             return this.mapsBuffer.get(mapIndex).has(key % MAX_MAP_SIZE);
//         }

//         return false;
//     }

//     clear() {
//         this.mapsBuffer.forEach((map) => {
//             map.clear();
//         });

//         this.mapsBuffer.clear();
//     }
// }

// const func = () => {
//     let sum = 0;

//     const size = 10000;

//     const start = new Date().getTime();

//     const minesPositions = Array.from({ length: size }, () =>
//         Array.from({ length: size }),
//     );

//     const cellsCount = size ** 2;

//     const minesCount = cellsCount * 0.2;

//     // const map = new BigMap();

//     // const start = new Date().getTime();

//     const omitPosition = 35;

//     let addedMinesCount = 0;

//     while (addedMinesCount < minesCount) {
//         const randomPosition = Math.floor(Math.random() * cellsCount);

//         const x = randomPosition % size;
//         const y = Math.floor(randomPosition / size);

//         if (randomPosition !== omitPosition && !minesPositions[x][y]) {
//             minesPositions[x][y] = true;

//             addedMinesCount++;
//         }
//     }

//     const end = new Date().getTime();

//     console.log('time', end - start, 'ms');
// };

// func();

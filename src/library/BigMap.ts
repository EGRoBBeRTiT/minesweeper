const MAX_MAP_SIZE = 2 ** 24;

export class BigMap<T> extends Map<number, T> {
    private mapsBuffer: Map<number, T>[] = [];

    set(key: number, value: T): this {
        const mapIndex = Math.floor(key / MAX_MAP_SIZE);

        if (!this.mapsBuffer[mapIndex]) {
            this.mapsBuffer[mapIndex] = new Map();
        }

        this.mapsBuffer[mapIndex].set(key, value);

        return this;
    }

    get(key: number): T | undefined {
        const mapIndex = Math.floor(key / MAX_MAP_SIZE);

        if (this.mapsBuffer[mapIndex]) {
            return this.mapsBuffer[mapIndex].get(key);
        }

        return undefined;
    }

    has(key: number): boolean {
        const mapIndex = Math.floor(key / MAX_MAP_SIZE);

        if (this.mapsBuffer[mapIndex]) {
            return this.mapsBuffer[mapIndex].has(key);
        }

        return false;
    }

    delete(key: number): boolean {
        const mapIndex = Math.floor(key / MAX_MAP_SIZE);

        if (this.mapsBuffer[mapIndex]) {
            return this.mapsBuffer[mapIndex].delete(key);
        }

        return false;
    }

    clear(): void {
        this.mapsBuffer.forEach((map) => {
            map.clear();
        });

        this.mapsBuffer.length = 0;
        this.mapsBuffer = [];
    }

    getSize() {
        return this.mapsBuffer.reduce((acc, map) => acc + map.size, 0);
    }
}

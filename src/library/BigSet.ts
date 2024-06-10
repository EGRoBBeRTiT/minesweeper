const MAX_SET_SIZE = 2 ** 24;

export class BigSet extends Set<number> {
    private setsBuffer: Set<number>[] = [];

    size = 0;

    add(value: number): this {
        if (this.has(value)) {
            return this;
        }

        this.size++;

        const mapIndex = Math.floor(value / MAX_SET_SIZE);

        if (!this.setsBuffer[mapIndex]) {
            this.setsBuffer[mapIndex] = new Set();
        }

        this.setsBuffer[mapIndex].add(value);

        return this;
    }

    has(key: number): boolean {
        const setIndex = Math.floor(key / MAX_SET_SIZE);

        if (this.setsBuffer[setIndex]) {
            return this.setsBuffer[setIndex].has(key);
        }

        return false;
    }

    delete(value: number): boolean {
        const setIndex = Math.floor(value / MAX_SET_SIZE);

        if (this.setsBuffer[setIndex]) {
            const deleted = this.setsBuffer[setIndex].delete(value);

            if (deleted) {
                this.size--;
            }

            return deleted;
        }

        return false;
    }

    clear(): void {
        this.setsBuffer.forEach((set) => {
            set.clear();
        });

        this.size = 0;
        this.setsBuffer.length = 0;
        this.setsBuffer = [];
    }

    forEach(
        callbackfn: (value: number, value2: number, set: Set<number>) => void,
    ): void {
        this.setsBuffer.forEach((set) => {
            set.forEach((value, value2, set) => {
                callbackfn(value, value2, set);
            });
        });
    }

    getSize() {
        return this.setsBuffer.reduce((acc, set) => acc + set.size, 0);
    }
}

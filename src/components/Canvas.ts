export class Canvas {
    canvas: HTMLCanvasElement;

    context: CanvasRenderingContext2D | null;

    constructor(id?: string, width?: number, height?: number) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        if (id) {
            this.canvas.id = id;
        }

        if (width) {
            this.canvas.width = width;
        }

        if (height) {
            this.canvas.height = height;
        }
    }

    insertIntoElement(id: string, where?: InsertPosition) {
        document
            .getElementById(id)
            ?.insertAdjacentElement(where ?? 'beforeend', this.canvas);
    }

    clear() {
        this.context?.clearRect(-40000, -40000, 80000, 80000);
    }

    getPropertyValue(property: string) {
        const computedStyle = getComputedStyle(this.canvas);

        return computedStyle.getPropertyValue(property);
    }
}

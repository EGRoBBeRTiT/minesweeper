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

    insertIntoElement(id: string) {
        document.getElementById(id)?.append(this.canvas);
    }

    clear() {
        this.context?.clearRect(-40000, -40000, 80000, 80000);
    }

    getPropertyValue(property: string) {
        const computedStyle = getComputedStyle(this.canvas);

        return computedStyle.getPropertyValue(property);
    }

    destroy() {
        this.canvas.remove();
        this.context = null;
    }
}

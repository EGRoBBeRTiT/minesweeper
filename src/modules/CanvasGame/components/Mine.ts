import { styleVariable } from '@/shared/constants';
import { isDefined } from '@/utils';

export interface MineProps {
    x?: number;
    y?: number;
    radius?: number;
    detailed?: boolean;
}

export class Mine {
    /** Смещение по x внутри canvas в px */
    x: number;

    /** Смещение по y внутри canvas в px */
    y: number;

    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx: CanvasRenderingContext2D | null, props?: MineProps) {
        const { x, y, radius, detailed } = props ?? {};

        if (isDefined(x)) {
            this.x = x;
        }

        if (isDefined(y)) {
            this.y = y;
        }

        if (isDefined(radius)) {
            this.radius = radius;
        }

        if (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = styleVariable.mineColor();

            ctx.fill();

            if (detailed) {
                ctx.beginPath();
                ctx.strokeStyle = styleVariable.mineColor();
                ctx.lineWidth = Math.round(this.radius / 10);
                ctx.moveTo(this.x - this.radius, this.y - this.radius);
                ctx.lineTo(this.x + this.radius, this.y + this.radius);

                ctx.moveTo(this.x - this.radius, this.y + this.radius);
                ctx.lineTo(this.x + this.radius, this.y - this.radius);

                ctx.moveTo(this.x, this.y - 2 * this.radius + 1);
                ctx.lineTo(this.x, this.y + 2 * this.radius - 1);

                ctx.moveTo(this.x - 2 * this.radius + 1, this.y);
                ctx.lineTo(this.x + 2 * this.radius - 1, this.y);

                ctx.stroke();
            }
        }
    }
}

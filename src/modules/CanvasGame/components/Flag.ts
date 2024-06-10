import { styleVariable } from '@/shared/constants';
import { isDefined } from '@/utils';

export interface FlagProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export class Flag {
    /** Смещение по x внутри canvas в px */
    x: number;

    /** Смещение по y внутри canvas в px */
    y: number;

    width: number;

    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D | null, props?: FlagProps) {
        const { x, y, width, height } = props ?? {};

        if (isDefined(x)) {
            this.x = x;
        }

        if (isDefined(y)) {
            this.y = y;
        }

        if (isDefined(width)) {
            this.width = width;
        }

        if (isDefined(height)) {
            this.height = height;
        }

        if (ctx) {
            ctx.fillStyle = styleVariable.flagColor();

            const handleWidth = Math.round(this.width / 5);

            const halfFlag = Math.round(this.height / 4);

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y + halfFlag);
            ctx.lineTo(this.x, this.y + halfFlag * 2);
            ctx.fill();

            ctx.fillStyle = styleVariable.flagHandleColor();

            ctx.fillRect(this.x, this.y, handleWidth, this.height);
        }
    }
}

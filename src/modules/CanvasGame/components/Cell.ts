import { Mine } from '@/modules/CanvasGame/components/Mine';
import { styleVariable } from '@/shared/constants';
import { isDefined } from '@/utils';

export interface CanvasCellProps {
    x?: number;
    y?: number;
    color?: string;
    width?: number;
    height?: number;
    detailedMine?: boolean;
}

export class Cell {
    /** Позиция x внутри сетки */
    positionX: number;

    /** Позиция y внутри сетки  */
    positionY: number;

    position?: number;

    mined: boolean;

    opened: boolean;

    nearMinesCount: number;

    marked = false;

    /** Смещение по x внутри canvas в px */
    x: number;

    /** Смещение по y внутри canvas в px */
    y: number;

    color?: string;

    width: number;

    height: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color?: string,
        positionX?: number,
        positionY?: number,
    ) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = width;
        this.height = height;
        this.positionX = positionX ?? 0;
        this.positionY = positionY ?? 0;

        this.mined = false;
        this.opened = false;
        this.nearMinesCount = 0;
    }

    draw(ctx: CanvasRenderingContext2D | null, props?: CanvasCellProps) {
        const { x, y, color, width, height, detailedMine = true } = props ?? {};

        if (isDefined(x)) {
            this.x = x;
        }

        if (isDefined(y)) {
            this.y = y;
        }

        if (isDefined(color)) {
            this.color = color;
        }

        if (isDefined(width)) {
            this.width = width;
        }

        if (isDefined(height)) {
            this.height = height;
        }

        if (ctx) {
            const primaryColor = this.opened
                ? styleVariable.primaryOpenedCellColor()
                : styleVariable.primaryCellColor();
            const secondaryColor = this.opened
                ? styleVariable.secondaryOpenedCellColor()
                : styleVariable.secondaryCellColor();

            const color =
                ((this.positionX % 2) + (this.positionY % 2)) % 2
                    ? secondaryColor
                    : primaryColor;

            if (this.mined && this.opened) {
                ctx.fillStyle = this.color || styleVariable.cellHoverColor();
                ctx.fillRect(this.x, this.y, this.width, this.height);

                const mineRadius = Math.round(Math.round(this.width / 4));

                const mine = new Mine(
                    this.x + this.width / 2,
                    this.y + this.width / 2,
                    mineRadius,
                );

                mine.draw(ctx, { detailed: detailedMine });

                return;
            }

            ctx.fillStyle = this.color || color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            if (this.nearMinesCount && this.opened) {
                ctx.font = `${Math.round((this.width / 3) * 2)}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                switch (this.nearMinesCount) {
                    case 1:
                        ctx.fillStyle = styleVariable.textColor1();
                        break;
                    case 2:
                        ctx.fillStyle = styleVariable.textColor2();
                        break;
                    case 3:
                        ctx.fillStyle = styleVariable.textColor3();
                        break;
                    case 4:
                        ctx.fillStyle = styleVariable.textColor4();
                        break;
                    case 5:
                        ctx.fillStyle = styleVariable.textColor5();
                        break;
                    case 6:
                        ctx.fillStyle = styleVariable.textColor6();
                        break;
                    case 7:
                        ctx.fillStyle = styleVariable.textColor7();
                        break;
                    case 8:
                        ctx.fillStyle = styleVariable.textColor8();
                        break;
                    default:
                        break;
                }

                ctx.fillText(
                    this.nearMinesCount.toString(),
                    this.x + Math.round(this.width / 2),
                    this.y + Math.round(this.height / 2),
                );
            }
        }
    }
}

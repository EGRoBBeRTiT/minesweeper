import { BigMap } from '@/library';
import { Cell } from '@/modules/CanvasGame/components/Cell';
import { XYToPosition } from '@/modules/utils';
import { isDefined } from '@/utils';

export interface CellsFieldProps {
    cellsPerRow?: number;
    cellsPerColum?: number;
    cellSize?: number;
    firstColor?: string;
    secondColor?: string;
    detailedMine?: boolean;
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

export class CellsMatrix {
    cellsPerRow: number;

    cellsPerColum: number;

    cellSize: number;

    map = new BigMap<Cell>();

    firstColor?: string;

    secondColor?: string;

    constructor(
        cellsPerRow: number,
        cellsPerColum: number,
        cellSize: number,
        firstColor?: string,
        secondColor?: string,
    ) {
        this.cellsPerRow = cellsPerRow;
        this.cellsPerColum = cellsPerColum;
        this.cellSize = cellSize;
        this.firstColor = firstColor;
        this.secondColor = secondColor;

        this.setCells();
    }

    setCells() {
        for (let i = 0; i < this.cellsPerRow; ++i) {
            for (let j = 0; j < this.cellsPerColum; ++j) {
                this.map.set(
                    XYToPosition(i, j, this.cellsPerRow),
                    new Cell(
                        i * this.cellSize,
                        j * this.cellSize,
                        this.cellSize,
                        this.cellSize,
                        ((i % 2) + (j % 2)) % 2
                            ? this.secondColor
                            : this.firstColor,
                        i,
                        j,
                    ),
                );
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D | null, props?: CellsFieldProps) {
        const {
            cellSize,
            cellsPerColum,
            cellsPerRow,
            firstColor,
            secondColor,
            detailedMine,
            minX = 0,
            maxX = 0,
            minY = 0,
            maxY = 0,
        } = props ?? {};

        const hasProps =
            isDefined(cellSize) ||
            isDefined(cellsPerColum) ||
            isDefined(cellsPerRow) ||
            isDefined(firstColor) ||
            isDefined(secondColor);

        this.cellSize = cellSize ?? this.cellSize;
        this.cellsPerColum = cellsPerColum ?? this.cellsPerColum;
        this.cellsPerRow = cellsPerRow ?? this.cellsPerRow;
        this.firstColor = firstColor ?? this.firstColor;
        this.secondColor = secondColor ?? this.secondColor;

        if (hasProps) {
            this.setCells();
        }

        if (ctx) {
            for (let i = minX; i <= maxX; i++) {
                for (let j = minY; j <= maxY; j++) {
                    const cell = this.map.get(
                        XYToPosition(i, j, this.cellsPerRow),
                    );

                    cell?.draw(ctx, { detailedMine });
                }
            }
        }
    }
}

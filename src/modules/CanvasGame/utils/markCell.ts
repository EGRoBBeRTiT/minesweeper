import type { CanvasGameType } from '@/modules/CanvasGame/CanvasGame';
import { isDefined } from '@/utils';

/**
 * Ставит влаг на ячейку
 * @param offsetX позиция X внутри элемента (в px)
 * @param offsetY позиция Y внутри элемента (в px)
 */
export function markCell(
    this: CanvasGameType,
    offsetX: number,
    offsetY: number,
) {
    const [x, y, position] = this.getCellCoordinates(offsetX, offsetY);

    const opened = isDefined(this.openedCells[x]?.[y]);
    const marked = this.markedCells.has(position);

    if (opened || Number.isNaN(position)) {
        return;
    }

    if (marked) {
        this.markedCells.delete(position);
    } else {
        this.markedCells.add(position);
    }

    this.markedCellsCanvas.clear();

    this.drawMarkedCellsCanvas();
}

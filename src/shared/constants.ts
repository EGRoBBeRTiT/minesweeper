export enum StyleVariable {
    PRIMARY_CELL_COLOR = '--primary-cell-color',
    SECONDARY_CELL_COLOR = '--secondary-cell-color',
    CELL_HOVER_COLOR = '--cell-hover-color',
    PRIMARY_OPENED_CELL_COLOR = '--primary-opened-cell-color',
    SECONDARY_OPENED_CELL_COLOR = '--secondary-opened-cell-color',
    PRIMARY_COLOR = '--primary-color',
    TEXT_COLOR_1 = '--text-color-1',
    TEXT_COLOR_2 = '--text-color-2',
    TEXT_COLOR_3 = '--text-color-3',
    TEXT_COLOR_4 = '--text-color-4',
    TEXT_COLOR_5 = '--text-color-5',
    TEXT_COLOR_6 = '--text-color-6',
    TEXT_COLOR_7 = '--text-color-7',
    TEXT_COLOR_8 = '--text-color-8',
    FLAG_COLOR = '--flag-color',
    FLAG_HANDLE_COLOR = '--flag-handle-color',
    MINE_COLOR = '--mine-color',
    MINE_COLOR_RED = '--mine-color-red',
}

class Style {
    computedStyle = getComputedStyle(document.body);

    getPropertyValue = (property: string) =>
        this.computedStyle.getPropertyValue(property);

    primaryCellColor = () =>
        this.getPropertyValue(StyleVariable.PRIMARY_CELL_COLOR);

    secondaryCellColor = () =>
        this.getPropertyValue(StyleVariable.SECONDARY_CELL_COLOR);

    cellHoverColor = () =>
        this.getPropertyValue(StyleVariable.CELL_HOVER_COLOR);

    primaryOpenedCellColor = () =>
        this.getPropertyValue(StyleVariable.PRIMARY_OPENED_CELL_COLOR);

    secondaryOpenedCellColor = () =>
        this.getPropertyValue(StyleVariable.SECONDARY_OPENED_CELL_COLOR);

    primaryColor = () => this.getPropertyValue(StyleVariable.PRIMARY_COLOR);

    textColor1 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_1);

    textColor2 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_2);

    textColor3 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_3);

    textColor4 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_4);

    textColor5 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_5);

    textColor6 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_6);

    textColor7 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_7);

    textColor8 = () => this.getPropertyValue(StyleVariable.TEXT_COLOR_8);

    flagColor = () => this.getPropertyValue(StyleVariable.FLAG_COLOR);

    flagHandleColor = () =>
        this.getPropertyValue(StyleVariable.FLAG_HANDLE_COLOR);

    mineColor = () => this.getPropertyValue(StyleVariable.MINE_COLOR);

    mineColorRed = () => this.getPropertyValue(StyleVariable.MINE_COLOR_RED);
}

export const styleVariable = new Style();

export enum Difficulty {
    BEGINNER = 'beginner',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
    IMPOSSIBLE = 'impossible',
    CUSTOM = 'custom',
}

export const DIFFICULTIES = {
    [Difficulty.BEGINNER]: {
        title: '🤓 Начинающий (9×9×10)',
        cellsPerRow: 9,
        cellsPerColumn: 9,
        minesCount: 10,
        smile: '🤓',
    },
    [Difficulty.ADVANCED]: {
        title: '😎 Продвинутый (16×16×40)',
        cellsPerRow: 16,
        cellsPerColumn: 16,
        minesCount: 40,
        smile: '😎',
    },
    [Difficulty.EXPERT]: {
        title: '🤩 Эксперт (30×16×99)',
        cellsPerRow: 30,
        cellsPerColumn: 16,
        minesCount: 99,
        smile: '🤩',
    },
    [Difficulty.IMPOSSIBLE]: {
        title: '😱 Невозможный (10000×10000×20000000)',
        cellsPerRow: 10_000,
        cellsPerColumn: 10_000,
        minesCount: 20_000_000,
        smile: '😱',
    },
    [Difficulty.CUSTOM]: {
        title: 'Другой',
        cellsPerRow: 0,
        cellsPerColumn: 0,
        minesCount: 0,
    },
} as const;

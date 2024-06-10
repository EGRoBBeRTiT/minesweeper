import { Modal } from '@/components/Modal';
import { concatClasses } from '@/utils';
import { Button } from '@/components/Button';
import { DIFFICULTIES, Difficulty } from '@/shared/constants';
import type { DifficultyConfig } from '@/types/DifficultyConfig.types';

import styles from './StartModal.module.scss';

const cx = concatClasses.bind(styles);

interface FormValues {
    difficulty: Difficulty;
    cellsPerRow?: number;
    cellsPerColumn?: number;
    minesCount?: number;
}

export class StartModal {
    modal: Modal;

    onStart?: (difficulty: DifficultyConfig) => void;

    disableCancel?: boolean;

    constructor() {
        this.modal = new Modal();

        const section = document.createElement('section');
        section.className = cx('section');

        {
            const head = document.createElement('h1');
            head.textContent = 'Добро пожаловать в Minesweeper!';
            section.append(head);
        }

        {
            const p = document.createElement('p');

            p.textContent =
                "Выберите размер поля и количество мин. После нажатия на кнопку 'Старт' игра начнется.";
            section.append(p);
        }

        const form = document.createElement('form');

        form.onsubmit = (e) => {
            e.preventDefault();

            const formData = new FormData(form);

            const { difficulty, cellsPerColumn, cellsPerRow, minesCount } =
                Object.fromEntries(formData) as unknown as FormValues;

            if (difficulty === Difficulty.CUSTOM) {
                this.onStart?.({
                    title: DIFFICULTIES[Difficulty.CUSTOM].title,
                    cellsPerRow: cellsPerRow ?? 0,
                    cellsPerColumn: cellsPerColumn ?? 0,
                    minesCount: minesCount ?? 0,
                });
            } else {
                this.onStart?.(DIFFICULTIES[difficulty]);
            }

            this.modal.ref.close();

            return false;
        };

        const inputs = document.createElement('div');

        const text = document.createElement('div');
        text.textContent = 'Введите свои значения:';

        const inputsContainer = document.createElement('div');
        inputsContainer.className = cx('inputs-container');

        const cellsPerRow = document.createElement('input');
        const cellsPerColumn = document.createElement('input');
        const minesCount = document.createElement('input');

        cellsPerRow.name = 'cellsPerRow';
        cellsPerRow.type = 'number';
        cellsPerRow.max = '10000';
        cellsPerRow.min = '2';
        cellsPerRow.placeholder = 'По горизонтали';
        cellsPerRow.maxLength = 6;
        cellsPerRow.required = true;
        cellsPerRow.oninput = () => {
            if (+cellsPerRow.value > 10000) {
                cellsPerRow.value = '10000';
            }

            const maxCount = +cellsPerRow.value * +cellsPerColumn.value - 1;

            if (
                cellsPerRow.value &&
                cellsPerColumn.value &&
                +minesCount.value > maxCount
            ) {
                minesCount.value = `${maxCount}`;
            }
        };

        cellsPerColumn.name = 'cellsPerColumn';
        cellsPerColumn.type = 'number';
        cellsPerColumn.max = '10000';
        cellsPerColumn.min = '2';
        cellsPerColumn.placeholder = 'По вертикали';
        cellsPerColumn.maxLength = 6;
        cellsPerColumn.required = true;

        cellsPerColumn.oninput = () => {
            if (+cellsPerColumn.value > 10000) {
                cellsPerColumn.value = '10000';
            }

            const maxCount = +cellsPerRow.value * +cellsPerColumn.value - 1;

            if (
                cellsPerRow.value &&
                cellsPerColumn.value &&
                +minesCount.value > maxCount
            ) {
                minesCount.value = `${maxCount}`;
            }
        };

        minesCount.name = 'minesCount';
        minesCount.type = 'number';
        minesCount.min = '2';
        minesCount.placeholder = 'Кол-во мин';
        minesCount.maxLength = 6;
        minesCount.required = true;

        minesCount.oninput = () => {
            const maxCount = +cellsPerRow.value * +cellsPerColumn.value - 1;

            if (
                cellsPerRow.value &&
                cellsPerColumn.value &&
                minesCount.value &&
                +minesCount.value > maxCount
            ) {
                minesCount.value = `${maxCount}`;
            }
        };

        inputsContainer.append(cellsPerRow, cellsPerColumn, minesCount);
        inputs.append(text, inputsContainer);

        const select = document.createElement('select');

        select.name = 'difficulty';

        Object.entries(DIFFICULTIES).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value.title;
            select.append(option);
        });

        form.append(select);

        select.onchange = () => {
            if (select.value === Difficulty.CUSTOM) {
                select.insertAdjacentElement('afterend', inputs);
            } else {
                inputs.remove();
            }
        };

        const button = new Button('Старт', cx('button'));
        button.ref.type = 'submit';

        form.append(button.ref);

        section.append(form);

        this.modal.ref.append(section);
    }

    render(id: string, disableCancel?: boolean) {
        this.modal.className = cx('modal');

        this.disableCancel = disableCancel ?? this.disableCancel;

        this.modal.disableCancel = this.disableCancel;

        this.modal.render(id);
    }
}

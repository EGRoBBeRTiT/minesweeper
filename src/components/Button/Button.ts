import { concatClasses } from '@/utils';

import styles from './Button.module.scss';

const cx = concatClasses.bind(styles);

export class Button {
    ref: HTMLButtonElement;

    className?: string;

    constructor(text?: string, className?: string) {
        const button = document.createElement('button');
        button.className = cx('button', className);
        this.ref = button;

        button.textContent = text ?? '';
    }

    render(id: string, className?: string) {
        this.ref.className = cx('button', className);

        document.getElementById(id)?.append(this.ref);
    }
}

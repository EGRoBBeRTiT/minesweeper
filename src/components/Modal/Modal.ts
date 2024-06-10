import { concatClasses } from '@/utils';

import styles from './Modal.module.scss';

const cx = concatClasses.bind(styles);

export class Modal {
    ref: HTMLDialogElement;

    className?: string;

    disableCancel?: boolean;

    constructor() {
        const dialog = document.createElement('dialog');
        this.ref = dialog;
    }

    handleModalClick = (e: MouseEvent) => {
        if (e.target === this.ref && !this.disableCancel) {
            this.ref.close();
        }
    };

    handleCancel = (e: Event) => {
        if (this.disableCancel) {
            e.preventDefault();

            return false;
        }
    };

    render(id: string) {
        this.ref.className = cx('modal', this.className);

        this.ref.onclick = this.handleModalClick;
        this.ref.oncancel = this.handleCancel;

        document.getElementById(id)?.append(this.ref);
    }
}

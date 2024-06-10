import { Button } from '@/components/Button';
import { concatClasses } from '@/utils';
import { LocalStorageKey } from '@/types/LocalStorag.types';
import { ColorTheme } from '@/types/ColorTheme.types';
import { localStorageSetItem } from '@/utils/localStorageSetItem';

import styles from './ThemeToggle.module.scss';

const cx = concatClasses.bind(styles);

export class ThemeToggle {
    ref: HTMLButtonElement;

    onClick?: (e: MouseEvent) => void;

    constructor() {
        const currentTheme = document.body.getAttribute(
            LocalStorageKey.COLOR_THEME,
        );

        const button = new Button(
            currentTheme === ColorTheme.LIGHT ? '☀️' : '🌙',
            cx('button'),
        );

        this.ref = button.ref;

        button.ref.onclick = (e) => {
            const currentTheme = document.body.getAttribute(
                LocalStorageKey.COLOR_THEME,
            );

            if (currentTheme === ColorTheme.DARK) {
                document.body.setAttribute(
                    LocalStorageKey.COLOR_THEME,
                    'light',
                );
                this.ref.textContent = '☀️';
                localStorageSetItem(
                    LocalStorageKey.COLOR_THEME,
                    ColorTheme.LIGHT,
                );
            } else {
                document.body.setAttribute(LocalStorageKey.COLOR_THEME, 'dark');
                this.ref.textContent = '🌙';
                localStorageSetItem(
                    LocalStorageKey.COLOR_THEME,
                    ColorTheme.DARK,
                );
            }

            this.onClick?.(e);
        };
    }
}

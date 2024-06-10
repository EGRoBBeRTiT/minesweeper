import { ColorTheme } from '@/types/ColorTheme.types';
import { LocalStorageKey } from '@/types/LocalStorag.types';
import { localStorageGetItem } from '@/utils/localStorageGetItem';

export const loadColorTheme = () => {
    const currentTheme = localStorageGetItem(LocalStorageKey.COLOR_THEME);

    if (currentTheme === ColorTheme.DARK) {
        document.body.setAttribute(
            LocalStorageKey.COLOR_THEME,
            ColorTheme.DARK,
        );
    } else {
        document.body.setAttribute(
            LocalStorageKey.COLOR_THEME,
            ColorTheme.LIGHT,
        );
    }
};

if (document.readyState !== 'loading') {
    loadColorTheme();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        loadColorTheme();
    });
}

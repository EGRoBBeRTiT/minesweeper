import { app } from '@/app';
import { loadColorTheme } from '@/loadColorTheme';

loadColorTheme();

if (document.readyState !== 'loading') {
    app();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        app();
    });
}

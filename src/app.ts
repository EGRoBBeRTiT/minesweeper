import { Button } from '@/components/Button';
import { StartModal } from '@/components/StartModal';
import { canvasGame } from '@/modules/CanvasGame';
import { ThemeToggle } from '@/components/ThemeToggle';
import { localStorageGetItem } from '@/utils/localStorageGetItem';
import { LocalStorageKey } from '@/types/LocalStorag.types';
import type { DifficultyConfig } from '@/types/DifficultyConfig.types';

import './styles/theme.scss';
import './styles/global.scss';

export const app = () => {
    const startGame = () => {
        let selectedDifficulty: DifficultyConfig = JSON.parse(
            localStorageGetItem(LocalStorageKey.SELECTED_DIFFICULTY) || '{}',
        ) as DifficultyConfig;

        const modal = new StartModal();
        modal.render('header', true);

        if (canvasGame.loadState === 'new') {
            modal.modal.ref.showModal();
        }

        const rightContainer = document.querySelector('.header__right');
        const toggleThemeButton = new ThemeToggle();
        rightContainer?.append(toggleThemeButton.ref);
        toggleThemeButton.onClick = () => {
            canvasGame.redraw();
        };

        const timeContainer = document.querySelector('.header__center__timer');
        const minesCountContainer = document.querySelector(
            '.header__center__mine__count',
        );
        const smileContainer = document.querySelector('.header__center__smile');
        const smileButton = new Button('😀', 'header__center__smile__button');
        smileContainer?.append(smileButton.ref);

        const resetTime = () => {
            if (timeContainer) {
                timeContainer.textContent = '000';
            }
        };

        const handleRestart = () => {
            smileButton.ref.textContent = selectedDifficulty.smile ?? '😀';

            if (minesCountContainer) {
                minesCountContainer.textContent = `${selectedDifficulty.minesCount ?? '00'}`;
            }

            resetTime();
            canvasGame.restart();
        };

        smileButton.ref.onclick = handleRestart;

        const difficultyButton = new Button();

        difficultyButton.ref.onclick = () => {
            modal.modal.disableCancel = false;
            modal.modal.ref.showModal();
        };

        canvasGame.onTimeChange = (time) => {
            const diffStr = time.toString().padStart(3, '0');

            if (timeContainer) {
                timeContainer.textContent = diffStr;
            }
        };

        canvasGame.onGameOver = () => {
            smileButton.ref.textContent = '😵';
        };

        canvasGame.onWin = () => {
            smileButton.ref.textContent = '👑';

            if (minesCountContainer) {
                minesCountContainer.textContent = '0';
            }
        };

        canvasGame.onFlagsChange = (count = 0) => {
            if (minesCountContainer) {
                minesCountContainer.textContent = `${(selectedDifficulty.minesCount ?? 0) - count}`;
            }
        };

        const setDifficulty = (difficulty: DifficultyConfig) => {
            selectedDifficulty = difficulty;
            localStorage.setItem(
                LocalStorageKey.SELECTED_DIFFICULTY,
                JSON.stringify(difficulty),
            );

            smileButton.ref.textContent = selectedDifficulty.smile ?? '😀';

            const difficultyContainer = document.getElementById(
                'difficulty-container',
            );

            if (minesCountContainer) {
                minesCountContainer.textContent = `${difficulty.minesCount ?? '00'}`;
            }

            difficultyButton.ref.textContent = difficulty.title ?? '';

            difficultyContainer?.append(difficultyButton.ref);
        };

        setDifficulty(selectedDifficulty);

        modal.onStart = (difficulty) => {
            resetTime();
            setDifficulty(difficulty);

            const {
                minesCount = 0,
                cellsPerColumn = 0,
                cellsPerRow = 0,
            } = difficulty;

            canvasGame.start(cellsPerRow, cellsPerColumn, minesCount, 40);
        };
    };

    if (canvasGame.readyState === 'ready') {
        startGame();
    } else {
        canvasGame.onReady = startGame;
    }
};

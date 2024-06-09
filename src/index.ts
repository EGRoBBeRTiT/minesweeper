import { canvasGame } from '@/modules/CanvasGame';
import './styles/global.scss';

const CELLS_PER_ROW = 10000;
const CELLS_PER_COLUMN = 10000;

const minesCount = Math.round(CELLS_PER_ROW * CELLS_PER_COLUMN * 0.15);

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const redrawButton = document.getElementById('redraw-button');

    if (startButton) {
        startButton.onclick = () => {
            canvasGame.start(CELLS_PER_ROW, CELLS_PER_COLUMN, minesCount, 40);
        };
    }

    if (restartButton) {
        restartButton.onclick = () => {
            canvasGame.restart();
        };
    }

    if (redrawButton) {
        redrawButton.onclick = () => {
            canvasGame.redraw();
        };
    }
});

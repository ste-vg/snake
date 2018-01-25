import '../styles.scss';
import './app.scss';

import { Snake } from "./snake";

let html = require('./app.html');

export class App
{
    constructor(container:HTMLElement)
    {
        container.innerHTML = html;   
        this.setupBoard();
    }

    setupBoard()
    {
        let board = document.getElementById('board');
        let score = document.getElementById('score');

        let game = new Snake(board, score);
        game.start();
    }
}

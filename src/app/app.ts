import '../styles.scss';
import './app.scss';

import { Observable, Subscription } from "rxjs";
import { Snake } from "./snake";
import { Pkg } from "../package";

const html = require('./app.html');

export class App
{
    private game:Snake;
    private score:HTMLElement;
    private container:HTMLElement;
    private boardContainer:HTMLElement;
    private gameState:string;

    constructor(container:HTMLElement)
    {
        container.innerHTML = html;   
        this.setupUI();
        this.setupGame();
    }

    setupUI()
    {
        this.score = document.getElementById('score');
        this.container = document.getElementById('container');
        this.boardContainer = document.getElementById('board-container');
        let startButton = Observable.fromEvent(document.getElementById('start-button'), 'click');
        startButton.subscribe((e:MouseEvent) => { this.startGame(); })

        console.log(Pkg().version);
    }

    setupGame()
    {
        let board = document.getElementById('board');

        this.game = new Snake(board);
        this.game.score.subscribe((score:number) => this.score.innerHTML = String(score));
        this.game.state.subscribe((state:string) => this.container.setAttribute('class', state))
        this.game.direction.subscribe((direction:string) => this.boardContainer.setAttribute('class', direction))
        this.game.reset();
    }

    startGame()
    {
        if(this.gameState == this.game.GAME_STATES.ready || this.gameState == this.game.GAME_STATES.ended)
        {
            this.game.start();
        }
    }
}

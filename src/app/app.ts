import '../styles.scss';
import './app.scss';

import { Observable, Subscription } from "rxjs";

declare function require(moduleName: string): any;
const {version : appVersion} = require('../../package.json');

import { Snake } from "./snake";

let html = require('./app.html');

export class App
{
    private game:Snake;
    private score:HTMLElement;
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
        let startButton = Observable.fromEvent(document.getElementById('startButton'), 'click');
        startButton.subscribe((e:MouseEvent) => { this.startGame(); })

        document.getElementById('app-version').innerHTML = appVersion;
    }

    setupGame()
    {
        let board = document.getElementById('board');
        this.game = new Snake(board);

        this.game.score.subscribe((score:number) => this.score.innerHTML = String(score));
        this.game.state.subscribe((state:string) => this.gameState = state);

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

import '../styles.scss';
import './snake.scss';

import { Observable, Subscription } from "rxjs";

import { States, Position, SnakePart, Direction } from "./Interfaces";

export class Snake
{
	private SETTINGS = {
		grid: {size: 10, rows: 20, columns: 20},
		snake: {startLength: 3, startSpeed: 800, speedIncrement: 10}
	}

	private DIRECTION = {
		up: 	{name: 'up', 	x: 0, 	y: -1},
		down: 	{name: 'down', 	x: 0, 	y: 1},
		left: 	{name: 'left', 	x: -1, 	y: 0},
		right: 	{name: 'right', x: 1, 	y: 0},
	}

	private GAME_STATES = {
		ready: 'READY',
		playing: 'PLAYING',
		ended: 'ENDED'
	}

	private states:States = {
		direction: this.DIRECTION.up,
		nextDirection: this.DIRECTION.up,
		speed: 0,
		game: this.GAME_STATES.ready,
		timeStamp: 0,
		snakeLength: 0
	}

	private board:HTMLElement;
	private grid:HTMLElement[] = [];
	private snake:SnakePart[] = [];

	// observables
	private keyPress:Observable<any>;

	// subscriptions
	private keyPressSubscription:Subscription;

	constructor(boardElement: HTMLElement, scoreElement: HTMLElement)
	{
		this.board = boardElement;
		
		// setup the game board grid
		
		this.board.style.setProperty("--grid-size", String(this.SETTINGS.grid.size));
		this.board.style.setProperty("--grid-columns", String(this.SETTINGS.grid.columns));
		this.board.style.setProperty("--grid-rows", String(this.SETTINGS.grid.rows));
		
		let count = this.SETTINGS.grid.columns * this.SETTINGS.grid.rows;
		for(let i = 0; i < count; i++)
		{
			let sq = document.createElement("div");
			this.grid.push(sq);
			this.board.appendChild(sq);
		}

		// setup observables
	
		this.keyPress = Observable.fromEvent(document, "keydown")
			.filter((e:KeyboardEvent) => ['arrowright', 'arrowleft', 'arrowup', 'arrowdown'].indexOf(e.key.toLowerCase()) >= 0)
			.map((e:KeyboardEvent) => e.key.toLowerCase().replace('arrow',''))

		this.keyPressSubscription = this.keyPress.subscribe((key: string) => 
		{
			if(this.states.game == this.GAME_STATES.playing)
			{
				this.setDirection(this.DIRECTION[key])
			}
		})

		// setup starting game state

		this.reset();
	}

	private setDirection(direction:Direction)
	{
		if(this.states.direction.x != direction.x && this.states.direction.y != direction.y)
		{
			this.states.nextDirection = direction;
		}
	}

	private reset()
	{
		this.snake = []
		this.states.direction = this.states.nextDirection = this.DIRECTION.up;
		this.states.snakeLength = this.SETTINGS.snake.startLength;
		let center:Position = {x: Math.round(this.SETTINGS.grid.columns / 2), y: Math.round(this.SETTINGS.grid.rows / 2)};

		for(let i = 0; i < this.states.snakeLength; i++)
		{
			let snakePart:SnakePart = {
				position: {x: center.x, y: center.y + (i * 1)},
				direction: this.DIRECTION.up
			}

			this.snake.push(snakePart);
		}

		this.draw();
	}

	private draw()
	{
		// reset all sqaures
		for(let i = 0; i < this.grid.length; i++) this.grid[i].className = '';
		
		// set snake squares
		for(let i = 0; i < this.snake.length; i++)
		{
			let snakePart = this.snake[i];
			let gridIndex = snakePart.position.x + (snakePart.position.y * this.SETTINGS.grid.columns);
			this.grid[gridIndex].className = 'snake';
		}
	}

	private tick(timeStamp:number)
	{
		if(this.states.game == this.GAME_STATES.playing)
		{
			if(!this.states.timeStamp || (timeStamp - this.states.timeStamp) > this.states.speed)
			{
				this.states.timeStamp = timeStamp;
				this.states.direction = this.states.nextDirection;

				let snakeHead = this.snake[this.snake.length - 1];
				let newPosition:Position = {
					x: snakeHead.position.x + this.states.direction.x,
					y: snakeHead.position.y + this.states.direction.y
				}
				let newSnakeHead:SnakePart = {
					position: newPosition,
					direction: this.DIRECTION[this.states.direction.name]
				}
				this.snake.push(newSnakeHead);

				while(this.snake.length > this.states.snakeLength)
				{
					this.snake.shift();
				}

				this.draw();
			}

			window.requestAnimationFrame(time => this.tick(time));
		}
	}

	public start()
	{
		this.reset();
		this.states.speed = this.SETTINGS.snake.startSpeed;
		this.states.game = this.GAME_STATES.playing;
		this.tick(0);
	}

	private end()
	{
		this.states.game = this.GAME_STATES.ended;
	}
}
import '../styles.scss';
import './snake.scss';

import { Observable, Subscription, Subject } from "rxjs";

import { States, Position, SnakePart, Direction } from "./Interfaces";
import { Input } from './input';

export enum GAME_STATES
{
	ready = 'READY',
	playing = 'PLAYING',
	ended = 'ENDED',
	paused = 'PAUSED'
}

export class Snake
{
	private SETTINGS = {
		grid: {size: 10, rows: 20, columns: 28},
		game: {scoreIncrement: 10},
		snake: {startLength: 3, startSpeed: 300, speedIncrement: 10, minSpeed: 100, growBy: 2}
	}

	private DIRECTION = {
		up: 	{name: 'up', 	x: 0, 	y: -1},
		down: 	{name: 'down', 	x: 0, 	y: 1},
		left: 	{name: 'left', 	x: -1, 	y: 0},
		right: 	{name: 'right', x: 1, 	y: 0},
	}

	private states:States = {
		direction: this.DIRECTION.up,
		nextDirection: [this.DIRECTION.up],
		speed: 0,
		game: GAME_STATES.ready,
		timeStamp: 0,
		snakeLength: 0,
		score: 0
	}

	private board:HTMLElement;
	private grid:HTMLElement[] = [];
	private snake:SnakePart[] = [];
	private food:Position;
	private touchStartPosition:Position;

	// subjects

	public state:Subject<string> = new Subject();
	public score:Subject<number> = new Subject();
	public direction:Subject<string> = new Subject();

	// observables
	private keyPress:Observable<any>;
	private input:Input;

	// subscriptions
	private keyPressSubscription:Subscription;
	private touchStartSubscription:Subscription;
	private touchEndSubscription:Subscription;
	private keyRestartSubscription:Subscription;

	constructor(boardElement: HTMLElement)
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

		this.input = new Input(document.body);
	
		this.keyPress = Observable.fromEvent(document, "keydown")
			.filter((e:KeyboardEvent) => ['arrowright', 'arrowleft', 'arrowup', 'arrowdown'].indexOf(e.key.toLowerCase()) >= 0)
			.map((e:KeyboardEvent) => e.key.toLowerCase().replace('arrow',''))

		let onEnter = Observable.fromEvent(document, "keydown")
			.filter((e:KeyboardEvent) => ['enter'].indexOf(e.key.toLowerCase()) >= 0)
				
		this.touchStartSubscription = this.input.starts.subscribe((position:Position) => {
			this.touchStartPosition = position;
		})

		this.touchEndSubscription = this.input.ends.subscribe((position:Position) => 
		{
			let hDiff = this.touchStartPosition.x - position.x;	
			let hDiffAbs = Math.abs(hDiff);	
			let vDiff = this.touchStartPosition.y - position.y;
			let vDiffAbs = Math.abs(vDiff);
			
			if(hDiffAbs > 10 || vDiffAbs > 10)
			{
				if(hDiffAbs > vDiffAbs)
				{
					if(hDiff < 0) this.setDirection(this.DIRECTION['right']);
					else this.setDirection(this.DIRECTION['left']);
				}
				else
				{
					if(vDiff < 0) this.setDirection(this.DIRECTION['down']);
					else this.setDirection(this.DIRECTION['up']);
				}
			}
		})			

		this.keyPressSubscription = this.keyPress.subscribe((key: string) => 
		{
			if(this.states.game == GAME_STATES.playing)
			{
				this.setDirection(this.DIRECTION[key])
			}
		})

		this.keyRestartSubscription = onEnter.subscribe(e => this.start())
	}
	
	private checkDirection(setDirection:Direction, newDirection:Direction):boolean
	{
		return setDirection.x != newDirection.x && setDirection.y != newDirection.y;	
	}

	private setDirection(direction:Direction)
	{
		let queueable:boolean = false;

		if(this.states.direction.name != this.states.nextDirection[0].name)
		{
			//if a valid move we could queue this move
			if(this.states.nextDirection.length == 1 && this.checkDirection(this.states.nextDirection[0], direction))
			{
				queueable = true;
			}
		}

		if(queueable && this.checkDirection(this.states.nextDirection[0], direction)) this.states.nextDirection.push(direction);
		else if(this.checkDirection(this.states.direction, direction)) this.states.nextDirection = [direction];
	}

	public reset()
	{
		this.updateGameState(GAME_STATES.ready);

		this.snake = []
		this.states.direction = this.DIRECTION.up;
		this.states.nextDirection = [this.DIRECTION.up];
		this.states.snakeLength = this.SETTINGS.snake.startLength;
		this.updateScore(0);
		let center:Position = {x: Math.round(this.SETTINGS.grid.columns / 2), y: Math.round(this.SETTINGS.grid.rows / 2)};

		for(let i = 0; i < this.states.snakeLength; i++)
		{
			let snakePart:SnakePart = {
				position: {x: center.x, y: center.y + (i * 1)},
				direction: this.DIRECTION.up
			}

			this.snake.unshift(snakePart);
		}

		this.placeFood();

		this.draw();
	}

	private draw()
	{
		// reset all sqaures
		for(let i = 0; i < this.grid.length; i++) this.grid[i].className = '';

		// set snake squares
		for(let i = 0; i < this.snake.length; i++)
		{
			let classes = ['snake'];
			if(this.states.game == GAME_STATES.ended) classes.push('dead');
			if(i == 0) classes.push('tail');
			if(i == this.snake.length - 1) classes.push('head');
			let snakePart = this.snake[i];
			let nextSnakePart = this.snake[i + 1] ? this.snake[i + 1] : null;
			
			if(nextSnakePart && snakePart.direction.name != nextSnakePart.direction.name)
			{
				classes.push('turn-' + nextSnakePart.direction.name)
			}
			
			if(i == 0 && nextSnakePart)
			{
				classes.push(nextSnakePart.direction.name);
			}
			else
			{
				classes.push(snakePart.direction.name);
			}
			let gridIndex = this.getIndexFromPosition(snakePart.position);
			this.grid[gridIndex].className = classes.join(' ');
		}

		// set food sqaure

		let foodSquare = this.grid[this.getIndexFromPosition(this.food)];
		foodSquare.className = 'food';
	}

	private getIndexFromPosition(position:Position):number
	{
		return position.x + (position.y * this.SETTINGS.grid.columns);
	}

	private getPositionFromIndex(index:number):Position
	{
		let y = Math.floor(index / this.SETTINGS.grid.columns);
		let x = Math.floor(index % this.SETTINGS.grid.columns);
		return {x: x, y: y};
	}

	private eatFood()
	{
		this.addScore();
		this.states.snakeLength += this.SETTINGS.snake.growBy;
		this.states.speed -= this.SETTINGS.snake.speedIncrement;
		if(this.states.speed < this.SETTINGS.snake.minSpeed) this.states.speed = this.SETTINGS.snake.minSpeed;
		this.placeFood();
		
	}

	private updateGameState(newState:string)
	{
		this.states.game = newState;
		this.state.next(this.states.game);
	}

	private addScore()
	{
		this.updateScore(this.states.score + this.SETTINGS.game.scoreIncrement);
	}
	
	private updateScore(newScore:number)
	{
		this.states.score = newScore;
		this.score.next(this.states.score);
	}

	private placeFood()
	{
		let takenSpaces: number[] = [];
		for(let i = 0; i < this.snake.length; i++)
		{
			let index = this.getIndexFromPosition(this.snake[i].position);
			takenSpaces.push(index);
		}

		let availableSpaces: number[] = [];
		for(let i = 0; i < this.grid.length; i++)
		{
			if(takenSpaces.indexOf(i) < 0) availableSpaces.push(i);
		}

		let i = Math.floor(Math.random() * availableSpaces.length);
		this.food = this.getPositionFromIndex(availableSpaces[i]);
	}

	private tick(timeStamp:number)
	{
		if(this.states.game == GAME_STATES.playing)
		{
			if(!this.states.timeStamp || (timeStamp - this.states.timeStamp) > this.states.speed)
			{
				this.states.timeStamp = timeStamp;
				if(this.states.nextDirection.length > 1)
				{
					this.states.direction = this.states.nextDirection.shift();
				}
				else
				{
					this.states.direction = this.states.nextDirection[0];
				}
				this.direction.next(this.states.nextDirection[this.states.nextDirection.length - 1].name);

				let snakeHead = this.snake[this.snake.length - 1];
				let newPosition:Position = {
					x: snakeHead.position.x + this.states.direction.x,
					y: snakeHead.position.y + this.states.direction.y
				}

				// end the game if the new postion is out of bounds

				if(	newPosition.x < 0 || 
					newPosition.x > this.SETTINGS.grid.columns - 1 || 
					newPosition.y < 0 || 
					newPosition.y > this.SETTINGS.grid.rows - 1)
				{
					return this.end();
				}

				// end the game if the new position is already taken by snake

				for(let i = 0; i < this.snake.length; i++)
				{
					if(this.snake[i].position.x == newPosition.x && this.snake[i].position.y == newPosition.y)
					{
						return this.end();
					}
				}

				// all good to proceed with new snake head

				let newSnakeHead:SnakePart = {
					position: newPosition,
					direction: this.DIRECTION[this.states.direction.name]
				}
				this.snake.push(newSnakeHead);

				while(this.snake.length > this.states.snakeLength)
				{
					this.snake.shift();
				}

				// check if head is on food

				if(newSnakeHead.position.x == this.food.x && newSnakeHead.position.y == this.food.y)
				{
					this.eatFood();
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
		this.updateGameState(GAME_STATES.playing);
		this.tick(0);
	}

	private end()
	{
		console.warn('GAME OVER')
		this.updateGameState(GAME_STATES.ended);
		this.direction.next('');
		this.draw();
	}
}
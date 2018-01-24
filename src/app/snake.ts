import '../styles.scss';
import './snake.scss';

import { States, Position, SnakePart } from "./Interfaces";

export class Snake
{
	private SETTINGS = {
		grid: {size: 10, rows: 20, columns: 20},
		snake: {startLength: 3, startSpeed: 1, speedIncrement: 0.1}
	}

	private DIRECTION = {
		up: 	{name: 'up', 	x: 0, 	y: -1},
		down: 	{name: 'down', 	x: 0, 	y: 1},
		left: 	{name: 'left', 	x: -1, 	y: 0},
		right: 	{name: 'right', x: 1, 	y: 0},
	}

	private states:States = {
		direction: this.DIRECTION.up,
		speed: 0
	}

	private board:HTMLElement;
	private grid:HTMLElement[] = [];
	private snake:SnakePart[] = [];

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

		this.reset();
	}

	private getDirection()
	{

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

	public reset()
	{
		this.snake = []
		this.states.direction = this.DIRECTION.up;
		let center:Position = {x: Math.round(this.SETTINGS.grid.columns / 2), y: Math.round(this.SETTINGS.grid.rows / 2)};

		for(let i = 0; i < this.SETTINGS.snake.startLength; i++)
		{
			let snakePart:SnakePart = {
				position: {x: center.x, y: center.y + (i * 1)},
				direction: this.DIRECTION.up
			}

			this.snake.push(snakePart);
		}

		this.draw();
	}
}
import '../styles.scss';
import './snake.scss';

export class Snake
{
	private SETTINGS = {
		grid: {size: 10, rows: 20, columns: 20},
		snake: {startLength: 3, startSpeed: 10, speedIncrement: 0.1}
	}

	private board:HTMLElement;
	private grid:HTMLElement[] = [];

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
	}
}
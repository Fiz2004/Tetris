import Cell from '../Cell.js';
import { NUMBER_IMAGES_FIGURE } from '../const.js';

const FIGURE = [
	[[0, 1], [1, 1], [2, 1], [3, 1]],
	[[1, 1], [2, 1], [2, 2], [3, 2]],
	[[1, 1], [2, 1], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [1, 3]],
	[[1, 1], [1, 2], [2, 1], [2, 2]],
	[[1, 1], [2, 1], [1, 2], [1, 3]],
];

const NUMBER_CELL = 4;

export default class Figure {
	static numberCell = NUMBER_CELL;

	constructor() {
		this.createFigure();
	}

	createFigure() {
		this.cells = [];
		for (const [x, y] of FIGURE[Math.floor(Math.random() * FIGURE.length)]) {
			const view = Math.floor(Math.random() * NUMBER_IMAGES_FIGURE) + 1;
			this.cells.push(new Cell(x, y, view));
		}
	}
}

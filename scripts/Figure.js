import {
	NUMBER_IMAGES_FIGURE,
	FIGURE,
} from './const.js';
import Cell from './Cell.js';

export default class Figure {
	// Ячейки в фигуре
	cells;

	// Количество изображений для фигуры
	static numberCell = NUMBER_IMAGES_FIGURE;

	constructor() {
		this.cells = [];
		for (const [x, y] of FIGURE[Math.floor(Math.random() * FIGURE.length)])
			this.cells.push(new Cell(x, y, Math.floor(Math.random() * NUMBER_IMAGES_FIGURE) + 1));
	}
}

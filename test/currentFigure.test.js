import { strict as assert } from 'assert';
import CurrentFigure from '../scripts/Figure/CurrentFigure.js';
import Figure from '../scripts/Figure/Figure.js';
import Grid from '../scripts/grid.js';
import Cell from '../scripts/cell.js';

describe('CurrentFigure', () => {
	let currentFigure;
	let grid;
	let figure;

	beforeEach(() => {
		grid = new Grid(5, 5);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);
	});

	it('Проверяем движение влево', () => {
		currentFigure.position.x = 1;
		currentFigure.moveLeft();
		assert.equal(currentFigure.position.x, 0);
	})

	it('Проверяем движение влево близко со стеной', () => {
		currentFigure.position.x = 0;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		currentFigure.moveLeft();
		assert.equal(currentFigure.position.x, 0);

		currentFigure.position.x = 0;
		currentFigure.cells = [];
		for (const [x, y] of [[1, 1], [2, 1], [2, 2], [3, 2]])
			currentFigure.cells.push(new Cell(x, y, 0));

		currentFigure.moveLeft();
		assert.equal(currentFigure.position.x, -1);
	})

	it('Проверяем движение вправо', () => {
		currentFigure.position.x = 0;
		currentFigure.moveRight();
		assert.equal(currentFigure.position.x, 1);
	})

	it('Проверяем движение вправо близко со стеной', () => {
		currentFigure.position.x = 4;
		currentFigure.moveRight();
		assert.equal(currentFigure.position.x, 4);
	})

	it('Проверяем движение вниз', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.y = -1;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		let status = currentFigure.moveDown(1);
		assert.equal(currentFigure.position.y, 0);
		assert.equal(status, 'fall');
	})

	it('Проверяем движение вниз если препяствие рядом', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.x = 0;
		currentFigure.position.y = 0;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		grid.space[2][0].block = 1;

		let status = currentFigure.moveDown(1);
		assert.equal(currentFigure.position.y, 0);
		assert.equal(status, 'fixation');
	})

	it('Проверяем движение вниз если препяствие далеко, а двигаемся быстро', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.x = 0;
		currentFigure.position.y = 0;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		grid.space[2][0].block = 1;

		let status = currentFigure.moveDown(4);
		assert.equal(currentFigure.position.y, 0);
		assert.equal(status, 'fixation');
	})

	it('Проверяем движение вниз, условие конца игры', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.x = -1;
		currentFigure.position.y = -2;
		currentFigure.cells = [];
		for (const [x, y] of [[1, 1], [1, 2], [2, 1], [2, 2]])
			currentFigure.cells.push(new Cell(x, y, 0));

		grid.space[1][0].block = 1;

		let status = currentFigure.moveDown(1);
		assert.equal(currentFigure.position.y, -2);
		assert.equal(status, 'endGame');
	})

	it('Крайний случай Проверяем движение вниз, условие конца игры', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.x = 0;
		currentFigure.position.y = -2;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		grid.space[0][0].block = 1;

		let status = currentFigure.moveDown(1);
		assert.equal(currentFigure.position.y, -2);
		assert.equal(status, 'endGame');
	})

	it('Проверяем движение вниз у дна стакана при малом движении', () => {
		grid = new Grid(10, 10);
		figure = new Figure();
		currentFigure = new CurrentFigure(grid, figure);

		currentFigure.position.y = 8;
		currentFigure.cells = [];
		for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]])
			currentFigure.cells.push(new Cell(x, y, 0));

		let status = currentFigure.moveDown(0.5);
		assert.equal(currentFigure.position.y, 8);
		assert.equal(status, 'fixation');
	})

});

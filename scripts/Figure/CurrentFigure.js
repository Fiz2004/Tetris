import Point from '../Point.js';
import Figure from './Figure.js';

const START_STEP_MOVE_AUTO = 0.03;
const ADD_STEP_MOVE_AUTO = 0.1;
const STEP_MOVE_KEY_X = 1;
const STEP_MOVE_KEY_Y = 4;

export default class CurrentFigure extends Figure {
	constructor(grid, figure) {
		super();
		this.grid = grid;
		this.cells = [...figure.cells];
		this.stepMoveAuto = START_STEP_MOVE_AUTO;
		this.position = this.createStartPosition();
	}

	createStartPosition() {
		const width = this.cells.reduce((a, b) => (a.x > b.x ? a : b)).x;
		const height = this.cells.reduce((a, b) => (a.y > b.y ? a : b)).y;
		return new Point(Math.floor(Math.random() * (this.grid.width - 1 - width)), -1 - height);
	}

	getPositionTile(x = this.position.x, y = this.position.y) {
		return this.cells.map((cell) => new Point(cell.x + Math.ceil(x), cell.y + Math.ceil(y)));
	}

	fixation(scores) {
		const scoresForLevel = 300;
		this.stepMoveAuto = ADD_STEP_MOVE_AUTO
			+ ADD_STEP_MOVE_AUTO * Math.ceil(scores / scoresForLevel);
	}

	isCollission(x, y) {
		if (this.getPositionTile(x, y)
			.some(({ x: tileX, y: tileY }) => (
				tileX < 0 || tileX > this.grid.width - 1 || tileY > this.grid.height - 1
			)))
			return true;

		if (this.getPositionTile(x, y)
			.some((point) => (
				this.grid.isInside(point) && this.grid.space[point.y][point.x].block !== 0
			)))
			return true;

		return false;
	}

	rotate() {
		const oldCells = this.cells;
		this.cells = this.cells.map((cell) => ({ ...cell, ...{ x: 3 - cell.y, y: cell.x } }));
		if (this.isCollission(this.position.x, this.position.y))
			this.cells = oldCells;
	}

	moves({ left, right, up, down }) {
		if (left) this.moveLeft();
		if (right) this.moveRight();
		if (up) this.rotate();
		return this.moveDown(down ? STEP_MOVE_KEY_Y : this.stepMoveAuto);
	}

	moveLeft() {
		if (!this.isCollission(this.position.x - STEP_MOVE_KEY_X, this.position.y))
			this.position.x -= STEP_MOVE_KEY_X;
	}

	moveRight() {
		if (!this.isCollission(this.position.x + STEP_MOVE_KEY_X, this.position.y))
			this.position.x += STEP_MOVE_KEY_X;
	}

	moveDown(stepY) {
		const yStart = Math.ceil(this.position.y);
		const yEnd = Math.ceil(this.position.y + stepY);
		const yMax = this.getYMax(yStart, yEnd);

		if (this.isCheckCollisionIfMoveDown(yStart, yEnd)) {
			if (this.getPositionTile(this.position.x, yMax)
				.some(({ y }) => (y - 1) < 0))
				return 'endGame';
			this.position.y = yMax;

			return 'fixation';
		}

		this.position.y += stepY < 1 ? stepY : yMax - yStart;
		return 'fall';
	}

	getYMax = (yStart, yEnd) => {
		for (let y = yStart; y <= yEnd; y++)
			if (this.isCollission(this.position.x, y))
				return y - 1;

		return yEnd;
	};

	isCheckCollisionIfMoveDown = (yStart, yEnd) => {
		for (let y = yStart; y <= yEnd; y++)
			if (this.isCollission(this.position.x, y))
				return true;

		return false;
	};
}

import Point from '../Point.js';
import * as getSprite from '../getSpriteBeetle.js';
import {
	NUMBER_FRAMES_BEEATLE_MOVE,
} from '../const.js';

const CHARACTER_SPEED_LINE = 30;
const CHARACTER_SPEED_ROTATE = 45;

export default class Character {
	constructor(grid) {
		// !Сделать определение ширины и высоты жука програмным, чтобы не зависит от вида картинки
		this.width = 24;
		this.height = 24;

		this.position = new Point(Math.floor(Math.random() * grid.width), grid.height - 1);
		this.speed = { line: 0, rotate: 0 };
		this.angle = 90;

		this.moves = [];
		this.move = new Point(0, 0);
		this.lastDirection = 1;
	}

	get posTileX() {
		return Math.round(this.position.x);
	}

	get posTileY() {
		return Math.round(this.position.y);
	}

	get posTile() {
		return new Point(this.posTileX, this.posTileY);
	}

	get directionX() {
		return Math.round(Math.cos(this.angle * (Math.PI / 180)));
	}

	get directionY() {
		return Math.round(Math.sin(this.angle * (Math.PI / 180)));
	}

	update(grid) {
		this.changePosition();

		if (this.isNewFrame())
			return this.updateNewFrame(grid);

		return true;
	}

	changePosition() {
		if (this.speed.rotate === 0) {
			this.position.x += this.speed.line * this.directionX;
			this.position.y += this.speed.line * this.directionY;
		} else {
			this.angle += this.speed.rotate;
			this.angle %= 360;
		}
	}

	isNewFrame() {
		return (
			this.position.x % 1 < (1 / CHARACTER_SPEED_LINE)
			|| this.position.x % 1 > (1 - (1 / CHARACTER_SPEED_LINE))
		) && (this.position.y % 1 < (1 / CHARACTER_SPEED_LINE)
			|| this.position.y % 1 > (1 - (1 / CHARACTER_SPEED_LINE))
			) && ((this.angle / CHARACTER_SPEED_ROTATE) % 2 < 0.01
				|| (this.angle / CHARACTER_SPEED_ROTATE) % 2 > 1.99
			);
	}

	updateNewFrame(grid) {
		this.moves = this.getDirection(grid);

		if (this.move.x === this.moves[0].x && this.move.y === this.moves[0].y) {
			if (this.isMoveStraight())
				this.move = this.moves.shift();
		} else {
			[this.move] = this.moves;
		}

		this.speed = this.getSpeedAngle();

		return true;
	}

	isMoveStraight() {
		return this.directionX === this.move.x && this.directionY === this.move.y;
	}

	getSpeedAngle() {
		const angle = Math.atan2(this.move.y, this.move.x) * (180 / Math.PI);
		let sign = 1;
		if ((this.angle - angle) > 0 && (this.angle - angle) < 180)
			sign = -1;

		if (this.isMoveStraight())
			return { rotate: 0, line: 1 / 10 };

		return { rotate: sign * CHARACTER_SPEED_ROTATE, line: 0 };
	}

	getDirectionMovement() {
		this.direction = {
			x: this.directionX,
			y: this.directionY,
		};
		if (this.directionX === -1 && this.directionY === 1) {
			this.direction.x = -1;
			this.direction.y = 0;
		}
		if (this.directionX === -1 && this.directionY === -1) {
			this.direction.x = 0;
			this.direction.y = -1;
		}
		if (this.directionX === 1 && this.directionY === 1) {
			this.direction.x = 0;
			this.direction.y = 1;
		}
		if (this.directionX === 1 && this.directionY === -1) {
			this.direction.x = 1;
			this.direction.y = 0;
		}
		return `${[this.direction.x, this.direction.y, this.move.x, this.move.y].join('')}`;
	}

	getDirection(grid) {
		// Проверяем свободен ли выбранный путь при фиксации фигуры
		if (this.deleteRow === 1
			&& this.moves === this.isCanMove([this.moves], grid))
			this.deleteRow = 0;

		if (this.moves.length === 0 || this.deleteRow === 1)
			return this.getNewDirection(grid);

		return this.moves;
	}

	getNewDirection(grid) {
		const DIRECTION = getDIRECTION();
		this.deleteRow = 0;
		// Если двигаемся вправо
		if ((
			(this.speed.line === 0 && this.speed.rotate === 0)
			&& this.move.x === 1
		) || this.move.x === 1) {
			this.lastDirection = 1;
			return this.isCanMove([...DIRECTION.RIGHTDOWN, ...DIRECTION.RIGHT, ...DIRECTION.LEFT], grid);
		}
		// Если двигаемся влево
		if ((
			(this.speed.line === 0 && this.speed.rotate === 0)
			&& this.move.x === -1
		) || this.move.x === -1) {
			this.lastDirection = -1;
			return this.isCanMove([...DIRECTION.LEFTDOWN, ...DIRECTION.LEFT, ...DIRECTION.RIGHT], grid);
		}

		if (this.lastDirection === -1)
			return this.isCanMove([...[DIRECTION['0D']], ...DIRECTION.LEFT, ...DIRECTION.RIGHT], grid);

		return this.isCanMove([...[DIRECTION['0D']], ...DIRECTION.RIGHT, ...DIRECTION.LEFT], grid);
	}

	isCanMove(arrayDirectionses, grid) {
		for (const directions of arrayDirectionses)
			if (this.isCanDirections(directions, grid))
				return directions;

		return [{ x: 0, y: 0 }];
	}

	isCanDirections(directions, grid) {
		let addPoint = new Point(0, 0);
		for (const direction of directions) {
			addPoint = addPoint.plus(direction);
			const point = this.posTile.plus(addPoint);
			if (grid.isOutside(point) || grid.isNotFree(point))
				return false;
		}

		return true;
	}

	// Исходя из данных определяет спрайт для рисования
	getSprite() {
		const framesAnimation = getFrames(this.move, this.position);
		// Если жук ест
		if (this.isEatingNow())
			return getSprite.EatingNow(this.getDirectionMovement(), framesAnimation);

		return getSprite.NoEatingNow(this.getDirectionMovement(), framesAnimation);
	}
}

function getDIRECTION() {
	const result = {};
	result.L = { x: -1, y: 0 };
	result.R = { x: 1, y: 0 };
	result.D = { x: 0, y: 1 };
	result.U = { x: 0, y: -1 };
	result['0'] = { x: 0, y: 0 };
	result['0D'] = [{ x: 0, y: 1 }];
	result.RD = [result.D, result.R];
	result.LD = [result.D, result.L];
	result.R0 = [result.R];
	result.L0 = [result.L];
	result.RU = [result.U, result.R];
	result.LU = [result.U, result.L];
	result.RUU = [result.U, result.U, result.R];
	result.LUU = [result.U, result.U, result.L];
	result.LEFTDOWN = [result['0D'], result.LD, result.RD];
	result.RIGHTDOWN = [result['0D'], result.RD, result.LD];
	result.LEFT = [result.L0, result.LU, result.LUU];
	result.RIGHT = [result.R0, result.RU, result.RUU];
	return result;
}

function getframe(coor) {
	if (coor % 1 > 0.01 && coor % 1 < 0.99)
		return Math.ceil((coor % 1) * NUMBER_FRAMES_BEEATLE_MOVE);

	return 0;
}

function getFramesDirect(direct, position) {
	if (direct === 1)
		return getframe(position);

	if (direct === -1) {
		if (getframe(position) !== 0)
			return NUMBER_FRAMES_BEEATLE_MOVE + 1 - getframe(position);

		return 0;
	}

	return false;
}

export function getFrames(direct, position) {
	let result;
	result = getFramesDirect(direct.x, position.x);
	if (result !== false) return result;

	result = getFramesDirect(direct.y, position.y);
	if (result !== false) return result;

	return 0;
}

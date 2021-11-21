import Character from './Character.js';
import Point from '../Point.js';
import * as getSprite from '../getSpriteBeetle.js';
import {
	NUMBER_FRAMES_BEEATLE_MOVE,
} from '../const.js';

const CHARACTER_SPEED_ROTATE = 45;
const PROBABILITY_EAT = 20 / 100;

export default class CharacterEat extends Character {
	constructor(grid) {
		super(grid);

		this.eat = 0;
		this.deleteRow = 0;
	}

	update(grid) {
		const { eat } = this;
		this.eat = 0;
		const statusUpdate = super.update(grid);

		if (this.isNewFrame()) {
			if (eat === 1)
				return 'eat';

			return true;
		}

		if (eat === 1 && this.isMoveStraight()) {
			this.eat = 1;
			return 'eatDestroy';
		}

		return statusUpdate;
	}

	getDirectionEat() {
		if (this.move.x === -1 && this.move.y === 0)
			return 'R';

		if (this.move.x === 1 && this.move.y === 0)
			return 'L';

		if (this.move.x === 0 && this.move.y === 1)
			return 'U';

		throw new Error('Error: uncorrect value function getDirectionEat');
	}

	getSpeedAngle() {
		const angle = Math.atan2(this.move.y, this.move.x) * (180 / Math.PI);
		let sign = 1;
		if ((this.angle - angle) > 0 && (this.angle - angle) < 180)
			sign = -1;

		if (Math.round(Math.cos(this.angle * (Math.PI / 180))) === this.move.x
			&& Math.round(Math.sin(this.angle * (Math.PI / 180))) === this.move.y)
			return { rotate: 0, line: 1 / 10 };

		return { rotate: sign * CHARACTER_SPEED_ROTATE, line: 0 };
	}

	getDirectionMovement() {
		this.direction = {};
		this.direction.x = Math.round(Math.cos(this.angle * (Math.PI / 180)));
		this.direction.y = Math.round(Math.sin(this.angle * (Math.PI / 180)));
		if (this.direction.x === -1 && this.direction.y === 1) {
			this.direction.x = -1;
			this.direction.y = 0;
		}
		if (this.direction.x === -1 && this.direction.y === -1) {
			this.direction.x = 0;
			this.direction.y = -1;
		}
		if (this.direction.x === 1 && this.direction.y === 1) {
			this.direction.x = 0;
			this.direction.y = 1;
		}
		if (this.direction.x === 1 && this.direction.y === -1) {
			this.direction.x = 1;
			this.direction.y = 0;
		}
		return `${[this.direction.x, this.direction.y, this.move.x, this.move.y].join('')}`;
	}

	isEatingNow() {
		return this.eat === 1 && !this.isNewFrame()
			&& (this.isMoveStraight());
	}

	isCanMove(arrayDirectionses, grid) {
		for (const directions of arrayDirectionses)
			if (this.isCanDirections(directions, grid, (Math.random()) < PROBABILITY_EAT))
				return directions;

		return [{ x: 0, y: 0 }];
	}

	isCanDirections(directions, grid, isDestoy) {
		const result = [];
		let addPoint = new Point(0, 0);
		for (const direction of directions) {
			addPoint = addPoint.plus(direction);
			const point = this.posTile.plus(addPoint);

			if (grid.isOutside(point))
				return false;

			result.push(direction);

			if (grid.isNotFree(point)) {
				if (addPoint.y === 0 && isDestoy) {
					this.eat = 1;
					return result;
				}
				return false;
			}
		}

		return result;
	}

	// Исходя из данных определяет спрайт для рисования
	getSprite() {
		// console.log('angle=', this.angle);
		// console.log('speed=', this.speed);
		if (this.angle === 0 && this.speed.line !== 0 && getframe(this.position.x) === -1)
			return { x: 2, y: 0 };
		if (this.angle === 0 && this.speed.line !== 0)
			return { x: getframe(this.position.x), y: 1 };

		if (this.angle === 180 && this.speed.line !== 0 && getframe(this.position.x) === -1)
			return { x: 6, y: 0 };
		if (this.angle === 180 && this.speed.line !== 0)
			return { x: 4 - getframe(this.position.x), y: 2 };

		if (this.angle === 90 && this.speed.line !== 0 && getframe(this.position.y) === -1)
			return { x: 0, y: 0 };
		if (this.angle === 90 && this.speed.line !== 0)
			return { x: getframe(this.position.y), y: 4 };

		if (this.angle === 270 && this.speed.line !== 0 && getframe(this.position.y) === -1)
			return { x: 4, y: 0 };
		if (this.angle === 270 && this.speed.line !== 0)
			return { x: getframe(this.position.y), y: 3 };

		if (this.speed.rotate !== 0 && this.angle === 0)
			return { x: 2, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 45)
			return { x: 1, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 90)
			return { x: 0, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 135)
			return { x: 7, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 180)
			return { x: 6, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 225)
			return { x: 5, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 270)
			return { x: 4, y: 0 };
		if (this.speed.rotate !== 0 && this.angle === 315)
			return { x: 3, y: 0 };

		const framesAnimation = getFrames(this.move, this.position);
		// Если жук ест
		if (this.isEatingNow())
			return getSprite.EatingNow(this.getDirectionMovement(), framesAnimation);

		return getSprite.NoEatingNow(this.getDirectionMovement(), framesAnimation);
	}
}

function getframe(coor) {
	if (coor % 1 > 0.01 && coor % 1 < 0.99)
		return Math.floor((coor % 1) * NUMBER_FRAMES_BEEATLE_MOVE);

	return -1;
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

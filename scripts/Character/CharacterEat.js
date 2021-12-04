import Character from './Character.js';
import Point from '../Point.js';
import {
	NUMBER_FRAMES_BEEATLE_MOVE,
} from '../const.js';

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

	getSprite() {
		if (!this.eat)
			return super.getSprite();

		if (this.angle === 0 && this.speed.line !== 0 && getframe(this.position.x) === -1)
			return { x: 2, y: 0 };
		if (this.angle === 0 && this.speed.line !== 0)
			return { x: getframe(this.position.x), y: 5 };

		if (this.angle === 180 && this.speed.line !== 0 && getframe(this.position.x) === -1)
			return { x: 6, y: 0 };
		if (this.angle === 180 && this.speed.line !== 0)
			return { x: 4 - getframe(this.position.x), y: 6 };

		if (this.angle === 90 && this.speed.line !== 0 && getframe(this.position.y) === -1)
			return { x: 0, y: 0 };
		if (this.angle === 90 && this.speed.line !== 0)
			return { x: getframe(this.position.y), y: 8 };

		if (this.angle === 270 && this.speed.line !== 0 && getframe(this.position.y) === -1)
			return { x: 4, y: 0 };
		if (this.angle === 270 && this.speed.line !== 0)
			return { x: getframe(this.position.y), y: 7 };

		return { x: 0, y: 0 };
	}
}

function getframe(coor) {
	if (coor % 1 > 0.01 && coor % 1 < 0.99)
		return Math.floor((coor % 1) * NUMBER_FRAMES_BEEATLE_MOVE);

	return -1;
}

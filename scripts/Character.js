import Point from './Point.js';
import * as getSprite from './getSpriteBeetle.js';
import {
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_BEEATLE_MOVE,
	PROBABILITY_EAT,
} from './const.js';

const CHARACTER_SPEED_LINE = 30;
const CHARACTER_SPEED_ROTATE = 45;

// Класс для жука
export default class Character {
	// Позиция относительно клетки
	position;
	// Угол поворота
	angle;
	// Текущее направление до конца анимации
	direction;
	// Направление движения, массивом с указанием смещения
	lastDirection;
	// Направление движения, массивом с указанием смещения
	move;
	// массив Направлений движения, массивом с указанием смещения
	moves;
	// Текущий кадр анимации от 1 до NUMBER_FRAMES_BEEATLE
	framesAnimation;
	// Показывает задыхаемся мы или нет
	breath;
	// Время которое прошло с момента нехватки дыхания
	timeBreath;
	// Происходит ли удаление строки
	deleteRow;
	// Ест ли жук
	eat;
	// Выоота и ширина спрайта жука
	width;
	height;
	// Вспомогательная сетка для ссылки на сетку
	grid;

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

		this.eat = 0;
		this.deleteRow = 0;

		// Задаем время для дыхания после истечения которого будет проигрыш
		this.timeBreath = Date.now();
		// С самого начала жук дышит
		this.breath = false;
	}

	update(grid) {
		this.changePosition();
		if (this.isNewFrame())
			return this.updateNewFrame(grid);

		// Если не новый кадр
		this.direction = {};
		this.direction.x = Math.round(Math.cos(this.angle * (Math.PI / 180)));
		this.direction.y = Math.round(Math.sin(this.angle * (Math.PI / 180)));

		if (this.eat === 1
			&& (this.direction.x === this.move.x && this.direction.y === this.move.y))
			return 'eatDestroy';

		return true;
	}

	changePosition() {
		if (this.speed.rotate === 0) {
			this.position.x += this.speed.line * Math.cos(this.angle * (Math.PI / 180));
			this.position.y += this.speed.line * Math.sin(this.angle * (Math.PI / 180));
		} else {
			this.angle += this.speed.rotate;
			this.angle %= 360;
		}
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
		const { eat } = this;
		this.eat = 0;

		this.moves = this.getDirection(grid);

		if (this.move.x === this.moves[0].x && this.move.y === this.moves[0].y) {
			if (Math.round(Math.cos(this.angle * (Math.PI / 180))) === this.move.x
				&& Math.round(Math.sin(this.angle * (Math.PI / 180))) === this.move.y)
				this.move = this.moves.shift();
		} else {
			[this.move] = this.moves;
		}

		this.speed = this.getSpeedAngle();

		if (eat === 1)
			return 'eat';

		return true;
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

	// Проверяем есть ли доступ к верху стакана
	isBreath(grid) {
		const tile = new Point(Math.round(this.position.x), Math.round(this.position.y));
		this.breath = this.findWay(tile, [], grid);
		if (this.breath) this.timeBreath = Date.now();
		return this.breath;
	}

	findWay(tile, cash, grid) {
		if (tile.y === 0)
			return true;

		cash.push({ x: tile.x, y: tile.y });
		for (const element of [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }])
			if (grid.isInside({ x: tile.x + element.x, y: tile.y + element.y })
				&& grid.space[tile.y + element.y][tile.x + element.x].element === 0
				&& !cash.find(({ x, y }) => tile.x + element.x === x && tile.y + element.y === y)
				&& this.findWay(new Point(tile.x + element.x, tile.y + element.y), cash, grid))
				return true;

		return false;
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

	// Проверяем ест ли жук сейчас
	isEatingNow() {
		return this.eat === 1 && this.frames !== NUMBER_FRAMES_BEEATLE - 1
			&& (this.direction.x === this.move.x && this.direction.y === this.move.y);
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
			if (this.isCanDirections(directions, grid, (Math.random()) < PROBABILITY_EAT))
				return directions;

		return [{ x: 0, y: 0 }];
	}

	isCanDirections(directions, grid, isDestoy) {
		let result = [];
		let TekX = 0;
		let TekY = 0;
		result = [];
		for (const { x, y } of directions) {
			TekX += x;
			TekY += y;
			const point = {
				x: Math.round(this.position.x) + TekX,
				y: Math.round(this.position.y) + TekY,
			};

			if (grid.isOutside(point))
				return false;

			result.push({ x, y });

			if (grid.isNotFree(point)) {
				if (TekY === 0 && isDestoy) {
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

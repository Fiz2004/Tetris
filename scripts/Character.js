import Point from './Point.js';
import * as getSprite from './getSpriteBeetle.js';
import {
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS,
	NUMBER_FRAMES_BEEATLE_MOVE,
} from './const.js';
import getDirection from "./FindWayRun.js"

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
		this.move = new Point(-1, 0);
		this.lastDirection = -1;

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
		[this.direction.x, this.direction.y] = [Math.round(Math.cos(this.angle * Math.PI / 180)), Math.round(Math.sin(this.angle * Math.PI / 180))];

		if (this.eat === 1
			&& (this.direction.x === this.move.x && this.direction.y === this.move.y)) {
			let offsetX = this.move.x;
			const offsetY = this.move.y;
			const direction = this.getDirectionEat(this.move);
			if (offsetX === -1) offsetX = 0;

			const tile = new Point(Math.floor(this.position.x) + offsetX, Math.floor(this.position.y) + offsetY);
			grid.space[tile.y][tile.x].status[direction] = Math.round(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_ELEMENTS)) + 1;
		}
	}

	changePosition() {
		if (this.speed.rotate === 0) {
			this.position.x += this.speed.line * Math.cos(this.angle * (Math.PI / 180));
			this.position.y += this.speed.line * Math.sin(this.angle * (Math.PI / 180));
		} else {
			this.angle += this.speed.rotate;
		}
	}

	getDirectionEat({ x, y }) {
		if (x === -1 && y === 0) {
			return 'R';
		}
		if (x === 1 && y === 0) {
			return 'L';
		}
		if (x === 0 && y === 1) {
			return 'U';
		}
		throw new Error('Error: uncorrect value function getDirectionEat');
	}

	isNewFrame() {
		return (this.position.x % 1 < (1 / CHARACTER_SPEED_LINE) || this.position.x % 1 > (1 - (1 / CHARACTER_SPEED_LINE)))
			&& (this.position.y % 1 < (1 / CHARACTER_SPEED_LINE) || this.position.y % 1 > (1 - (1 / CHARACTER_SPEED_LINE)))
			&& ((this.angle / CHARACTER_SPEED_ROTATE) % 2 < 0.01 || (this.angle / CHARACTER_SPEED_ROTATE) % 2 > 1.99)
	}

	updateNewFrame(grid) {
		getDirection(this, grid);

		if (this.eat === 1) {
			this.eat = 0;

			const tile = new Point(Math.round(this.position.x), Math.round(this.position.y));
			grid.space[tile.y][tile.x].status = { L: 0, R: 0, U: 0 };
			grid.space[tile.y][tile.x].element = 0;
			return 'eat'
		}
	}

	// Проверяем есть ли доступ к верху стакана
	isBreath(grid) {
		const tile = new Point(Math.round(this.position.x), Math.round(this.position.y));
		this.breath = this.findWay(tile, [], grid);
		if (this.breath) { this.timeBreath = Date.now(); }
		return this.breath;
	}

	findWay(tile, cash, grid) {
		if (tile.y === 0) {
			return true;
		}
		cash.push([tile.x, tile.y]);
		for (const element of [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]) {
			const filterCash = cash.filter((el) => tile.x + element.x === el[0] && tile.y + element.y === el[1]).length === 0;
			if (grid.isInside({ x: tile.x + element.x, y: tile.y + element.y })
				&& grid.space[tile.y + element.y][tile.x + element.x].element === 0
				&& filterCash
				&& this.findWay(new Point(tile.x + element.x, tile.y + element.y), cash, grid)) {
				return true;
			}
		}
		return false;
	}

	// Получить напарвления движения
	getDirectionMovement() {
		this.direction = {};
		[this.direction.x, this.direction.y] = [Math.round(Math.cos(this.angle * Math.PI / 180)), Math.round(Math.sin(this.angle * Math.PI / 180))]
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

	// Исходя из данных определяет спрайт для рисования
	getSprite() {
		const framesAnimation = getFrames(this.move, this.position, this.angle);
		// Если жук ест
		if (this.isEatingNow()) {
			return getSprite.EatingNow(this.getDirectionMovement(), framesAnimation);
		}
		return getSprite.NoEatingNow(this.getDirectionMovement(), framesAnimation);
	}

}

function getframe(coor) {
	if (coor % 1 > 0.01 && coor % 1 < 0.99) {
		return Math.ceil((coor % 1) * NUMBER_FRAMES_BEEATLE_MOVE);
	}
	return 0;
}

function getFrames(direct, position, angle) {
	let result;
	if (angle)
		result = getFramesDirect(direct.x, position.x);
	if (result !== false) return result;

	result = getFramesDirect(direct.y, position.y);
	if (result !== false) return result;

	return 0;
}

function getFramesDirect(direct, position) {
	if (direct === 1) {
		return getframe(position);
	}

	if (direct === -1) {
		if (getframe(position) !== 0) {
			return NUMBER_FRAMES_BEEATLE_MOVE + 1 - getframe(position);
		}
		return 0;
	}

	return false;
}

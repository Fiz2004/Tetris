import { Point } from './class.js';
import * as getSprite from './getSpriteBeetle.js';
import {
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_BEEATLE_ROTATE,
	NUMBER_FRAMES_ELEMENTS,
	PROBABILITY_EAT,
} from './const.js';

// Класс для жука
export class Beetle {
	// Позиция относительно клетки
	position;
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
		//! Сделать определение ширины и высоты жука програмным, чтобы не зависит от вида картинки
		this.width = 24;
		this.height = 24;

		// this.position = new Point(Math.floor(Math.random() * grid.width), (grid.height - 1));
		this.position = new Point(1, 24);

		this.direction = new Point(0, 0);
		this.moves = [];
		this.move = new Point(0, 0);
		this.lastDirection = 'L';
		this.eat = 0;
		this.deleteRow = 0;
		this.frames = NUMBER_FRAMES_BEEATLE;

		// Задаем время для дыхания после истечения которого будет проигрыш
		this.timeBreath = Date.now();
		// С самого начала жук дышит
		this.breath = false;

		this.framesAnimation = 0;

		this.deltaTime = 0;
	}

	//Метод движения жука
	update(grid) {
		// Если происходит поворот то не двигаемся
		if (this.direction.x === this.move.x && this.direction.y === this.move.y) {
			if (this.move.y === 0) {
				this.position.x += this.move.x * (1 / NUMBER_FRAMES_BEEATLE);
			}

			this.position.y += this.move.y * (1 / NUMBER_FRAMES_BEEATLE);
		}

		if (this.eat === 1 && (this.direction.x === this.move.x && this.direction.y === this.move.y)
			&& this.framesAnimation !== this.frames - 1) {
			let offsetX = this.move.x;
			const offsetY = this.move.y;
			const direction = this.getDirectionEat(this.move);
			if (offsetX === -1) {
				offsetX = 0;
			}
			const tile = new Point(Math.floor(this.position.x), Math.floor(this.position.y));
			grid.space[tile.y + offsetY][tile.x + offsetX].status[direction]
				= Math.round(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_ELEMENTS)) + 1;
		}

		return this.getCurrentFramesAnimation(grid);
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

	//Определяем текущий кадр
	getCurrentFramesAnimation(grid) {
		let eat = false;
		if (this.framesAnimation === this.frames - 1) {
			if (this.eat === 1 && this.frames === NUMBER_FRAMES_BEEATLE) {
				this.eat = 0;
				eat = true;
				//Вызываем функцию обработчика того что сьели
				const tile = new Point(Math.round(this.position.x), Math.round(this.position.y));
				grid.space[tile.y][tile.x].status = { L: 0, R: 0, U: 0 };
				grid.space[tile.y][tile.x].element = 0;
			}
			this.getDirection(grid);
			this.framesAnimation = 0;
			if (eat) {
				return 'eat';
			}
		} else {
			this.framesAnimation += 1;
		}
	}

	//Функция для определения направления движения жука
	getDirection(grid) {
		// Проверяем свободен ли выбранный путь при фиксации фигуры
		if (this.deleteRow === 1 &&
			this.moves === this.isCanMove([this.moves], grid)) {
			this.deleteRow = 0;
		}

		if (this.moves.length === 0 || this.deleteRow === 1) {
			this.moves = this.getNewDirection(grid);
		}

		const startMove = { ...this.move };
		if (startMove.x === this.moves[0].x && startMove.y === this.moves[0].y) {
			this.move = this.moves.shift();
		} else {
			this.move = this.moves[0];
		}
		this.frames = this.getFrameRotate({ ...startMove }, this.move);
		this.direction = { ...startMove };
	}

	isCanMove = (arrayDirectionses, grid) => {
		for (const directions of arrayDirectionses) {
			if (this.isCanDirections(directions, grid)) {
				return directions;
			}
		}

		return [{ x: 0, y: 0 }];
	};

	isCanDirections = (directions, grid) => {
		let TekX = 0;
		let TekY = 0;
		for (const direction of directions) {
			TekX += direction.x;
			TekY += direction.y;
			const point = {
				x: Math.round(this.position.x) + TekX,
				y: Math.round(this.position.y) + TekY,
			};
			// Если смещение попадает за границы стакана, сказать что туда нельзя
			if (!grid.isInside(point)) {
				return false;
			}

			// Проверить свободен ли элемент при смещении
			if (!grid.isFree(point)) {
				if (TekY === 0 && (Math.random() * 100 < PROBABILITY_EAT)) {
					this.eat = 1;
					directions.length = directions.indexOf(direction) + 1;
					return true;
				}
				return false;
			}
		}
		return true;
	};

	getNewDirection(grid) {
		const DIRECTION = {};
		DIRECTION['L'] = { x: -1, y: 0 };
		DIRECTION['R'] = { x: 1, y: 0 };
		DIRECTION['D'] = { x: 0, y: 1 };
		DIRECTION['U'] = { x: 0, y: -1 };
		DIRECTION['0'] = { x: 0, y: 0 };
		DIRECTION['0D'] = [{ x: 0, y: 1 }];
		DIRECTION['RD'] = [DIRECTION['D'], DIRECTION['R']];
		DIRECTION['LD'] = [DIRECTION['D'], DIRECTION['L']];
		DIRECTION['R0'] = [DIRECTION['R']];
		DIRECTION['L0'] = [DIRECTION['L']];
		DIRECTION['RU'] = [DIRECTION['U'], DIRECTION['R']];
		DIRECTION['LU'] = [DIRECTION['U'], DIRECTION['L']];
		DIRECTION['RUU'] = [DIRECTION['U'], DIRECTION['U'], DIRECTION['R']];
		DIRECTION['LUU'] = [DIRECTION['U'], DIRECTION['U'], DIRECTION['L']];
		DIRECTION['LEFTDOWN'] = [DIRECTION['0D'], DIRECTION['LD'], DIRECTION['RD']];
		DIRECTION['RIGHTDOWN'] = [DIRECTION['0D'], DIRECTION['RD'], DIRECTION['LD']];
		DIRECTION['LEFT'] = [DIRECTION['L0'], DIRECTION['LU'], DIRECTION['LUU']];
		DIRECTION['RIGHT'] = [DIRECTION['R0'], DIRECTION['RU'], DIRECTION['RUU']];

		this.deleteRow = 0;
		const code = '' + [this.direction.x, this.direction.y, this.move.x, this.move.y].join('');
		// Если двигаемся вправо
		if (code === '0010' || code === '1010') {
			this.lastDirection = 'R';
			return this.isCanMove([...DIRECTION['RIGHTDOWN'], ...DIRECTION['RIGHT'], ...DIRECTION['LEFT']], grid);
		}
		// Если двигаемся влево
		if (code === '00-10' || code === '-10-10') {
			this.lastDirection = 'L';
			return this.isCanMove([...DIRECTION['LEFTDOWN'], ...DIRECTION['LEFT'], ...DIRECTION['RIGHT']], grid);
		}

		if (this.lastDirection === 'L') {
			return this.isCanMove([...[DIRECTION['0D']], ...DIRECTION['LEFT'], ...DIRECTION['RIGHT']], grid);
		} else {
			return this.isCanMove([...[DIRECTION['0D']], ...DIRECTION['RIGHT'], ...DIRECTION['LEFT']], grid);
		}

	}

	getFrameRotate(direction, move) {
		// !Добавить если с 0 поворачиваемся на лево или направо, а также если в 0
		if (direction.x === move.x && direction.y === move.y) {
			return NUMBER_FRAMES_BEEATLE;
		} else if (direction.x === 0 && direction.y === 0) {
			return NUMBER_FRAMES_BEEATLE_ROTATE;
		} else {
			//?? При изменении кадров надо задавать другое значение
			return Math.floor(NUMBER_FRAMES_BEEATLE / 2);
		}
	}

	// Проверяем есть ли доступ к верху стакана
	isBreath(grid) {
		const tile = new Point(Math.round(this.position.x), Math.round(this.position.y));
		this.breath = this.findWay(tile, [], grid);
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
		return '' + [this.direction.x, this.direction.y, this.move.x, this.move.y].join('');
	}

	// Проверяем ест ли жук сейчас
	isEatingNow() {
		return this.eat === 1 && this.frames !== NUMBER_FRAMES_BEEATLE - 1
			&& (this.direction.x === this.move.x && this.direction.y === this.move.y);
	}

	// Исходя из данных определяет спрайт для рисования
	getSprite() {
		// Если жук ест
		if (this.isEatingNow()) {
			return getSprite.EatingNow(this.getDirectionMovement(), this.framesAnimation);
		} else {
			return getSprite.NoEatingNow(this.getDirectionMovement(), this.framesAnimation);
		}
	}
}

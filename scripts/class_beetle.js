import { Point } from './class.js';
import {
	SIZE_TILES,
	NUMBER_FRAMES_BEEATLE, NUMBER_FRAMES_BEEATLE_ROTATE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT,
	NUMBER_FRAMES_BEEATLE_MOVE, TIMES_BREATH_LOSE
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
	breath
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
		this.grid = grid;
		//! Сделать определение ширины и высоты жука програмным, чтобы не зависит от вида картинки
		this.width = 24;
		this.height = 24;

		this.position = new Point(Math.floor(Math.random() * this.grid.width) * SIZE_TILES, ((this.grid.height - 1) * SIZE_TILES));

		//Установить случайное движение
		this.direction = new Point(0, 0);
		this.moves = [];
		this.move = new Point(0, 0);
		this.lastDirection = "R";
		this.eat = 0;
		this.deleteRow = 0;
		this.frames = NUMBER_FRAMES_BEEATLE;

		// Задаем время для дыхания после истечения которого будет проигрыш
		this.timeBreath = Date.now();
		// С самого начала жук дышит
		this.breath = false;

		// this.getDirection();
		this.framesAnimation = 0;

		this.deltaTime = 0;
	};
	getPositionTile() {

	}
	//Метод движения жука
	beetleAnimation() {
		// Если происходит поворот то не двигаемся
		if (this.direction.x === this.move.x && this.direction.y === this.move.y) {
			if (this.move.y === 0)
				this.position.x += this.move.x * (SIZE_TILES / NUMBER_FRAMES_BEEATLE);
			this.position.y += this.move.y * (SIZE_TILES / NUMBER_FRAMES_BEEATLE);
		}

		if (this.eat === 1 && (this.direction.x === this.move.x && this.direction.y === this.move.y)
			&& this.framesAnimation !== this.frames - 1) {
			let offsetX = this.move.x;
			let offsetY = this.move.y;
			let direction;
			if (offsetX === -1 && offsetY === 0) direction = "R";
			if (offsetX === 1 && offsetY === 0) direction = "L";
			if (offsetX === 0 && offsetY === 1) direction = "U";
			if (offsetX === -1) offsetX = 0;
			let tile = new Point(Math.floor(this.position.x / SIZE_TILES), Math.floor(this.position.y / SIZE_TILES));
			this.grid.space[tile.y + offsetY][tile.x + offsetX].status[direction]
				= Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_ELEMENTS)) + 1;
		}

		//Определяем текущий кадр
		if (this.framesAnimation === this.frames - 1) {
			if (this.eat === 1 && this.frames == NUMBER_FRAMES_BEEATLE) {
				this.eat = 0;
				//Вызываем функцию обработчика того что сьели
				this.handleEat();
				let tile = new Point(Math.floor(this.position.x / SIZE_TILES), Math.floor(this.position.y / SIZE_TILES));
				this.grid.space[tile.y][tile.x].status = { L: 0, R: 0, U: 0 };
				this.grid.space[tile.y][tile.x].element = 0;
			}
			this.getDirection();
			this.framesAnimation = 0;
		}
		else {
			this.framesAnimation = (this.framesAnimation + 1);
		}
	};


	//Функция для определения направления движения жука
	getDirection() {
		// Проверяем свободен ли выбранный путь при фиксации фигуры
		if (this.deleteRow === 1) {
			if (this.moves == this.isCanMove([this.moves]))
				this.deleteRow = 0;
		}

		if (this.moves.length === 0 || this.deleteRow === 1)
			this.moves = this.getNewDirection();

		let startMove = { ...this.move };
		if (startMove.x === this.moves[0].x && startMove.y === this.moves[0].y) {
			this.move = this.moves.shift();
		}
		else {
			this.move = this.moves[0];
		}
		this.frames = this.getFrameRotate({ ...startMove }, this.move)
		this.direction = { ...startMove };
	};

	isCanMove = (arrayDirectionses) => {
		for (let directions of arrayDirectionses)
			if (this.isCanDirections(directions))
				return directions;

		return [{ x: 0, y: 0 }];
	};

	isCanDirections = (directions) => {
		let TekX = 0;
		let TekY = 0;
		for (let direction of directions) {
			TekX += direction.x;
			TekY += direction.y;
			let point = {
				x: Math.floor(this.position.x / SIZE_TILES) + TekX,
				y: Math.floor(this.position.y / SIZE_TILES) + TekY
			};
			// Если смещение попадает за границы стакана, сказать что туда нельзя
			if (!this.grid.isInside(point))
				return false;

			// Проверить свободен ли элемент при смещении
			if (!this.grid.isFree(point)) {
				if (TekY === 0)
					if (Math.random() * 100 < PROBABILITY_EAT) {
						this.eat = 1;
						directions.length = directions.indexOf(direction) + 1;
						return true;
					}
				return false;
			}
		}
		return true;
	}

	getNewDirection() {
		const DIRECTION = {};
		DIRECTION["L"] = { x: -1, y: 0 };
		DIRECTION["R"] = { x: 1, y: 0 };
		DIRECTION["D"] = { x: 0, y: 1 };
		DIRECTION["U"] = { x: 0, y: -1 };
		DIRECTION["0"] = { x: 0, y: 0 };
		DIRECTION["0D"] = [{ x: 0, y: 1 }];
		DIRECTION["RD"] = [DIRECTION["D"], DIRECTION["R"]];
		DIRECTION["LD"] = [DIRECTION["D"], DIRECTION["L"]];
		DIRECTION["R0"] = [DIRECTION["R"]];
		DIRECTION["L0"] = [DIRECTION["L"]];
		DIRECTION["RU"] = [DIRECTION["U"], DIRECTION["R"]];
		DIRECTION["LU"] = [DIRECTION["U"], DIRECTION["L"]];
		DIRECTION["RUU"] = [DIRECTION["U"], DIRECTION["U"], DIRECTION["R"]];
		DIRECTION["LUU"] = [DIRECTION["U"], DIRECTION["U"], DIRECTION["L"]];
		DIRECTION["LEFTDOWN"] = [DIRECTION["0D"], DIRECTION["LD"], DIRECTION["RD"]];
		DIRECTION["RIGHTDOWN"] = [DIRECTION["0D"], DIRECTION["RD"], DIRECTION["LD"]];
		DIRECTION["LEFT"] = [DIRECTION["L0"], DIRECTION["LU"], DIRECTION["LUU"]];
		DIRECTION["RIGHT"] = [DIRECTION["R0"], DIRECTION["RU"], DIRECTION["RUU"]];

		this.deleteRow = 0;
		let code = "" + [this.direction.x, this.direction.y, this.move.x, this.move.y].join("");
		// Если двигаемся вправо
		if (code === "0010" || code === "1010") {
			this.lastDirection = "R";
			return this.isCanMove([...DIRECTION["RIGHTDOWN"], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);
		}
		// Если двигаемся влево
		if (code === "00-10" || code === "-10-10") {
			this.lastDirection = "L";
			return this.isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
		}

		if (this.lastDirection == "L")
			return this.isCanMove([...[DIRECTION["0D"]], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
		else
			return this.isCanMove([...[DIRECTION["0D"]], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);

	}

	getFrameRotate(direction, move) {
		// !Добавить если с 0 поворачиваемся на лево или направо, а также если в 0
		if (direction.x === move.x && direction.y === move.y)
			return NUMBER_FRAMES_BEEATLE;
		else if (direction.x === 0 && direction.y === 0)
			return NUMBER_FRAMES_BEEATLE_ROTATE;
		else
			//?? При изменении кадров надо задавать другое значение
			return Math.floor(NUMBER_FRAMES_BEEATLE / 2);
	};

	// Проверяем есть ли доступ к верху стакана
	isBreath() {
		let tile = new Point(Math.floor(this.position.x / SIZE_TILES), Math.floor(this.position.y / SIZE_TILES));
		return this.findWay(tile, []);
	};

	findWay(tile, cash) {
		if (tile.y === 0) return true;
		cash.push([tile.x, tile.y]);
		for (let element of [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]) {
			let filterCash = cash.filter((el) => tile.x + element.x === el[0] && tile.y + element.y === el[1]).length === 0;
			if (this.grid.isInside({ x: tile.x + element.x, y: tile.y + element.y })
				&& this.grid.space[tile.y + element.y][tile.x + element.x].element === 0
				&& filterCash) {
				if (this.findWay(new Point(tile.x + element.x, tile.y + element.y), cash))
					return true;
			}
		}
		return false;
	}

	// Получить напарвления движения
	getDirectionMovement() {
		return "" + [this.direction.x, this.direction.y, this.move.x, this.move.y].join("");
	}

	// Проверяем ест ли жук сейчас
	isEatingNow() {
		return this.eat === 1 && this.frames !== NUMBER_FRAMES_BEEATLE - 1
			&& (this.direction.x === this.move.x && this.direction.y === this.move.y);
	}

	// Получить Спрайт если жук ест
	getSpriteEatingNow(directionMovement) {
		// Поворот Лево->Лево
		if (directionMovement === "-10-10")
			return this.framesAnimation === 0
				? [6, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 6];

		// Поворот Вниз->Вниз
		if (directionMovement === "0101")
			return this.framesAnimation === 0
				? [0, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 8];

		// Поворот Вверх->Вверх
		if (directionMovement === "0-10-1")
			return this.framesAnimation === 0
				? [4, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 7];

		// Поворот Направо->Направо
		if (directionMovement === "1010")
			return this.framesAnimation === 0
				? [2, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 5];


		//!Для отладки если вдруг какое-то направление забыл
		alert(`Функция getSprite при еде не знает такого направления ${JSON.stringify(this.direction)} ${JSON.stringify(this.move)} `);
	}

	
	getSpriteNoEatingNow(directionMovement) {
		// Поворот Лево->Лево
		if (directionMovement === "-10-10")
			return this.framesAnimation === 0
				? [6, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 2];

		// Поворот Лево->0
		if (directionMovement === "-1000")
			return this.framesAnimation === 0 ? [6, 0] : [7, 0];

		// Поворот Лево->Направо
		if (directionMovement === "-1010")
			return [[6, 0], [7, 0], [0, 0], [1, 0], [2, 0]][this.framesAnimation];

		// Поворот Лево->Наверх
		if (directionMovement === "-100-1")
			return this.framesAnimation === 0 ? [6, 0] : [5, 0];

		// Поворот Лево->Вниз
		if (directionMovement === "-1001")
			return this.framesAnimation === 0 ? [6, 0] : [7, 0];

		// Поворот Наверх->Налево
		if (directionMovement === "0-1-10")
			return this.framesAnimation === 0 ? [4, 0] : [5, 0];

		// Поворот Наверх->0
		if (directionMovement === "0-100")
			return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][this.framesAnimation];

		// Поворот Наверх->Направо
		if (directionMovement === "0-110")
			return this.framesAnimation === 0 ? [4, 0] : [3, 0];

		// Поворот Наверх->Наверх
		if (directionMovement === "0-10-1")
			return this.framesAnimation === 0
				? [4, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 3];

		// Поворот Наверх->Вниз
		if (directionMovement === "0-101")
			return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][this.framesAnimation];

		// Поворот 0->Налево
		if (directionMovement === "00-10")
			return this.framesAnimation === 0 ? [0, 0] : [7, 0];

		// Поворот 0->Налево
		if (directionMovement === "0000")
			return [0, 0];

		// Поворот 0->Направо
		if (directionMovement === "0010")
			return this.framesAnimation === 0 ? [0, 0] : [1, 0];

		// Поворот 0->Наверх
		if (directionMovement === "000-1")
			return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][this.framesAnimation];

		// Поворот 0->Вниз
		if (directionMovement === "0001")
			return [0, 0];

		// Поворот Вниз->Наверх
		if (directionMovement === "010-1")
			return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][this.framesAnimation];

		// Поворот Вниз->0
		if (directionMovement === "0100")
			return [0, 0];

		// Поворот Вниз->Вниз
		if (directionMovement === "0101")
			return this.framesAnimation === 0
				? [0, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 4];

		// Поворот Вниз->Налево
		if (directionMovement === "01-10")
			return this.framesAnimation === 0 ? [0, 0] : [7, 0];

		// Поворот Вниз->Направо
		if (directionMovement === "0110")
			return this.framesAnimation === 0 ? [0, 0] : [1, 0];

		// Поворот Направо->Наверх
		if (directionMovement === "100-1")
			return this.framesAnimation === 0 ? [3, 0] : [4, 0];

		// Поворот Направо->0
		if (directionMovement === "1000")
			return this.framesAnimation === 0 ? [1, 0] : [0, 0];

		// Поворот Направо->Вниз
		if (directionMovement === "1001")
			return this.framesAnimation === 0 ? [1, 0] : [0, 0];

		// Поворот Направо->Налево
		if (directionMovement === "10-10")
			return [[2, 0], [1, 0], [0, 0], [7, 0], [6, 0]][this.framesAnimation];

		// Поворот Направо->Направо
		if (directionMovement === "1010")
			return this.framesAnimation === 0
				? [2, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 1];

		//!Для отладки если вдруг какое-то направление забыл
		alert(`Функция getSprite не знает такого направления ${JSON.stringify(this.direction)} ${JSON.stringify(this.move)} `);
	}

	// Исходя из данных определяет спрайт для рисования
	getSprite() {
		// Если жук ест
		if (this.isEatingNow()) return this.getSpriteEatingNow(this.getDirectionMovement());
		else return this.getSpriteNoEatingNow(this.getDirectionMovement());
	}

}
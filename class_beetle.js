import { Element, Point, Figure, CurrentFigure } from './class.js';
import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME,
	NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE,
	NAPRDVIG, NUMBER_FRAMES_BEEATLE_MOVE, NUMBER_FRAMES_BEEATLE_ROTATE
} from './const.js';

// Класс для жука
export class Beetle {
	// Позиция относительно клетки
	position;
	// Позиция относительно сетки поля
	positionTile;
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

		this.position = new Point(Math.floor(Math.random() * this.grid.width) * SIZE_TILES, ((this.grid.height - 7) * SIZE_TILES));

		//! Для отладки
		console.log(`Стартовая позиция = ${JSON.stringify(this.position)}`);

		//Установить случайное движение
		this.direction = new Point(0, 0);
		this.moves = [];
		this.move = new Point(0, 0);
		this.lastDirection = "R";
		this.eat = 0;
		this.deleteRow = 0;
		this.frames = NUMBER_FRAMES_BEEATLE;

		this.getTrafficBeetle()
		this.framesAnimation = 0;
	};
	getPositionTile() {

	}
	//Функция для определения направления движения жука
	getTrafficBeetle() {
		let isCanMove = (arrayDirectionses) => {
			for (let directions of arrayDirectionses) {
				let result = true;
				let Tekx = 0;
				let TekY = 0;
				for (let direction of directions) {
					Tekx += direction.x;
					TekY += direction.y;
					// Если смещение попадает за границы стакана, сказать что туда нельзя
					if (!this.grid.isInside({
						x: Math.floor(this.position.x / SIZE_TILES) + Tekx,
						y: Math.floor(this.position.y / SIZE_TILES) + TekY
					})) {
						result = false;
						break;
					}
					// Проверить свободен ли элемент при смещении
					if (!this.grid.isFree({
						x: Math.floor(this.position.x / SIZE_TILES) + Tekx,
						y: Math.floor(this.position.y / SIZE_TILES) + TekY
					})) {
						result = false;
						break;
					}
				}
				if (result)
					return directions;
			}
			return [{ x: 0, y: 0 }];
		};
		function isRotate(direction, move) {
			// !Добавить если с 0 поворачиваемся на лево или направо, а также если в 0
			if (direction.x === move.x && direction.y === move.y)
				return NUMBER_FRAMES_BEEATLE;
			else
				return Math.floor(NUMBER_FRAMES_BEEATLE / 2);
		};

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
		DIRECTION["LEFTDOWN"] = [ DIRECTION["0D"],DIRECTION["LD"], DIRECTION["RD"]];
		DIRECTION["RIGHTDOWN"] = [ DIRECTION["0D"],DIRECTION["RD"], DIRECTION["LD"]];
		DIRECTION["LEFT"] = [DIRECTION["L0"], DIRECTION["LU"], DIRECTION["LUU"]];
		DIRECTION["RIGHT"] = [DIRECTION["R0"], DIRECTION["RU"], DIRECTION["RUU"]];

		console.log(`Меняем направление движения, текущая позиция = ${JSON.stringify(this.direction)} текущая цель ${JSON.stringify(this.move)}`);
		if (this.moves.length === 0 || this.deleteRow == 1) {
			this.deleteRow = 0;
			let directions;
			let code = "" + [this.direction.x, this.direction.y, this.move.x, this.move.y].join("");
			// Если двигаемся вправо
			if (code === "0010" || code === "1010") {
				directions = isCanMove([...DIRECTION["RIGHTDOWN"], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);
				this.lastDirection = "R";
			}
			// Если двигаемся влево
			else if (code === "00-10" || code === "-10-10") {
				directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
				this.lastDirection = "L";
			}
			else {
				if (this.lastDirection == "L")
					directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
				else
					directions = isCanMove([...DIRECTION["RIGHTDOWN"], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);
			}

			/*// Если двигаемся вверх
		else if (this.getRotate(this.direction, this.move) === "0U")
			directions = isCanMove([{ x: 0, y: -1 }, { x: 0, y: 1 }]);
		// Если двигаемся вниз
		else if (this.getRotate(this.direction, this.move) === "0D")
			directions = isCanMove([{ x: 0, y: 1 }, { x: 0, y: -1 }]);
		else if (this.move.x === 1 && this.move.y === 1)
			directions = isCanMove([{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }]);
		else if (this.move.x === -1 && this.move.y === 1)
			directions = isCanMove([{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }]);
		// Если двигаемся влево и верх на 1 клетку
		else if (this.getRotate(this.direction, this.move) === "LU")
			directions = isCanMove([{ x: -1, y: -1 }]);*/

			this.moves = directions;
		}
		let tile = new Point(Math.floor(this.position.x / SIZE_TILES), Math.floor(this.position.y / SIZE_TILES));

		let startMove = { ...this.move };
		if (startMove.x === this.moves[0].x && startMove.y === this.moves[0].y) {
			this.move = this.moves.shift();
		}
		else {
			this.move = this.moves[0];
		}
		this.frames = isRotate({ ...startMove }, this.move)
		this.direction = { ...startMove };

		console.log(`Меняем направление движения, занятая позиция = ${JSON.stringify(this.direction)} Выбранная цель${JSON.stringify(this.move)}`);
	};

	//Метод движения жука
	beetleAnimation() {
		// Если происходит поворот то не двигаемся
		if (this.direction.x === this.move.x && this.direction.y === this.move.y) {
			if (this.move.y === 0)
				this.position.x += this.move.x * SIZE_TILES / NUMBER_FRAMES_BEEATLE;
			this.position.y += this.move.y * SIZE_TILES / NUMBER_FRAMES_BEEATLE;
		}
		//Определяем текущий кадр
		if (this.framesAnimation == this.frames - 1) {
			this.getTrafficBeetle();
			this.framesAnimation = 0;
		}
		else {
			this.framesAnimation = (this.framesAnimation + 1);
		}

		//console.log(`Текущая позиция = ${JSON.stringify(this.position)} на кадре ${this.framesAnimation}`);
	};

	// Провермяем есть ли доступ к верху стакана
	isBreath() {
		return true;
	};

	getRotate(direction, move) {
		let code = "" + [direction.x, direction.y, move.x, move.y].join("");

		switch (code) {
			// Поворот Лево->Лево
			case "-10-10": return "LL"; break;
			// Поворот Лево->0
			case "-1000": return "L0"; break;
			// Поворот Лево->Направо
			case "-1010": return "LR"; break;
			// Поворот Лево->Наверх
			case "-100-1": return "LU"; break;
			// Поворот Лево->Вниз
			case "-1001": return "LD"; break;

			// Поворот Наверх->Налево
			case "0-1-10": return "UL"; break;
			// Поворот Наверх->0
			case "0-100": return "U0"; break;
			// Поворот Наверх->Налево
			case "0-110": return "UD"; break;
			// Поворот Наверх->Наверх
			case "0-10-1": return "UU"; break;
			// Поворот Наверх->Вниз
			case "0-101": return "UD"; break;

			// Поворот 0->Налево
			case "00-10": return "0L"; break;
			// Поворот 0->Налево
			case "0000": return "00"; break;
			// Поворот 0->Направо
			case "0010": return "0R"; break;
			// Поворот 0->Наверх
			case "000-1": return "0U"; break;
			// Поворот 0->Вниз
			case "0001": return "0D"; break;

			// Поворот Вниз->Наверх
			case "010-1": return "DU"; break;
			// Поворот Вниз->0
			case "0100": return "0"; break;
			// Поворот Вниз->Вниз
			case "0101": return "DD"; break;
			// Поворот Вниз->Налево
			case "01-10": return "DL"; break;
			// Поворот Вниз->Направо
			case "0110": return "DR"; break;

			// Поворот Направо->Наверх
			case "100-1": return "RU"; break;
			// Поворот Направо->0
			case "1000": return "R0"; break;
			// Поворот Направо->Вниз
			case "1001": return "RD"; break;
			// Поворот Направо->Налево
			case "10-10": return "RL"; break;
			// Поворот Направо->Направо
			case "1010": return "RR"; break;
		}
		//!Для отладки если вдруг какое-то направление забыл
		alert(`Функция getRotate не знает такого направления ${JSON.stringify(direction)} ${JSON.stringify(move)}`);
	};

	// Исходя из данных определяе спрайт для рисования
	getSprite() {
		//console.log(`При выборе спрайта ${this.getRotate(this.direction, this.move)}`);

		let code = "" + [this.direction.x, this.direction.y, this.move.x, this.move.y].join("");
		switch (code){
			// Поворот Лево->Лево
			case "-10-10":
				return this.framesAnimation === 0
					? [6, 0]
					: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 2];
				break;
			// Поворот Лево->0
			case "-1000":
				return this.framesAnimation === 0 ? [6, 0] : [7, 0];
				break;
			// Поворот Лево->Направо
			case "-1010":
				return [[6, 0], [7, 0], [0, 0], [1, 0], [2, 0]][this.framesAnimation];
				break;
			// Поворот Лево->Наверх
			case "-100-1":
				return this.framesAnimation === 0 ? [6, 0] : [5, 0];
				break;
			// Поворот Лево->Вниз
			case "-1001":
				return this.framesAnimation === 0 ? [6, 0] : [7, 0];
				break;

			// Поворот Наверх->Налево
			case "0-1-10":
				return this.framesAnimation === 0 ? [4, 0] : [5, 0];
				break;
			// Поворот Наверх->0
			case "0-100":
				return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][this.framesAnimation];
				break;
			// Поворот Наверх->Направо
			case "0-110":
				return this.framesAnimation === 0 ? [4, 0] : [3, 0];
				break;
			// Поворот Наверх->Наверх
			case "0-10-1":
				return this.framesAnimation === 0
				? [4, 0]
					: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 3];
				break;
			// Поворот Наверх->Вниз
			case "0-101":
				return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][this.framesAnimation];
				break;

			// Поворот 0->Налево
			case "00-10":
				return this.framesAnimation === 0 ? [0, 0] : [7, 0];
				break;
			// Поворот 0->Налево
			case "0000": return "00";
				return [0, 0];
				break;
			// Поворот 0->Направо
			case "0010":
				return this.framesAnimation === 0 ? [0, 0] : [1, 0];
				break;
			// Поворот 0->Наверх
			case "000-1":
				return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][this.framesAnimation];
				break;
			// Поворот 0->Вниз
			case "0001":
				return [0, 0];
				break;
			

			// Поворот Вниз->Наверх
			case "010-1":
				return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][this.framesAnimation];
				break;
			// Поворот Вниз->0
			case "0100":
				return [0, 0];
				break;
			// Поворот Вниз->Вниз
			case "0101":
				return this.framesAnimation === 0
				? [0, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 4];; break;
			// Поворот Вниз->Налево
			case "01-10":
				return this.framesAnimation === 0 ? [0, 0] : [7, 0];
				break;
			// Поворот Вниз->Направо
			case "0110":
				return this.framesAnimation === 0 ? [0, 0] : [1, 0];
				break;

			// Поворот Направо->Наверх
			case "100-1":
				return this.framesAnimation === 0 ? [3, 0] : [4, 0];
				break;
			// Поворот Направо->0
			case "1000":
				return this.framesAnimation === 0 ? [1, 0] : [0, 0];
				break;
			// Поворот Направо->Вниз
			case "1001":
				return this.framesAnimation === 0 ? [1, 0] : [0, 0];
				break;
			// Поворот Направо->Налево
			case "10-10":
				return [[2, 0], [1, 0], [0, 0], [7, 0], [6, 0]][this.framesAnimation];
				break;
			// Поворот Направо->Направо
			case "1010":
				return this.framesAnimation === 0
				? [2, 0]
					: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 1];
				break;
		}

		//!Для отладки если вдруг какое-то направление забыл
		alert(`Функция getSprite не знает такого направления ${ JSON.stringify(this.direction) } ${ JSON.stringify(this.move)}`);

		/*
				if (model.beetle.eat == 0) {
			console.log(model.beetle.moveX + model.beetle.moveY);
			switch (model.beetle.moveX + model.beetle.moveY) {
				case "00":
					[offsetX, offsetY] = model.beetle.getSprite();
				case "L0":
					[offsetX, offsetY] = [...[6, 0]]; break;
				case "R0":
					[offsetX, offsetY] = [...[2, 0]]; break;
				default:
					[offsetX, offsetY] = [...[9, 9]]; break;
			}
		} else {
	
		}
		
		if (model.beetle.eat == 0 && (model.beetle.moveY == "0" || (model.beetle.framesAnimation % 2 == 0 && model.beetle.moveY != "U" && model.beetle.moveY != "UU")))
			[offsetX, offsetY] = [...[0, 0]];
		// Показываем анимацию при движении влево
		else if (model.beetle.moveX == "L" && model.beetle.moveY == "0")
			if (model.beetle.eat == 0)
				[offsetX, offsetY] = [...[1 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[offsetX, offsetY] = [...[1 * SIZE_TILES, 1 * SIZE_TILES]];
				else
					[offsetX, offsetY] = [...[2 * SIZE_TILES, 1 * SIZE_TILES]];
		// Показываем анимацию при движении вправо
		else if (model.beetle.moveX == "R" && model.beetle.moveY == "0")
			if (model.beetle.eat == 0)
				[offsetX, offsetY] = [...[2 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[offsetX, offsetY] = [...[1 * SIZE_TILES, 2 * SIZE_TILES]];
				else
					[offsetX, offsetY] = [...[2 * SIZE_TILES, 2 * SIZE_TILES]];
		else if (model.beetle.moveX == "L" && (model.beetle.moveY == "U" || model.beetle.moveY == "UU"))
			[offsetX, offsetY] = [...[0, 1 * SIZE_TILES]];
		else if (model.beetle.moveX == "R" && (model.beetle.moveY == "U" || model.beetle.moveY == "UU"))
			[offsetX, offsetY] = [...[0, 2 * SIZE_TILES]];
		else
			if (model.beetle.eat == 0)
				[offsetX, offsetY] = [...[3 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[offsetX, offsetY] = [...[1 * SIZE_TILES, 3 * SIZE_TILES]];
				else
					[offsetX, offsetY] = [...[2 * SIZE_TILES, 3 * SIZE_TILES]];
	*/
	}
}
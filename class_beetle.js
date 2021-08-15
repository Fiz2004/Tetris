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

		this.position = new Point(Math.floor(Math.random() * this.grid.width) * SIZE_TILES, ((this.grid.height - 2) * SIZE_TILES));

		//! Для отладки
		console.log(`Стартовая позиция = ${JSON.stringify(this.position)}`);

		//Установить случайное движение
		this.direction = new Point(0, 0);
		this.moves = [new Point(1, 0)];
		this.move = new Point(0, 0);
		this.lastDirection = "R";
		this.eat = 0;
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
			return { x: 0, y: 0 };
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
		DIRECTION["LEFTDOWN"] = [DIRECTION["LD"], DIRECTION["0D"], DIRECTION["RD"]];
		DIRECTION["RIGHTDOWN"] = [DIRECTION["RD"], DIRECTION["0D"], DIRECTION["LD"]];
		DIRECTION["LEFT"] = [DIRECTION["L0"], DIRECTION["LU"], DIRECTION["LUU"]];
		DIRECTION["RIGHT"] = [DIRECTION["R0"], DIRECTION["RU"], DIRECTION["RUU"]];

		console.log(`Меняем направление движения, текущая позиция = ${JSON.stringify(this.direction)} текущая цель ${JSON.stringify(this.move)}`);
		if (this.moves.length === 0) {
			let directions;

			// Если стоим
			if (this.getRotate(this.direction, this.move) === "00" || this.getRotate(this.direction, this.move) === "DD")
				if (this.lastDirection == "L")
					directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
					else
					directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);
			// Если двигаемся вправо
			else if (this.getRotate(this.direction, this.move) === "0R" || this.getRotate(this.direction, this.move) === "RR") {
				directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["RIGHT"], ...DIRECTION["LEFT"]]);
				this.lastDirection = "R";
			}
			// Если двигаемся влево
			else if (this.getRotate(this.direction, this.move) === "0L" || this.getRotate(this.direction, this.move) === "LL") {
				directions = isCanMove([...DIRECTION["LEFTDOWN"], ...DIRECTION["LEFT"], ...DIRECTION["RIGHT"]]);
				this.lastDirection = "L";
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
		// Если поворачиваемся вниз из позиции вверх
		if (direction.y === -1 && move.y === 1)
			return "UD"

		// Если поворачиваемся вверх из позиции вниз
		if (direction.y === 1 && move.y === -1)
			return "DU"

		// Если поворачиваемся влево из позиции вправо
		if (direction.x === 1 && direction.y === 0
			&& move.x === -1 && move.y === 0)
			return "RL"

		// Если поворачиваемся вправо из позиции влево
		if (direction.x === -1 && direction.y === 0
			&& move.x === 1 && move.y === 0)
			return "LR"

		// Если поворачиваемся вверх с 0,0
		if (direction.x === 0 && direction.y === 0
			&& move.x === 0 && move.y === -1)
			return "0U"

		// Если поворачиваемся вверх с 0,0
		if (direction.x === -1 && direction.y === -1
			&& move.x === -1 && move.y === -1)
			return "LU"

		// Если поворачиваемся вправо с 0,0
		if (direction.x === 0 && direction.y === 0
			&& move.x === 1 && move.y === 0)
			return "0R"
		
		// Если поворачиваемся вправо с позиции вниз
		if (direction.x === 0 && direction.y === 1
			&& move.x === 1 && move.y === 0)
			return "DR"

		// Если движемся влево
		if (direction.x === -1 && direction.y === 0
			&& move.x === -1 && move.y === 0)
			return "LL"

		// Если движемся вправо
		if (direction.x === 1 && direction.y === 0
			&& move.x === 1 && move.y === 0)
			return "RR"
		
		// Если движемся вправо а пошел вниз
		if (direction.x === 1 && direction.y === 0
			&& move.x === 1 && move.y === 0)
			return "RD"
		
		// Если движемся вправо а пошел верх
		if (direction.x === 1 && direction.y === 0
			&& move.x === 0 && move.y === 1)
			return "RU"
		
		// Если движемся вверх а пошел вправо
		if (direction.x === 0 && direction.y === -1
			&& move.x === 1 && move.y === 0)
			return "UR"

		// Если движемся вверх
		if ((direction.x === 0 && direction.y === -1)
			&& (move.x === 0 && move.y === -1))
			return "UU"

		// Если движемся вниз
		if ((direction.x === 0 && direction.y === 1)
			&& (move.x === 0 && move.y === 1))
			return "DD"

		// Если поворачиваемся влево с 0,0
		if (direction.x === 0 && direction.y === 0
			&& move.x === -1 && move.y === 0)
			return "0L"

		// Если стоим
		if (direction.x === 0 && direction.y === 0
			&& move.x === 0 && move.y === 0)
			return "00"
		
		throw new Error(`Функция getRotate не знает такого направления ${JSON.stringify(direction)} ${JSON.stringify(move)}`);
	};

	// Исходя из данных определяе спрайт для рисования
	getSprite() {

		//!Долбавить из вправо вниз
		//console.log(`При выборе спрайта ${this.getRotate(this.direction, this.move)}`);
		// Если поворачиваемся влево с 0,0
		if (this.getRotate(this.direction, this.move) === "0L")
			return this.framesAnimation === 0 ? [0, 0] : [7, 0];

		// Если поворачиваемся вправо из позиции вниз
		if (this.getRotate(this.direction, this.move) === "0R")
			return this.framesAnimation === 0 ? [0, 0] : [1, 0];
		
		// Если поворачиваемся вниз из позиции вправо
		if (this.getRotate(this.direction, this.move) === "RD")
			return this.framesAnimation === 0 ? [1, 0] : [0, 0];
		
		// Если поворачиваемся вправо из позиции вверх
		if (this.getRotate(this.direction, this.move) === "UR")
			return this.framesAnimation === 0 ? [3, 0] : [2, 0];
		
		// Если поворачиваемся вправо из позиции вниз
		if (this.getRotate(this.direction, this.move) === "DR")
			return this.framesAnimation === 0 ? [1, 0] : [2, 0];
		
		// Если поворачиваемся из позиции право вверх
		if (this.getRotate(this.direction, this.move) === "RU")
			return this.framesAnimation === 0 ? [3, 0] : [4, 0];
		
		// Если поворачиваемся вправо из позиции влево
		if (this.getRotate(this.direction, this.move) == "LR")
			return [[6, 0], [7, 0], [0, 0], [1, 0], [2, 0]][this.framesAnimation];

		// Если поворачиваемся влево из позиции вправо
		if (this.getRotate(this.direction, this.move) == "RL")
			return [[2, 0], [1, 0], [0, 0], [7, 0], [6, 0]][this.framesAnimation];

		// Если поворачиваемся вверх из позиции вниз или из 0 наверх
		if (this.getRotate(this.direction, this.move) == "DU" || this.getRotate(this.direction, this.move) == "0U")
			return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][this.framesAnimation];

		// Если поворачиваемся вниз из позиции вверх
		if (this.getRotate(this.direction, this.move) === "UD")
			return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][this.framesAnimation];

		// Если движемся влево
		if (this.getRotate(this.direction, this.move) === "LL")
			return this.framesAnimation === 0
				? [6, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 2];

		// Если движемся вправо
		if (this.getRotate(this.direction, this.move) === "RR")
			return this.framesAnimation === 0
				? [2, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 1];

		// Если движемся вверх или влево вверх
		if (this.getRotate(this.direction, this.move) === "UU" || this.getRotate(this.direction, this.move) === "LU")
			return this.framesAnimation === 0
				? [4, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 3];

		// Если движемся вниз
		if (this.getRotate(this.direction, this.move) === "DD")
			return this.framesAnimation === 0
				? [0, 0]
				: [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 4];

		return [0, 0];
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
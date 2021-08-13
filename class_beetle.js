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
	direction
	// Направление движения, массивом с указанием смещения
	move;
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

		this.position = new Point(Math.floor(Math.random() * this.grid.width) * SIZE_TILES, ((this.grid.height - 1) * SIZE_TILES));

		//! Для отладки
		console.log(`Стартовая позиция = ${JSON.stringify(this.position)}`);

		//Установить случайное движение
		this.direction = [0, 0];
		this.move = [0, 0];
		this.eat = 0;

		this.getTrafficBeetle()
		this.framesAnimation = 0;
	};
	getPositionTile() {

	}
	//Функция для определения направления движения жука
	getTrafficBeetle() {
		console.log(`Меняем направление движения, текущая позиция = ${JSON.stringify(this.direction)} текущая цель ${this.move}`);
		this.direction = [...this.move];
		
		if (this.move[0] === 0 && this.move[1] === 0) {
			this.move = [-1, 0];
		}
		else if (this.move[0] === 1 && this.move[1] === 0) {
			if (Math.floor(this.position.x / SIZE_TILES) === this.grid.width - 1)
				this.move = [-1, 0];
		}
		if (this.move[0] === -1 && this.move[1] === 0) {
			if (Math.floor(this.position.x / SIZE_TILES) === 0)
				this.move = [1, 0];
		}
		console.log(`Меняем направление движения, занятая позиция = ${JSON.stringify(this.direction)} Выбранная цель ${this.move}`);
	};

	//Метод движения жука
	beetleAnimation() {
		//Определяем текущий кадр
		if (this.framesAnimation == NUMBER_FRAMES_BEEATLE - 1) {
			this.getTrafficBeetle();
			this.framesAnimation = 0;
		}
		else {
			this.framesAnimation = (this.framesAnimation + 1);
		}
		if ((this.direction[0] === 0 && this.direction[1] === 0 &&
			this.move[0] === 1 && this.move[1] === 0)
			|| (this.direction[0] === 0 && this.direction[1] === 0 &&
				this.move[0] === -1 && this.move[1] === 0)
			|| (this.direction[0] === -1 && this.direction[1] === 0 &&
				this.move[0] === 1 && this.move[1] === 0)
			|| (this.direction[0] === 1 && this.direction[1] === 0 &&
				this.move[0] === -1 && this.move[1] === 0)) {
			
		}
		else {
			this.position.x += this.move[0] * SIZE_TILES / NUMBER_FRAMES_BEEATLE;
			this.position.y += this.move[1] * SIZE_TILES / NUMBER_FRAMES_BEEATLE;
		}
		console.log(`Текущая позиция = ${JSON.stringify(this.position)} на кадре ${this.framesAnimation}`);
	};

	// Провермяем есть ли доступ к верху стакана
	isBreath() {
		return true;
	};

	// Исходя из данных определяе спрайт для рисования
	getSprite() {
		// Если поворачиваемся влево с 0,0
		if (this.move[0] === -1 && this.move[1] === 0
			&& this.direction[0] === 0 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [0, 0];
			else {
				return [7, 0];
			}
		// Если поворачиваемся вправо с 0,0
		if (this.move[0] === 1 && this.move[1] === 0
			&& this.direction[0] === 0 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [0, 0];
			else {
				return [1, 0];
			}
		// Если поворачиваемся вправо из позиции влево
		if (this.move[0] === 1 && this.move[1] === 0
			&& this.direction[0] === -1 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [2, 0];
			else {
				switch (Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_ROTATE))) {
					case 1:
						return [2, 0];
					case 2:
						return [1, 0];
					case 3:
						return [0, 0];
					case 4:
						return [7, 0];
				}
			}
		// Если поворачиваемся влево из позиции вправо
		if (this.move[0] === -1 && this.move[1] === 0
			&& this.direction[0] === 1 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [6, 0];
			else {
				switch (Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_ROTATE))) {
					case 1:
						return [7, 0];
					case 2:
						return [0, 0];
					case 3:
						return [1, 0];
					case 4:
						return [2, 0];
				}
			}
		// Если движемся влево
		if (this.move[0] === -1 && this.move[1] === 0
			&& this.direction[0] === -1 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [6, 0];
			else {
				return [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 2];
			}
		// Если движемся вправо
		if (this.move[0] === 1 && this.move[1] === 0
			&& this.direction[0] === 1 && this.direction[1] === 0)
			if (this.framesAnimation == 0)
				return [2, 0];
			else {
				console.log(`Текущий кадр анимации = ${Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE))} на кадре ${this.framesAnimation}`);
				return [Math.floor(this.framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 1];
			}
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
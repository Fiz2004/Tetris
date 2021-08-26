import {
	SIZE_TILES, UPDATE_TIME, STEP_MOVE_KEY_X,
	// Количество изображений для фигуры
	NUMBER_IMAGES_FIGURE,
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE
} from './const.js';

// Класс для обозначения элементов на поле
export class Element {
	// Номер картинки для фона элемента от 0 до NUMBER_IMAGES_BACKGROUND
	background;
	//Показывает вид элемента от 0 до NUMBER_IMAGES_FIGURE
	element;
	//Показывает повреждения хранит свойства L,R,U со значениями от 0 до NUMBER_FRAMES_ELEMENTS
	status;
	constructor(background, valueElement = 0) {
		this.background = background;
		this.element = valueElement;
		//Показывает значение сьеденного элемента и направление
		this.status = {
			L: 0,
			R: 0,
			U: 0,
		};
	}

	isStatusClear() {
		return this.status.L === 0 && this.status.R === 0 && this.status.U === 0
	}

	//Установить в 0 все значения элемента
	setZero() {
		this.element = 0;
		this.status = { L: 0, R: 0, U: 0 };
	}

}

// Класс для обзначения координат x и y
export class Point {
	x;
	y;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	};
}

// Класс для обзначения ячейки с координатами x и y, и сохранением номера фона
class Cell extends Point {
	view;
	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	};
}

// Класс для фигуры
export class Figure {
	// Ячейки в фигуре
	cell = [];
	// Количество изображений для фигуры
	static numberCell = NUMBER_IMAGES_FIGURE;

	constructor() {
		//Задаем случайный номер для фигуры
		let randNumber = Math.floor(Math.random() * FIGURE.length);
		for (let i = 0; i < FIGURE[randNumber].length; i++) {
			//Задаем случайный фон для ячейки
			let randView = Math.floor(Math.random() * NUMBER_IMAGES_FIGURE) + 1;
			// Новая ячейка(координаты x и y и номер изображения фигуры)
			this.cell[i] = new Cell(FIGURE[randNumber][i][0], FIGURE[randNumber][i][1], randView);
		}
	};
}

// Класс для текущей падающей фигуры
export class CurrentFigure extends Figure {
	position;
	grid;
	constructor(grid, newCell) {
		super();
		this.grid = grid;
		this.cell = [...newCell];
		//Задаем стартовую позицию
		let width = this.cell.reduce((a, b) => a.x > b.x ? a : b).x;
		let height = this.cell.reduce((a, b) => a.y > b.y ? a : b).y;
		this.position = new Point(Math.floor(Math.random() * (this.grid.width - 1 - width)) * SIZE_TILES, (-1 - height) * SIZE_TILES);
	};

	//Получить массив занимаемый текущей фигурой по умолчанию, либо с задаными x и y, например при проверке коллизии
	getPositionTile(x = this.position.x, y = this.position.y) {
		let positionTile = [];
		this.cell.forEach((cell) => positionTile.push(new Point(
			cell.x + Math.ceil(x / SIZE_TILES),
			cell.y + Math.ceil(y / SIZE_TILES)
		)));
		return positionTile;
	};

	// Проверяем столкновение
	isCollission(x, y) {
		let result = false;
		// Проверяем есть ли в этой точке элемент
		for (let point of this.getPositionTile(x, y))
			if (this.grid.isInside(point) && this.grid.space[point.y][point.x].element !== 0)
				result = true;

		if (result) return true;

		// Проверяем выходит ли точка за границы стакана
		for (let { x: x1, y: y1 } of this.getPositionTile(x, y))
			if (x1 < 0 || x1 > this.grid.width - 1 || y1 > this.grid.height - 1) return true;

		return result;
	};

	//функция поворота фигуры
	rotate() {
		this.cell.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
		if (this.isCollission(this.position.x, this.position.y)) {
			this.cell.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
			this.cell.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
			this.cell.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
		}
	};

	//Метод движения влево
	moveLeft() {
		if (this.isCollission(this.position.x - STEP_MOVE_KEY_X, this.position.y) == false)
			this.position.x -= STEP_MOVE_KEY_X;
	}

	//Метод движения вправо
	moveRight() {
		if (this.isCollission(this.position.x + STEP_MOVE_KEY_X, this.position.y) == false)
			this.position.x += STEP_MOVE_KEY_X;
	}

	//Метод движения вниз
	moveDown(stepY, context) {
		let tY = Math.ceil(this.position.y / SIZE_TILES);
		let kY = Math.ceil((this.position.y + stepY) / SIZE_TILES);
		let predel = kY;
		let stop = false;
		for (let y = tY; y <= kY; y++)
			if (this.isCollission(this.position.x, y * SIZE_TILES)) {
				predel = y;
				stop = true;
				break;
			}

		if (stepY < SIZE_TILES)
			this.position.y += stepY;
		else
			this.position.y += (predel - tY) * SIZE_TILES;

		if (stop) {
			let positionCells = this.getPositionTile(this.position.x, predel * SIZE_TILES);
			for (let i = 0; i < positionCells.length; i++) {
				if (positionCells[i].y - 1 < 0) {
					return false;
				}
			}

			for (let i = 0; i < positionCells.length; i++)
				this.grid.space[positionCells[i].y - 1][positionCells[i].x].element = this.cell[i].view;

			return true;

		}
	}
}

// Просто сохранить, функция поворота точки x,y относительно x0,y0 на угол angle
function rotate(x, y, angle, x0 = 0, y0 = 0) {
	return {
		x: (x - x0) * Math.cos(pi * angle / 180) - (y - y0) * Math.sin(pi * angle / 180),
		y: (x - x0) * Math.sin(pi * angle / 180) + (y - y0) * Math.cos(pi * angle / 180),
	}
}

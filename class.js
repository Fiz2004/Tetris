import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME, STEP_MOVE_KEY_X,
	NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE
} from './const.js';

// Класс для обозначения элементов на поле
export class Element {
	background;
	//Показывает вид элемента от 0 до NUMBER_FIGURE_ELEMENTS
	element;
	//Показывает повреждения хранит свойства L,R,U со значениями от 0 до NUMBER_FRAMES_ELEMENTS
	status;
	constructor(background, valueElement) {
		this.background = background;
		this.element = valueElement;
		this.status = {
			L: 0,
			R: 0,
			U: 0,
		};
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
	cell = [];
	constructor() {
		//Задаем случайный номер для фигуры
		let randNumber = Math.floor(Math.random() * FIGURE.length);
		for (let i = 0; i < 4; i++) {
			//Задаем случайный фон для ячейки
			let randView = Math.floor(Math.random() * NUMBER_FIGURE_ELEMENTS) + 1;
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
		let positionTile = this.getPositionTile(x, y);
		for (let i = 0; i < positionTile.length; i++) {
			if (positionTile[i].x < 0 || positionTile[i].x > this.grid.width - 1) return true;
			if (positionTile[i].y < 0) return false;
			if (positionTile[i].y > this.grid.height - 1) return true;
			if (this.grid.space[positionTile[i].y][positionTile[i].x].element !== 0) return true;
		}
		return false;
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
		for (let y = tY; y <= kY; y++) {
			if (this.isCollission(this.position.x, this.position.y + stepY) == false) {
				this.position.y += stepY;
			} else {
				let positionCells = this.getPositionTile(this.position.x, this.position.y + stepY);
				let predel;
				//!переработать алгоритм не всегда ложиться или проходит сквозь блоки
				for (let i = Math.ceil(this.position.y / SIZE_TILES); i <= Math.ceil((this.position.y + stepY) / SIZE_TILES); i++) {
					if (this.isCollission(this.position.x, i * SIZE_TILES)) {
						predel = i;
						break;
					}
				}
				for (let i = 0; i < positionCells.length; i++) {
					//! Условия проигрыша не полные иногда фигура ложится в существующую
					if (positionCells[i].y - 1 < 0) {
						document.localStorage.setItem('Record', model.scores);
						document.alert("Вы проиграли");
						document.model = new Model();
						return;
					}
				}
				positionCells = this.getPositionTile(this.position.x, predel * SIZE_TILES);
				for (let i = 0; i < positionCells.length; i++)
					this.grid.space[positionCells[i].y - 1][positionCells[i].x].element = this.cell[i].view;

				context.deleteRow();
				context.formCurrentFigure();
			};
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

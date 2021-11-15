import {
	STEP_MOVE_KEY_X,
	NUMBER_IMAGES_FIGURE,
	START_STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y,
	PLUS_STEP_MOVE_AUTO,
	FIGURE,
} from './const.js';
import { Cell, Point } from './class.js';
// Класс для фигуры
export class Figure {
	// Ячейки в фигуре
	cells;
	// Количество изображений для фигуры
	static numberCell = NUMBER_IMAGES_FIGURE;
	constructor() {
		this.cells = [];
		for (const [x, y] of FIGURE[Math.floor(Math.random() * FIGURE.length)]) {
			// Новая ячейка(координаты x и y и номер изображения фигуры)
			this.cells.push(new Cell(x, y, Math.floor(Math.random() * NUMBER_IMAGES_FIGURE) + 1));
		}
	}
}

// Класс для текущей падающей фигуры
export class CurrentFigure extends Figure {
	position;
	grid;
	constructor(grid, newCell) {
		super();
		this.grid = grid;
		this.cells = [...newCell];
		this.stepMoveAuto = START_STEP_MOVE_AUTO;
		//Задаем стартовую позицию
		const width = this.cells.reduce((a, b) => a.x > b.x ? a : b).x;
		const height = this.cells.reduce((a, b) => a.y > b.y ? a : b).y;
		this.position = new Point(Math.floor(Math.random() * (this.grid.width - 1 - width)), -1 - height);
	}

	//Получить массив занимаемый текущей фигурой по умолчанию, либо с задаными x и y, например при проверке коллизии
	getPositionTile(x = this.position.x, y = this.position.y) {
		const resultSet = [];
		this.cells.forEach((cell) => {
			if (resultSet.filter((el) => (cell.x + Math.floor(x) === el.x && cell.y + Math.floor(y) === el.y)).length === 0) {
				resultSet.push(new Point(
					cell.x + Math.floor(x),
					cell.y + Math.floor(y)));
			}
			if (resultSet.filter((el) => (cell.x + Math.floor(x + 1) === el.x && cell.y + Math.floor(y) === el.y)).length === 0) {
				resultSet.push(new Point(
					cell.x + Math.floor(x + 1),
					cell.y + Math.floor(y)));
			}
			if (resultSet.filter((el) => (cell.x + Math.floor(x) === el.x && cell.y + Math.floor(y + 1) === el.y)).length === 0) {
				resultSet.push(new Point(
					cell.x + Math.floor(x),
					cell.y + Math.floor(y + 1)));
			}
			if (resultSet.filter((el) => (cell.x + Math.floor(x + 1) === el.x && cell.y + Math.floor(y + 1) === el.y)).length === 0) {
				resultSet.push(new Point(
					cell.x + Math.floor(x + 1),
					cell.y + Math.floor(y + 1)));
			}
		});

		const result = [];
		this.cells.forEach((cell) => result.push(new Point(
			cell.x + Math.ceil(x),
			cell.y + Math.ceil(y),
		)));
		return result;
	}

	fixation(scores) {
		const scoresForLevel = 300;
		this.stepMoveAuto = PLUS_STEP_MOVE_AUTO + PLUS_STEP_MOVE_AUTO * Math.ceil(scores / scoresForLevel);
	}

	// Проверяем столкновение
	isCollission(x, y) {
		let result = false;
		// Проверяем есть ли в этой точке элемент
		for (const point of this.getPositionTile(x, y)) {
			if (this.grid.isInside(point) && this.grid.space[point.y][point.x].element !== 0) {
				result = true;
			}
		}

		if (result) {
			return true;
		}

		// Проверяем выходит ли точка за границы стакана
		for (const { x: x1, y: y1 } of this.getPositionTile(x, y)) {
			if (x1 < 0 || x1 > this.grid.width - 1 || y1 > this.grid.height - 1) {
				return true;
			}
		}

		return result;
	}

	//функция поворота фигуры
	rotate() {
		this.cells.forEach((cell) => {
			[cell.x, cell.y] = [3 - cell.y, cell.x];
		});
		if (this.isCollission(this.position.x, this.position.y)) {
			this.cells.forEach((cell) => {
				[cell.x, cell.y] = [3 - cell.y, cell.x];
			});
			this.cells.forEach((cell) => {
				[cell.x, cell.y] = [3 - cell.y, cell.x];
			});
			this.cells.forEach((cell) => {
				[cell.x, cell.y] = [3 - cell.y, cell.x];
			});
		}
	}

	moves({ left, right, up, down }) {
		if (left) {
			this.moveLeft();
		}
		if (right) {
			this.moveRight();
		}
		if (up) {
			this.rotate();
		}
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		return this.moveDown(down ? STEP_MOVE_KEY_Y : this.stepMoveAuto);
	}

	//Метод движения влево
	moveLeft() {
		if (!this.isCollission(this.position.x - STEP_MOVE_KEY_X, this.position.y)) {
			this.position.x -= STEP_MOVE_KEY_X;
		}
	}

	//Метод движения вправо
	moveRight() {
		if (!this.isCollission(this.position.x + STEP_MOVE_KEY_X, this.position.y)) {
			this.position.x += STEP_MOVE_KEY_X;
		}
	}


	//Метод движения вниз возвращает 3 значения true (Фигура достигла какого то препятствия), false (Игра окончена, стакан заполнен) и другое (Перемещаем фигуру на заданное расстояние)
	moveDown(stepY) {
		// Переменные для удобства
		// Текущая позиция по Y
		const tY = Math.ceil(this.position.y);
		// Конечная позиция по Y при шаге stepY
		const kY = Math.ceil(this.position.y + stepY);
		// Запоминаем конечную пощицию еще в одну переменную
		let predel = kY;
		// Создаем флаг для понимания что ниже двигатся нельзя
		let stop = false;
		// Просматриваем все Y между начальной и конечной позицицей
		for (let y = tY; y <= kY; y++) {
			if (this.isCollission(this.position.x, y)) {
				predel = y;
				stop = true;
				break;
			}
		}

		if (stepY < 1) {
			// Если шаг движения меньше размера клетки, то просто увеличиваем позицию
			this.position.y += stepY;
		} else {
			// Если шаг движения больше размера клетки, то двигаемя до предельного значения до которого можно
			this.position.y += predel - tY;
		}
		// Если движение возможно просто выходим, если нет то смотрим условия
		if (stop) {
			const positionCells = this.getPositionTile(this.position.x, predel);
			for (const { y } of positionCells) {
				if (y - 1 < 0) {
					return 'endGame';
				}
			}

			positionCells.forEach(({ x, y }, index) => {
				this.grid.space[y - 1][x].element = this.cells[index].view;
			});

			return 'fixation';
		}

		return 'fall';
	}
}

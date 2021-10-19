import {
	SIZE_TILES, STEP_MOVE_KEY_X,
	// Количество изображений для фигуры
	NUMBER_IMAGES_FIGURE,
	FIGURE,
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
	// Получить статус элемента, поврежден ли он или целый
	getSpaceStatus() {
		if (this.status.L !== 0) return "L"
		if (this.status.R !== 0) return "R"
		if (this.status.U !== 0) return "U"
		return "0"
	}
	//Установить в 0 все значения элемента
	setZero() {
		this.element = 0;
		this.status = { L: 0, R: 0, U: 0 };
	}

	setElement(element) {
		this.element = element.element;
		this.status = { L: element.status.L, R: element.status.R, U: element.status.U };
	}
}

// Класс для обзначения координат x и y
export class Point {
	x;
	y;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

// Класс для обзначения ячейки с координатами x и y, и сохранением номера фона
class Cell extends Point {
	view;
	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	}
}

// Класс для фигуры
export class Figure {
	// Ячейки в фигуре
	cells;
	// Количество изображений для фигуры
	static numberCell = NUMBER_IMAGES_FIGURE;
	constructor() {
		this.cells = [];
		for (let cell of FIGURE[Math.floor(Math.random() * FIGURE.length)])
			// Новая ячейка(координаты x и y и номер изображения фигуры)
			this.cells.push(new Cell(cell[0], cell[1], Math.floor(Math.random() * NUMBER_IMAGES_FIGURE) + 1));
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
		//Задаем стартовую позицию
		let width = this.cells.reduce((a, b) => a.x > b.x ? a : b).x;
		let height = this.cells.reduce((a, b) => a.y > b.y ? a : b).y;
		this.position = new Point(Math.floor(Math.random() * (this.grid.width - 1 - width)) * SIZE_TILES, (-1 - height) * SIZE_TILES);
		this.deltaTime = 0;
	}

	//Получить массив занимаемый текущей фигурой по умолчанию, либо с задаными x и y, например при проверке коллизии
	getPositionTile(x = this.position.x, y = this.position.y) {
		let resultSet = [];
		this.cells.forEach((cell) => {
			if (resultSet.filter((el) => (cell.x + Math.floor(x / SIZE_TILES) === el.x && cell.y + Math.floor(y / SIZE_TILES) === el.y)).length === 0)
				resultSet.push(new Point(
					cell.x + Math.floor(x / SIZE_TILES),
					cell.y + Math.floor(y / SIZE_TILES)));
			if (resultSet.filter((el) => (cell.x + Math.floor((x + SIZE_TILES) / SIZE_TILES) === el.x && cell.y + Math.floor(y / SIZE_TILES) === el.y)).length === 0)
				resultSet.push(new Point(
					cell.x + Math.floor((x + SIZE_TILES) / SIZE_TILES),
					cell.y + Math.floor(y / SIZE_TILES)));
			if (resultSet.filter((el) => (cell.x + Math.floor(x / SIZE_TILES) === el.x && cell.y + Math.floor((y + SIZE_TILES) / SIZE_TILES) === el.y)).length === 0)
				resultSet.push(new Point(
					cell.x + Math.floor(x / SIZE_TILES),
					cell.y + Math.floor((y + SIZE_TILES) / SIZE_TILES)));
			if (resultSet.filter((el) => (cell.x + Math.floor((x + SIZE_TILES) / SIZE_TILES) === el.x && cell.y + Math.floor((y + SIZE_TILES) / SIZE_TILES) === el.y)).length === 0)
				resultSet.push(new Point(
					cell.x + Math.floor((x + SIZE_TILES) / SIZE_TILES),
					cell.y + Math.floor((y + SIZE_TILES) / SIZE_TILES)));
		});

		let result = [];
		this.cells.forEach((cell) => result.push(new Point(
			cell.x + Math.ceil(x / SIZE_TILES),
			cell.y + Math.ceil(y / SIZE_TILES)
		)));
		return result;
	}

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
	}

	//функция поворота фигуры
	rotate() {
		this.cells.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
		if (this.isCollission(this.position.x, this.position.y)) {
			this.cells.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
			this.cells.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
			this.cells.forEach((cell) => { [cell.x, cell.y] = [3 - cell.y, cell.x] });
		}
	}

	//Метод движения влево
	moveLeft() {
		if (!this.isCollission(this.position.x - STEP_MOVE_KEY_X, this.position.y))
			this.position.x -= STEP_MOVE_KEY_X;
	}

	//Метод движения вправо
	moveRight() {
		if (!this.isCollission(this.position.x + STEP_MOVE_KEY_X, this.position.y))
			this.position.x += STEP_MOVE_KEY_X;
	}

	//Метод движения вниз возвращает 3 значения true (Фигура достигла какого то препятствия), false (Игра окончена, стакан заполнен) и другое (Перемещаем фигуру на заданное расстояние)
	moveDown(stepY) {
		// Переменные для удобства
		// Текущая позиция по Y
		let tY = Math.ceil(this.position.y / SIZE_TILES);
		// Конечная позиция по Y при шаге stepY
		let kY = Math.ceil((this.position.y + stepY) / SIZE_TILES);
		// Запоминаем конечную пощицию еще в одну переменную
		let predel = kY;
		// Создаем флаг для понимания что ниже двигатся нельзя
		let stop = false;
		// Просматриваем все Y между начальной и конечной позицицей
		for (let y = tY; y <= kY; y++)
			if (this.isCollission(this.position.x, y * SIZE_TILES)) {
				predel = y;
				stop = true;
				break;
			}

		if (stepY < SIZE_TILES)
			// Если шаг движения меньше размера клетки, то просто увеличиваем позицию
			this.position.y += stepY;
		else
			// Если шаг движения больше размера клетки, то двигаемя до предельного значения до которого можно
			this.position.y += (predel - tY) * SIZE_TILES;

		// Если движение возможно просто выходим, если нет то смотрим условия
		if (stop) {
			let positionCells = this.getPositionTile(this.position.x, predel * SIZE_TILES);
			for (let cell of positionCells)
				if (cell.y - 1 < 0) return false;

			let i = 0;
			for (let cell of positionCells)
				this.grid.space[cell.y - 1][cell.x].element = this.cells[i++].view;

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

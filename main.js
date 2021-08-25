import { Element, Point, Figure, CurrentFigure } from './class.js';
import { Grid } from './grid.js';
import { Beetle } from './class_beetle.js';
import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME, STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y, NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE, TIMES_BREATH_LOSE
} from './const.js';
let display;
let model;
let controller;

//Объект в котором хранится вся модель игры
class Model {
	// Текущие очки
	scores;
	// Массив со значениями сетки
	grid;
	// Текущая фигура
	currentFigure;
	// Следующая фигура
	nextFigure;
	// Объект жука, с его координатами, направлением движения и кадром движения
	beetle;
	// Показывает задыхаемся мы или нет
	breath;
	// Время которое прошло с момента нехватки дыхания
	timeBreath;

	divBreath;
	// Инициализация модели игры
	constructor() {
		// Инициализируем сетку с случайными числами фона и заданием элементов
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		// Создаем новую фигуру
		this.nextFigure = new Figure();
		this.formCurrentFigure();

		// Создаем жука
		this.beetle = new Beetle(this.grid);
		// Задаем время для дыхания после истечения которого будет проигрыш
		this.timeBreath = TIMES_BREATH_LOSE;
		// С самого начала жук дышит
		this.breath = false;

		// Инициализируем очки и рекорд
		this.scores = 0;
		// Выводим рекорд на экран
		document.getElementById('record').innerHTML = String(localStorage.getItem('Record') || 0).padStart(6, "0");
		// Выводим секунды дыхания
		let h1 = document.getElementById("Breath");
		if (h1) h1.parentNode.removeChild(h1);
		// Задаем элемент разметки для окраски в зависимости от стадии дыхания
		this.divBreath = document.getElementById("infoID");
		this.renderBreath();
	};

	renderBreath() {
		let int = Math.floor(this.timeBreath) * 255 / TIMES_BREATH_LOSE;
		this.divBreath.style.backgroundColor = `rgb(255, ${int}, ${int})`;
	}

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cell);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисовку в методе view.draw
		//view.drawNextFigure();
	};

	//Фиксация фигуры
	fixation() {
		//Проверяем удаление строки
		this.grid.space.forEach((y) => {
			if (y.every((x) => x.element !== 0)) {
				for (let i = this.grid.space.indexOf(y); i > 0; i--)
					for (let j = 0; j < display.canvas.width / SIZE_TILES; j++) {
						this.grid.space[i][j].element = this.grid.space[i - 1][j].element;
						this.grid.space[i][j].status.L = this.grid.space[i - 1][j].status.L;
						this.grid.space[i][j].status.R = this.grid.space[i - 1][j].status.R;
						this.grid.space[i][j].status.U = this.grid.space[i - 1][j].status.U;
					}

				for (let j = 0; j < display.canvas.width / SIZE_TILES; j++)
					this.grid.space[0][j].setZero();

				this.scores += 100;
				this.beetle.deleteRow = 1;
				controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
				//?Проверить как лучше чтобы жук падал сразу при исчезновании или двигался вниз
				// if (this.beetle.positionTile.y < this.grid.indexOf(y))
				// 	this.beetle.positionTile.y += 1;
				// Тестирование при исчезновании строки, если жук запрыгивает на 2 клетки
				//if (this.beetle.moveY === "U") this.beetle.moveY = "0";
				//if (this.beetle.moveY === "UU") this.beetle.moveY = "U";
			}
		})

		// Пишем код для того когда жук остался без воздуха
		if (!this.beetle.isBreath()) {
			if (document.getElementById("Breath") === null) {
				let h1 = `<h1 id="Breath">Задыхаемся<br/>Осталось секунд: ${TIMES_BREATH_LOSE}</h1>`
				document.getElementsByClassName("info")[0].insertAdjacentHTML("beforeend", h1);
				this.breath = true;
			}

		}
		else {
			let h1 = document.getElementById("Breath");
			if (h1 !== null)
				h1.parentNode.removeChild(h1);
			this.timeBreath = TIMES_BREATH_LOSE;
			this.breath = false;
		}

	};

	tick() {
		function lose() {
			localStorage.setItem('Record', model.scores);
			alert("Вы проиграли");
			model = new Model();
			controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		};

		// Проверяем нажатие клавиатуры и запускаем события
		if (controller.pressed.left) this.currentFigure.moveLeft();
		if (controller.pressed.right) this.currentFigure.moveRight();
		if (controller.pressed.up) this.currentFigure.rotate();
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO, this) === false) {
			lose();
			return;
		} else if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO, this) === true) {
			let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
			if (this.grid.space[tile.y][tile.x].element != 0 && this.beetle.eat == 0) {
				lose();
				return;
			}
			this.fixation();
			this.formCurrentFigure();
		}
		// Проверяем возможность дыхания
		if (this.breath) {
			this.timeBreath -= UPDATE_TIME / 1000;
			let h1 = document.getElementById("Breath");
			h1.outerHTML = `<h1 id="Breath">Задыхаемся<br/>Осталось секунд: ${Math.floor(this.timeBreath)}</h1>`;
			this.renderBreath();
		}
		let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		if ((this.grid.space[tile.y][tile.x].element != 0 && this.beetle.eat == 0) ||
			this.timeBreath <= 0) {
			lose();
			return;
		}
		// !Добавить проверку дыхания вдруг жук сломал клетку и освободил
		this.beetle.beetleAnimation();
		display.draw();
	};
};
//Объект рисования
class Display {
	canvas;
	ctx;
	canvasNextFigure;
	ctxNextFigure;
	txtScores;
	imgFon;
	imgKv;
	imgBeetle;
	constructor() {
		this.canvas = document.getElementById('canvasId');
		this.ctx = this.canvas.getContext("2d");
		this.canvasNextFigure = document.getElementById('canvasNextFigureId');
		this.ctxNextFigure = this.canvasNextFigure.getContext("2d");
		this.txtScores = document.getElementById('scores');

		//Формируем картинки для фигур
		this.imgKv = new Array(NUMBER_FIGURE_ELEMENTS);
		for (let i = 0; i < this.imgKv.length; i++) {
			this.imgKv[i] = new Image();
		}

		this.imgFon = new Image();
		//загружаем картинки фона
		this.imgFon.src = DIRECTORY_IMG + 'fon.png';

		//загружаем картинки фигур
		for (let i = 0; i < this.imgKv.length; i++)
			this.imgKv[i].src = DIRECTORY_IMG + 'Kvadrat' + (i + 1) + '.png';

		//загружаем картинки жука
		this.imgBeetle = new Image();
		this.imgBeetle.src = DIRECTORY_IMG + 'Beetle.png';
	};
	drawNextFigure() {
		this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
		for (let i = 0; i < model.nextFigure.cell.length; i++) {
			this.ctxNextFigure.drawImage(this.imgKv[model.nextFigure.cell[i].view - 1],
				0, 0, SIZE_TILES, SIZE_TILES,
				(model.nextFigure.cell[i].x * SIZE_TILES), (model.nextFigure.cell[i].y * SIZE_TILES), SIZE_TILES, SIZE_TILES);
		}
	};

	draw() {
		let offsetX, offsetY;
		//Рисуем фон
		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
				this.ctx.drawImage(this.imgFon,
					Math.floor(model.grid.space[i][j].background / 4) * SIZE_TILES, (model.grid.space[i][j].background % 4) * SIZE_TILES, SIZE_TILES,
					SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);

		//Рисуем целые и поврежденные элементы в стакане
		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
				if (model.grid.space[i][j].element !== 0) {
					if (model.grid.space[i][j].isStatusClear())
						[offsetX, offsetY] = [...[0, 0]];
					else if (model.grid.space[i][j].status.L !== 0)
						[offsetX, offsetY] = [...[(model.grid.space[i][j].status.L - 1) * SIZE_TILES, 2 * SIZE_TILES]];
					else if (model.grid.space[i][j].status.R !== 0)
						[offsetX, offsetY] = [...[(model.grid.space[i][j].status.R - 1) * SIZE_TILES, 1 * SIZE_TILES]];
					else if (model.grid.space[i][j].status.U !== 0)
						[offsetX, offsetY] = [...[(model.grid.space[i][j].status.U - 1) * SIZE_TILES, 3 * SIZE_TILES]];

					this.ctx.drawImage(this.imgKv[model.grid.space[i][j].element - 1],
						offsetX, offsetY, SIZE_TILES, SIZE_TILES,
						j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
				}


		//Рисуем текущую падующую фигуру
		for (let i = 0; i < model.currentFigure.cell.length; i++) {
			this.ctx.drawImage(this.imgKv[model.currentFigure.cell[i].view - 1],
				0, 0, SIZE_TILES, SIZE_TILES,
				(model.currentFigure.cell[i].x * SIZE_TILES) + model.currentFigure.position.x, (model.currentFigure.cell[i].y * SIZE_TILES) + model.currentFigure.position.y, SIZE_TILES, SIZE_TILES);
		}

		//Рисуем бегующего жука
		[offsetX, offsetY] = model.beetle.getSprite();
		this.ctx.drawImage(this.imgBeetle, offsetX * SIZE_TILES, offsetY * SIZE_TILES, SIZE_TILES, SIZE_TILES, model.beetle.position.x, model.beetle.position.y, SIZE_TILES, SIZE_TILES);

		//Обновляем
		this.txtScores.innerHTML = String(model.scores).padStart(6, "0");

		display.drawNextFigure();
	}
};

class Controller {
	pressed;
	codes;
	constructor(codes) {
		//Задаем начальное значение падения
		this.pressed = Object.create(null);
		this.codes = codes;

		document.addEventListener("keydown", this.handler);
		document.addEventListener("keyup", this.handler);
	};
	handler = event => {
		if (this.codes.hasOwnProperty(event.keyCode)) {
			this.pressed[controller.codes[event.keyCode]] = event.type == "keydown";
			event.preventDefault();
		}
	}
};

window.onload = function () {
	display = new Display();
	model = new Model();
	controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
	display.draw();
	setInterval(() => model.tick(), UPDATE_TIME);
}






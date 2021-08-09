import { Element, Point, Figure, CurrentFigure } from './class.js';
import { Grid } from './grid.js';
import { Beetle } from './class_beetle.js';
import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME, STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y, NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE
} from './const.js';
let display;
let model;
let controller;

//Объект в котором хранится вся модель игры
class Model {
	//Текущие очки
	scores;
	//Рекорд очков за все время
	record;
	// Массив со значениями сетки
	grid;
	//Текущая фигура
	currentFigure;
	//Следующая фигура
	nextFigure;
	//ID строки для вывода рекорда
	txtRecord;
	//Объект жука, с его координатами, направлением движения и кадром движения
	beetle;
	//Инициализация модели игры
	constructor() {
		//Инициализируем сетку с случайными числами фона и заданием элементов
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);
		//Создаем новую фигуру
		this.nextFigure = new Figure();
		this.formCurrentFigure();
		//Создаем жука
		this.beetle = new Beetle(this.grid);
		//Инициализируем очки и рекорд
		this.scores = 0;
		this.record = localStorage.getItem('Record');
		this.txtRecord = document.getElementById('record');
		this.txtRecord.innerHTML = String(this.record).padStart(6, "0");

		//?Временное для тестирования
		this.grid.space[28][0].element = 1;
		this.grid.space[28][1].element = 2;
		this.grid.space[28][2].element = 3;
		this.grid.space[28][3].element = 4;
		this.grid.space[27][3].element = 4;
		this.grid.space[26][3].element = 4;
		this.grid.space[25][0].element = 4;
		this.grid.space[25][1].element = 4;
		this.grid.space[25][2].element = 4;
		this.grid.space[25][3].element = 4;
		for (let i = 0; i < display.canvas.width / SIZE_TILES - 1; i++)
			this.grid.space[29][i].element = 2;
		this.beetle.positionTile.y = 28;
		this.beetle.positionTile.x = 8;
	};

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cell);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисову в методе view.draw
		//view.drawNextFigure();
	};

	//Удаление строки
	deleteRow() {
		this.grid.space.forEach((y) => {
			if (y.every((x) => x.element !== 0)) {
				for (let i = this.grid.space.indexOf(y); i > 0; i--)
					for (let j = 0; j < display.canvas.width / SIZE_TILES; j++) {
						this.grid.space[i][j].element = this.grid.space[i - 1][j].element;
						this.grid.space[i][j].status.L = this.grid.space[i - 1][j].status.L;
						this.grid.space[i][j].status.R = this.grid.space[i - 1][j].status.R;
						this.grid.space[i][j].status.U = this.grid.space[i - 1][j].status.U;
					}

				for (let j = 0; j < display.canvas.width / SIZE_TILES; j++) {
					this.grid.space[0][j].element = 0;
					this.grid.space[0][j].status.L = 0;
					this.grid.space[0][j].status.R = 0;
					this.grid.space[0][j].status.U = 0;
				}

				this.scores += 100;

				//?Проверить как лучше чтобы жук падал сразу при исчезновании или двигался вниз
				// if (this.beetle.positionTile.y < this.grid.indexOf(y))
				// 	this.beetle.positionTile.y += 1;
				// Тестирование при исчезновании строки, если жук запрыгивает на 2 клетки
				//if (this.beetle.trafficY === "U") this.beetle.trafficY = "0";
				//if (this.beetle.trafficY === "UU") this.beetle.trafficY = "U";
			}
		})
	};

	tick() {
		// Проверяем нажатие клавиатуры и запускаем события
		if (controller.pressed.left) this.currentFigure.moveLeft();
		if (controller.pressed.right) this.currentFigure.moveRight();
		if (controller.pressed.up) this.currentFigure.rotate();
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO,this);



		if (this.grid.space[this.beetle.positionTile.y][this.beetle.positionTile.x].element != 0 && this.beetle.eat == 0) {
			console.log("!!!Вы проиграли!!!");
			localStorage.setItem('Record', model.scores);
			alert("Вы проиграли");
			model = new Model();
			return;
		}

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
		for (let i = 0; i < this.imgKv.length; i++) {
			this.imgKv[i].src = DIRECTORY_IMG + 'Kvadrat' + (i + 1) + '.png';
		}

		this.imgBeetle = new Image();
		this.imgBeetle.src = DIRECTORY_IMG + 'Beetle.png';
	};
	drawNextFigure() {
		this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
		for (let i = 0; i < model.nextFigure.cell.length; i++) {
			this.ctxNextFigure.drawImage(this.imgKv[model.nextFigure.cell[i].view - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.nextFigure.cell[i].x * SIZE_TILES), (model.nextFigure.cell[i].y * SIZE_TILES), SIZE_TILES, SIZE_TILES);
		}
	};
	draw() {

		//Рисуем фон и заполненный стакан
		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
				this.ctx.drawImage(this.imgFon, Math.floor(model.grid.space[i][j].background / 4) * SIZE_TILES, (model.grid.space[i][j].background % 4) * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);

		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
				if (model.grid.space[i][j].element !== 0)
					if (model.grid.space[i][j].status.L === 0 && model.grid.space[i][j].status.R === 0 && model.grid.space[i][j].status.U === 0)
						this.ctx.drawImage(this.imgKv[model.grid.space[i][j].element - 1], 0, 0, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
					else if (model.grid.space[i][j].status.L !== 0)
						this.ctx.drawImage(this.imgKv[model.grid.space[i][j].element - 1], (model.grid.space[i][j].status.L - 1) * SIZE_TILES, 2 * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
					else if (model.grid.space[i][j].status.R !== 0)
						this.ctx.drawImage(this.imgKv[model.grid.space[i][j].element - 1], (model.grid.space[i][j].status.R - 1) * SIZE_TILES, 1 * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
					else if (model.grid.space[i][j].status.U !== 0)
						this.ctx.drawImage(this.imgKv[model.grid.space[i][j].element - 1], (model.grid.space[i][j].status.U - 1) * SIZE_TILES, 3 * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);


		//Рисуем текущую падующую фигуру
		for (let i = 0; i < model.currentFigure.cell.length; i++) {
			this.ctx.drawImage(this.imgKv[model.currentFigure.cell[i].view - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.currentFigure.cell[i].x * SIZE_TILES) + model.currentFigure.position.x, (model.currentFigure.cell[i].y * SIZE_TILES) + model.currentFigure.position.y, SIZE_TILES, SIZE_TILES);
		}

		//Рисуем бегующего жука
		let imgSmX;
		let imgSmY;
		if (model.beetle.eat == 0 && (model.beetle.trafficY == "0" || (model.beetle.framesAnimation % 2 == 0 && model.beetle.trafficY != "U" && model.beetle.trafficY != "UU")))
			[imgSmX, imgSmY] = [...[0, 0]];
		// Показываем анимацию при движении влево
		else if (model.beetle.trafficX == "L" && model.beetle.trafficY == "0")
			if (model.beetle.eat == 0)
				[imgSmX, imgSmY] = [...[1 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[imgSmX, imgSmY] = [...[1 * SIZE_TILES, 1 * SIZE_TILES]];
				else
					[imgSmX, imgSmY] = [...[2 * SIZE_TILES, 1 * SIZE_TILES]];
		// Показываем анимацию при движении вправо
		else if (model.beetle.trafficX == "R" && model.beetle.trafficY == "0")
			if (model.beetle.eat == 0)
				[imgSmX, imgSmY] = [...[2 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[imgSmX, imgSmY] = [...[1 * SIZE_TILES, 2 * SIZE_TILES]];
				else
					[imgSmX, imgSmY] = [...[2 * SIZE_TILES, 2 * SIZE_TILES]];




		else if (model.beetle.trafficX == "L" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
			[imgSmX, imgSmY] = [...[0, 1 * SIZE_TILES]];
		else if (model.beetle.trafficX == "R" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
			[imgSmX, imgSmY] = [...[0, 2 * SIZE_TILES]];
		else
			if (model.beetle.eat == 0)
				[imgSmX, imgSmY] = [...[3 * SIZE_TILES, 0]];
			else
				if (model.beetle.framesAnimation % 2 == 0)
					[imgSmX, imgSmY] = [...[1 * SIZE_TILES, 3 * SIZE_TILES]];
				else
					[imgSmX, imgSmY] = [...[2 * SIZE_TILES, 3 * SIZE_TILES]];


		this.ctx.drawImage(this.imgBeetle, imgSmX, imgSmY, SIZE_TILES, SIZE_TILES, model.beetle.positionTile.x * SIZE_TILES + model.beetle.position.x, model.beetle.positionTile.y * SIZE_TILES + model.beetle.position.y, SIZE_TILES, SIZE_TILES);

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
	setInterval(() => model.tick(), UPDATE_TIME);
}






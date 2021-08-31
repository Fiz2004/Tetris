import { Point, Figure, CurrentFigure } from './class.js';
import { Grid } from './grid.js';
import { Beetle } from './class_beetle.js';
import { Controller } from './controller.js';
import { Display } from './display.js';
import {
	SIZE_TILES, UPDATE_TIME, STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y,
	TIMES_BREATH_LOSE
} from './const.js';
// Экземпляр объекта Display, для вывода на экран
let display;
// Экземпляр объекта Model, для внутренней структуры игры
let model;
// Экземпляр объекта Controller, для взаимодействия
let controller;
// Таймер для движения игры
let timer;

//Класс в котором хранится вся модель игры
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
	// Элемент который меняет поведение при дыхании
	elementDivBreath;
	// Элемент который показывает секунды дыхания
	elementTimeBreath;
	// Инициализация модели игры
	constructor() {
		// Инициализируем сетку с случайными числами фона и заданием элементов
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		// Создаем новую фигуру
		this.formCurrentFigure();

		// Создаем жука
		this.beetle = new Beetle(this.grid);

		// Инициализируем очки
		this.scores = 0;

		// Выводим рекорд на экран
		document.querySelector('#record').textContent = String(localStorage.getItem('Record') || 0).padStart(6, "0");

		// Задаем функцию для жука что при еде увеличить количество очков
		this.beetle.handleEat = function () { model.scores += 50 };

		// Задаем элемент разметки для окраски в зависимости от стадии дыхания
		this.elementTimeBreath = document.querySelector("#Breath");
		this.elementDivBreath = document.querySelector("#infoID");

		// Обновляем интерфейс связанный с дыханием
		this.renderBreath();
	};

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cell);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисовку в методе display.draw
		//display.drawNextFigure();
	};

	// Обновление элементов связанных с дыханием
	renderBreath() {
		// Проверяем есть ли воздух у жука
		if (!this.beetle.isBreath()) {
			if (!this.elementTimeBreath) {
				let element = document.createElement("h1");
				element.id = "Breath";
				document.querySelector("#infoID").append(element);;
				this.elementTimeBreath = document.querySelector("#Breath");
				this.beetle.breath = true;
			}
			else {
				// Выводим секунды дыхания
				this.beetle.timeBreath -= UPDATE_TIME / 1000;
			}
			this.elementTimeBreath.innerHTML = `Задыхаемся<br/>Осталось секунд: ${Math.ceil(this.beetle.timeBreath)}`;
		}
		else {
			if (this.elementTimeBreath) {
				this.elementTimeBreath.parentNode.removeChild(this.elementTimeBreath);
				this.elementTimeBreath = null;
			}
			this.beetle.timeBreath = TIMES_BREATH_LOSE;
			this.beetle.breath = false;
		}
		// Закрашиваем элемент связанный с дыханием
		let int = Math.floor(this.beetle.timeBreath) * 255 / TIMES_BREATH_LOSE;
		this.elementDivBreath.style.backgroundColor = `rgb(255, ${int}, ${int})`;
	};

	//Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		let count = 0;
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

				count++;

				controller.refresh;
			}
		})
		for (let i = 1; i <= count; i++)
			this.scores += i * 100;

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения
		this.beetle.deleteRow = 1;
		this.renderBreath();
	};

	tick() {
		function lose() {
			localStorage.setItem('Record', model.scores);
			model.newGame();
		};
		// Проверяем нажатие клавиатуры и запускаем события
		if (controller.pressed.left) this.currentFigure.moveLeft();
		if (controller.pressed.right) this.currentFigure.moveRight();
		if (controller.pressed.up) this.currentFigure.rotate();
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO) === false) {
			// Стакан заполнен игра окончена
			lose();
			return;
		} else if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO)) {
			this.fixation();
			this.formCurrentFigure();
		} else {
			// Фигура достигла препятствия
			let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
			let array = this.currentFigure.getPositionTile();
			let res = false;
			for (let elem of array) {
				if (elem.x == tile.x && elem.y == tile.y) {
					res = true;
					break;
				}
			}

			if ((this.grid.space[tile.y][tile.x].element != 0 && this.beetle.eat == 0)
				|| res) {
				lose();
				return;
			}
		}
		// Проверяем возможность дыхания
		this.renderBreath();

		let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		if ((this.grid.space[tile.y][tile.x].element != 0 && this.beetle.eat == 0) ||
			this.beetle.timeBreath <= 0) {
			lose();
			return;
		}
		// !Добавить проверку дыхания вдруг жук сломал клетку и освободил
		this.beetle.beetleAnimation();
		display.draw(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);
	};
	newGame() {
		controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		//this = new Model();
		model = new Model();
		display.draw(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);
		clearInterval(timer);
		timer = setInterval(() => model.tick(), UPDATE_TIME);
		document.getElementById("pause").innerHTML = "Пауза";
	}
};


window.onload = function () {
	display = new Display();
	model = new Model();
	model.newGame();
}
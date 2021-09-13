import { Point, Figure, CurrentFigure } from './class.js';
import { Grid } from './grid.js';
import { Beetle } from './class_beetle.js';
import { Controller } from './controller.js';
import { Display } from './display.js';
import {
	SIZE_TILES, START_STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y,
	TIMES_BREATH_LOSE,
	PLUS_STEP_MOVE_AUTO,
	TIME_UPDATE_CONTROLLER,
} from './const.js';
// Экземпляр объекта Display, для вывода на экран
let display;
// Экземпляр объекта Model, для внутренней структуры игры
let model;
// Экземпляр объекта Controller, для взаимодействия
let controller;

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
		this.stepMoveAuto = START_STEP_MOVE_AUTO;

		// Создаем жука
		this.beetle = new Beetle(this.grid);

		// Инициализируем очки
		this.scores = 0;

		// Выводим рекорд на экран
		document.querySelector('#record').textContent = String(localStorage.getItem('Record') || 0).padStart(6, "0");

		// Задаем функцию для жука что при еде увеличить количество очков
		// !!!Переписать чтобы обновлялось внутри жука
		this.beetle.handleEat = function () { model.scores += 50 }

		// Задаем элемент разметки для окраски в зависимости от стадии дыхания
		this.elementTimeBreath = document.querySelector("#Breath");
		this.elementDivBreath = document.querySelector("#infoID");

		// Обновляем интерфейс связанный с дыханием
		this.renderBreath();

		this.lastTime = Date.now();
		this.deltaTime = 0;
		this.pause = false;
		this.pauseTime = null;
	};

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		//Рисуем следующую фигуру
		display.drawNextFigure(this.nextFigure);
	};

	ifNotBreath() {
		let sec = TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / 1000);
		if (!this.elementTimeBreath) {
			let element = document.createElement("h1");
			element.id = "Breath";
			document.querySelector("#infoID").append(element);;
			this.elementTimeBreath = document.querySelector("#Breath");
			this.beetle.breath = true;
		}
		this.elementTimeBreath.innerHTML = `Задыхаемся<br/>Осталось секунд: ${sec}`;
	}
	ifBreath() {
		if (this.elementTimeBreath) {
			this.elementTimeBreath.parentNode.removeChild(this.elementTimeBreath);
			this.elementTimeBreath = null;
		}
		this.beetle.timeBreath = Date.now();
		this.beetle.breath = false;
	}

	// Обновление элементов связанных с дыханием
	renderBreath() {
		// Проверяем есть ли воздух у жука
		if (!(this.beetle.isBreath()))
			this.ifNotBreath();
		else
			this.ifBreath();

		// Закрашиваем элемент связанный с дыханием
		let sec = Math.ceil((Date.now() - this.beetle.timeBreath) / 1000);
		let int = Math.floor(sec) * 255 / TIMES_BREATH_LOSE;
		this.elementDivBreath.style.backgroundColor = `rgb(255, ${255 - int}, ${255 - int})`;
	};

	//Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		let countRowFull = this.grid.getCountRowFull();
		if (countRowFull != 0) controller.refresh;

		for (let i = 1; i <= countRowFull; i++)
			this.scores += i * 100;

		this.stepMoveAuto = PLUS_STEP_MOVE_AUTO * Math.ceil(this.scores / 300);
		this.ifRecord();

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения{
		this.beetle.deleteRow = 1;
		this.renderBreath(0, this.beetle);
	};

	ifRecord() {
		let record = localStorage.getItem('Record') || 0;
		if (this.scores > record) {
			document.querySelector('#record').textContent = String(this.scores).padStart(6, "0");
			localStorage.setItem('Record', this.scores);
		}
	}

	lose() {
		model.ifRecord();
		model = new Model();
		this.newGame();
	};

	update(deltaTime) {
		this.deltaTime += deltaTime;

		if (this.deltaTime > TIME_UPDATE_CONTROLLER) {
			// Проверяем нажатие клавиатуры и запускаем события
			if (controller.pressed.left) this.currentFigure.moveLeft();
			if (controller.pressed.right) this.currentFigure.moveRight();
			if (controller.pressed.up) this.currentFigure.rotate();
			// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
			if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : this.stepMoveAuto) === false) {
				// Стакан заполнен игра окончена
				this.lose();
				return;
			} else if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : this.stepMoveAuto)) {
				this.fixation();
				this.formCurrentFigure();
			} else {
				// Фигура достигла препятствия
				let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
				for (let elem of this.currentFigure.getPositionTile())
					if ((elem.x == tile.x && elem.y == tile.y)
						|| (this.grid.space[tile.y][tile.x].element != 0
							&& this.beetle.eat == 0)) {
						this.lose();
						return;
					}
			}
			// Проверяем возможность дыхания
			this.renderBreath();

			let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
			if ((this.grid.space[tile.y][tile.x].element != 0 && this.beetle.eat == 0) ||
				TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / 1000) <= 0) {
				this.lose();
				return;
			}

			this.beetle.beetleAnimation();
			this.deltaTime = 0;
		}
	};
	newGame() {
		controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		document.getElementById("new_game").onclick = this.clickNewgame;
		document.getElementById("pause").onclick = this.clickPause;
		this.clickNewgame();
	}
	clickNewgame = () => {
		model = new Model();
		document.getElementById("pause").textContent = "Пауза";
	}
	clickPause = () => {
		if (document.getElementById("pause").textContent == "Пауза") {
			document.getElementById("pause").textContent = "Продолжить";
			model.pause = true;
			model.pauseTime = Date.now();
		}
		else {
			document.getElementById("pause").textContent = "Пауза";
			model.pause = false;
			model.beetle.timeBreath += Date.now() - model.pauseTime;
		}
	}
	game = () => {
		let now = Date.now();
		let deltaTime = (now - this.lastTime) / 1000.0;

		!this.pause && this.update(deltaTime);
		display.render(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);

		this.lastTime = now;

		requestAnimationFrame(model.game);
	}
};


window.onload = function () {
	display = new Display();
	display.onload = () => {
		model = new Model();
		model.newGame();
		model.game()
	}
	display.load();
}

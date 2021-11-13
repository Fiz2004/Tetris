import { Point, Figure, CurrentFigure } from './class.js';
import { Grid } from './grid.js';
import { Beetle } from './class_beetle.js';
import { Controller } from './controller.js';
import {
	SIZE_TILES, START_STEP_MOVE_AUTO,
	STEP_MOVE_KEY_Y,
	TIMES_BREATH_LOSE,
	PLUS_STEP_MOVE_AUTO,
	TIME_UPDATE_CONTROLLER,
} from './const.js';

//Класс в котором хранится вся модель игры
export class State {
	scores;
	grid;
	currentFigure;
	nextFigure;
	beetle;
	// Элемент который меняет поведение при дыхании
	elementDivBreath;
	// Элемент который показывает секунды дыхания
	elementTimeBreath;
	constructor(display) {
		this.display = display;
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		this.createCurrentFigure();
		this.stepMoveAuto = START_STEP_MOVE_AUTO;

		this.beetle = new Beetle(this.grid, this.scores);

		this.scores = 0;
		this.status = "playing";

		document.querySelector('#record').textContent = String(localStorage.getItem('Record') || 0).padStart(6, "0");

		// Задаем элемент разметки для окраски в зависимости от стадии дыхания
		this.elementTimeBreath = document.querySelector("#Breath");
		this.elementDivBreath = document.querySelector("#infoID");

		// Обновляем интерфейс связанный с дыханием
		this.renderBreath();

		this.deltaTime = 0;
		this.pauseTime = null;

		this.controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		document.getElementById("new_game").onclick = () => this.clickNewgame();
		document.getElementById("pause").onclick = () => this.clickPause();
	}

	createCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		this.display.drawNextFigure(this.nextFigure);
	}

	ifNotBreath() {
		let sec = TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / 1000);
		if (!this.elementTimeBreath) {
			let element = document.createElement("h1");
			element.id = "Breath";
			document.querySelector("#infoID").append(element);
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
	}

	//Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		let countRowFull = this.grid.getCountRowFull();
		if (countRowFull !== 0) this.controller.refresh();

		for (let i = 1; i <= countRowFull; i++)
			this.scores += i * 100;

		this.stepMoveAuto = PLUS_STEP_MOVE_AUTO + PLUS_STEP_MOVE_AUTO * Math.ceil(this.scores / 300);
		this.ifRecord();

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения{
		this.beetle.deleteRow = 1;
		this.renderBreath(0, this.beetle);
	}

	ifRecord() {
		let record = localStorage.getItem('Record') || 0;
		if (this.scores > record) {
			document.querySelector('#record').textContent = String(this.scores).padStart(6, "0");
			localStorage.setItem('Record', this.scores);
		}
	}

	update(deltaTime) {
		this.deltaTime += deltaTime;

		if (this.deltaTime > TIME_UPDATE_CONTROLLER) {
			if (this.status !== "pause") {
				if (this.actionsControl() === false) {
					this.ifRecord();
					return false;
				}
				// Проверяем возможность дыхания
				if (this.renderBreath() || this.checkLose()) {
					this.ifRecord();
					return false;
				}

				this.beetle.beetleAnimation();
				this.deltaTime = 0;
			}
		}

		if (this.status === "new game") {
			this.ifRecord();
			return false;
		}

		return true;
	}

	checkLose() {
		let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		if ((this.grid.space[tile.y][tile.x].element !== 0 && this.beetle.eat === 0) ||
			TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / 1000) <= 0) {
			return true;
		}

		return false;
	}

	actionsControl() {
		if (this.controller.pressed.left) this.currentFigure.moveLeft();
		if (this.controller.pressed.right) this.currentFigure.moveRight();
		if (this.controller.pressed.up) this.currentFigure.rotate();
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		let resultMoveDown = this.currentFigure.moveDown(this.controller.pressed.down ? STEP_MOVE_KEY_Y : this.stepMoveAuto);
		if (resultMoveDown === false) {
			// Стакан заполнен игра окончена
			return false;
		} else if (resultMoveDown === true) {
			this.fixation();
			this.createCurrentFigure();
		} else {
			// Фигура достигла препятствия
			if (this.isCrushedBeetle()) {
				return false;
			}
		}
	}

	isCrushedBeetle() {
		let tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		for (let elem of this.currentFigure.getPositionTile())
			if ((elem.x === tile.x && elem.y === tile.y)
				|| (this.grid.space[tile.y][tile.x].element !== 0
					&& this.beetle.eat === 0))
				return true;
		return false;
	}


	clickNewgame() {
		this.status = "new game";
		document.getElementById("pause").textContent = "Пауза";
	}

	clickPause() {
		if (document.getElementById("pause").textContent === "Пауза") {
			document.getElementById("pause").textContent = "Продолжить";
			this.status = "pause";
			this.pauseTime = Date.now();
		} else {
			document.getElementById("pause").textContent = "Пауза";
			this.status = "playing";
			this.beetle.timeBreath += Date.now() - this.pauseTime;
		}
	}
}
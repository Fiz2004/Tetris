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
// Хранит время предыдущего обновления
let lastTime;

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
	};

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисовку в методе display.draw
		//display.drawNextFigure();
	};

	ifNotBreath() {
		if (this.elementTimeBreath) {
			// Выводим секунды дыхания
			this.beetle.timeBreath -= 80 / 1000;
		}
		else {
			let element = document.createElement("h1");
			element.id = "Breath";
			document.querySelector("#infoID").append(element);;
			this.elementTimeBreath = document.querySelector("#Breath");
			this.beetle.breath = true;
		}
		this.elementTimeBreath.innerHTML = `Задыхаемся<br/>Осталось секунд: ${Math.ceil(this.beetle.timeBreath)}`;
	}
	ifBreath() {
		if (this.elementTimeBreath) {
			this.elementTimeBreath.parentNode.removeChild(this.elementTimeBreath);
			this.elementTimeBreath = null;
		}
		this.beetle.timeBreath = TIMES_BREATH_LOSE;
		this.beetle.breath = false;
	}

	// Обновление элементов связанных с дыханием
	renderBreath(deltaTime) {
		// Проверяем есть ли воздух у жука
		if (!(this.beetle.isBreath()))
			this.ifNotBreath();
		else
			this.ifBreath();

		// Закрашиваем элемент связанный с дыханием
		let int = Math.floor(this.beetle.timeBreath) * 255 / TIMES_BREATH_LOSE;
		this.elementDivBreath.style.backgroundColor = `rgb(255, ${int}, ${int})`;
	};

	//Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		let countRowFull = this.grid.getCountRowFull();
		if (countRowFull != 0) controller.refresh;

		for (let i = 1; i <= countRowFull; i++)
			this.scores += i * 100;

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения{
		this.beetle.deleteRow = 1;
		this.renderBreath(0, this.beetle);
	};
	lose() {
		localStorage.setItem('Record', model.scores);
		model.clickNewGame();
	};

	update(deltaTime) {
		this.deltaTime += deltaTime;

		if (this.deltaTime > 0.08) {
			// Проверяем нажатие клавиатуры и запускаем события
			if (controller.pressed.left) this.currentFigure.moveLeft();
			if (controller.pressed.right) this.currentFigure.moveRight();
			if (controller.pressed.up) this.currentFigure.rotate();
			// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
			if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO) === false) {
				// Стакан заполнен игра окончена
				this.lose();
				return;
			} else if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y : STEP_MOVE_AUTO)) {
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
				this.beetle.timeBreath <= 0) {
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
		this.game()
		document.getElementById("pause").textContent = "Пауза";
	}
	clickPause = () => {
		if (document.getElementById("pause").textContent == "Пауза") {
			document.getElementById("pause").textContent = "Продолжить";
			this.pause = true;
		}
		else {
			document.getElementById("pause").textContent = "Пауза";
			this.pause = false;
		}
	}
	game = () => {
		let now = Date.now();
		let deltaTime = (now - this.lastTime) / 1000.0;

		!this.pause && this.update(deltaTime);
		display.render(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);

		this.lastTime = now;

		requestAnimationFrame(this.game);
		this.beetle.beetleAnimation(deltaTime);
	}
	newGame() {
		controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		document.getElementById("new_game").onclick = this.clickNewGame;
		document.getElementById("pause").onclick = this.clickPause;
	}
	clickNewGame = () => {
		model = new Model();
		document.getElementById("pause").innerHTML = "Пауза";
	}
	clickPause = () => {
		if (document.getElementById("pause").innerHTML == "Пауза") {
			document.getElementById("pause").innerHTML = "Продолжить";
			model.isPause = true;
		}
		else {
			document.getElementById("pause").innerHTML = "Пауза";
			model.isPause = false;
		}
	}
};


window.onload = function () {
	display = new Display();
	display.onload = () => {
		model = new Model();
		model.newGame();
	}
	display.load();
}

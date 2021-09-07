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
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисовку в методе display.draw
		//display.drawNextFigure(this.nextFigure);
	};

	ifNotBreath() {
		if (this.elementTimeBreath) {
			// Выводим секунды дыхания
			this.beetle.timeBreath -= UPDATE_TIME / 1000;
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
	renderBreath() {
		// Проверяем есть ли воздух у жука
		if (!this.beetle.isBreath())
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

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения
		this.beetle.deleteRow = 1;
		this.renderBreath();
	};
	lose() {
		localStorage.setItem('Record', model.scores);
		model.newGame();
	};

	tick() {

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
		// !Добавить проверку дыхания вдруг жук сломал клетку и освободил
		this.beetle.beetleAnimation();
		display.draw(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);
	};
	newGame() {
		controller = new Controller({ 37: "left", 38: "up", 39: "right", 40: "down" });
		controller.newgame = () => {
			model = new Model();
			display.draw(this.grid, this.currentFigure, this.beetle, this.scores, this.nextFigure);
			clearInterval(timer);
			timer = setInterval(() => model.tick(), UPDATE_TIME);
			document.getElementById("pause").innerHTML = "Пауза";
		}
		controller.pause = () => {
			if (document.getElementById("pause").innerHTML == "Пауза") {
				document.getElementById("pause").innerHTML = "Продолжить";
				clearInterval(timer);
			}
			else {
				document.getElementById("pause").innerHTML = "Пауза";
				timer = setInterval(() => model.tick(), UPDATE_TIME);
			}
		}
		document.getElementById("new_game").onclick = controller.newgame;
		document.getElementById("pause").onclick = controller.pause;
		controller.newgame();
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
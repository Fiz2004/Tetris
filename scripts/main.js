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
	beetle = [];
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
		for (let i = 0; i < 5; i++)
			this.beetle[i] = new Beetle(this.grid);

		// Инициализируем очки
		this.scores = 0;

		// Выводим рекорд на экран
		document.querySelector('#record').textContent = String(localStorage.getItem('Record') || 0).padStart(6, "0");

		// Задаем функцию для жука что при еде увеличить количество очков
		// !!!Переписать чтобы обновлялось внутри жука
		this.beetle.forEach((beetle) =>
			beetle.handleEat = function () { model.scores += 50 }
		)

		// Задаем элемент разметки для окраски в зависимости от стадии дыхания
		this.elementTimeBreath = document.querySelector("#Breath");
		this.elementDivBreath = document.querySelector("#infoID");

		this.isPause = false;
		//this.renderBreath();
	};

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисовку в методе display.draw
		//display.drawNextFigure(this.nextFigure);
	};

	ifNotBreath(beetle) {
		if (this.elementTimeBreath) {
			// Выводим секунды дыхания
			this.beetle.timeBreath -= UPDATE_TIME / 1000;
		}
		else {
			let element = document.createElement("h1");
			element.id = "Breath";
			document.querySelector("#infoID").append(element);;
			this.elementTimeBreath = document.querySelector("#Breath");
			beetle.breath = true;
		}
		this.elementTimeBreath.innerHTML = `Задыхаемся<br/>Осталось секунд: ${Math.ceil(this.beetle.timeBreath)}`;
	}
	ifBreath(beetle) {
		if (this.elementTimeBreath) {
			this.elementTimeBreath.parentNode.removeChild(this.elementTimeBreath);
			this.elementTimeBreath = null;
		}
		beetle.timeBreath = TIMES_BREATH_LOSE;
		beetle.breath = false;
	}

	// Обновление элементов связанных с дыханием
	renderBreath(deltaTime, beetle) {
		// Проверяем есть ли воздух у жука
		if (!(beetle.isBreath()))
			this.ifNotBreath(beetle);
		else
			this.ifBreath(beetle);

		// Закрашиваем элемент связанный с дыханием
		let int = Math.floor(beetle.timeBreath) * 255 / TIMES_BREATH_LOSE;
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
		this.beetle.forEach((beetle) => {
			beetle.deleteRow = 1;
			this.renderBreath(0, beetle);
		})
	};
	lose() {
		localStorage.setItem('Record', model.scores);
		model.clickNewGame();
	};
	update(deltaTime) {
		// Проверяем нажатие клавиатуры и запускаем события
		if (controller.pressed.left) this.currentFigure.moveLeft(deltaTime);
		if (controller.pressed.right) this.currentFigure.moveRight(deltaTime);
		if (controller.pressed.up) this.currentFigure.rotate(deltaTime);
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y * deltaTime : STEP_MOVE_AUTO * deltaTime) === false) {
			// Стакан заполнен игра окончена
			this.lose();
			return;
		} else if (this.currentFigure.moveDown(controller.pressed.down ? STEP_MOVE_KEY_Y * deltaTime : STEP_MOVE_AUTO * deltaTime)) {
			this.fixation();
			this.formCurrentFigure();
		} else {
			// Фигура достигла препятствия
			this.beetle.forEach((beetle) => {
				let tile = new Point(Math.ceil(beetle.position.x / SIZE_TILES), Math.ceil(beetle.position.y / SIZE_TILES));
				for (let elem of this.currentFigure.getPositionTile())
					if ((elem.x == tile.x && elem.y == tile.y)
						|| (this.grid.space[tile.y][tile.x].element != 0
							&& beetle.eat == 0)) {
						this.lose();
						return;
					}
			})
		}
		// Проверяем возможность дыхания

		this.beetle.forEach((beetle) => {
			this.renderBreath(deltaTime, beetle);

			let tile = new Point(Math.floor(beetle.position.x / SIZE_TILES), Math.floor(beetle.position.y / SIZE_TILES));
			if ((this.grid.space[tile.y][tile.x].element != 0 && beetle.eat == 0) ||
				beetle.timeBreath <= 0) {
				this.lose();
				return;
			}
			// !Добавить проверку дыхания вдруг жук сломал клетку и освободил
			beetle.beetleAnimation(deltaTime);
		})
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
		main();
	}
	display.load();
}

function main() {
	let now = Date.now();
	let deltaTime = (now - lastTime) / 1000 || 0;

	if (!model.isPause) {
		model.update(deltaTime);
		display.render(model.grid, model.currentFigure, model.beetle, model.scores, model.nextFigure);
	}
	lastTime = now;

	window.requestAnimationFrame(main);
}
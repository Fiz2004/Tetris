import { Point } from './class.js';
import { Figure, CurrentFigure } from './Figure.js';
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
	constructor(display) {
		this.display = display;
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		this.createCurrentFigure();
		this.stepMoveAuto = START_STEP_MOVE_AUTO;

		this.beetle = new Beetle(this.grid, this.scores);

		this.scores = 0;
		this.record = localStorage.getItem('Record') || 0;
		this.status = 'playing';

		this.deltaTime = 0;
		this.pauseTime = null;

		this.controller = new Controller({ 37: 'left', 38: 'up', 39: 'right', 40: 'down' });
		document.getElementById('new_game').onclick = () => this.clickNewgame();
		document.getElementById('pause').onclick = () => this.clickPause();
	}

	createCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		this.display.drawNextFigure(this.nextFigure);
	}

	//Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		const countRowFull = this.grid.getCountRowFull();
		if (countRowFull !== 0) {
			this.controller.refresh();
		}

		const scoresForRow = 100;
		const scoresForLevel = 300;
		for (let i = 1; i <= countRowFull; i++) {
			this.scores += i * scoresForRow;
		}

		this.stepMoveAuto = PLUS_STEP_MOVE_AUTO + PLUS_STEP_MOVE_AUTO * Math.ceil(this.scores / scoresForLevel);
		this.ifRecord();

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения{
		this.beetle.deleteRow = 1;
		this.beetle.isBreath();
	}

	ifRecord() {
		const record = localStorage.getItem('Record') || 0;
		if (this.scores > record) {
			this.record = this.scores;
			localStorage.setItem('Record', this.scores);
		}
	}

	update(deltaTime) {
		if (this.status === 'pause') {
			return true;
		}

		this.deltaTime += deltaTime;

		if (this.deltaTime > TIME_UPDATE_CONTROLLER) {
			if (this.actionsControl() === false) {
				this.ifRecord();
				return false;
			}
			// Проверяем возможность дыхания
			if (!this.beetle.isBreath() && this.checkLose()) {
				this.ifRecord();
				return false;
			}

			if (this.beetle.update() === 'eat') {
				this.scores += 50;
			}
			this.deltaTime = 0;
		}

		if (this.status === 'new game') {
			this.ifRecord();
			return false;
		}

		return true;
	}

	checkLose() {
		const mSecOfSec = 1000;
		const tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		if ((this.grid.space[tile.y][tile.x].element !== 0 && this.beetle.eat === 0) ||
			TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / mSecOfSec) <= 0) {
			return true;
		}

		return false;
	}

	actionsControl() {
		if (this.controller.pressed.left) {
			this.currentFigure.moveLeft();
		}
		if (this.controller.pressed.right) {
			this.currentFigure.moveRight();
		}
		if (this.controller.pressed.up) {
			this.currentFigure.rotate();
		}
		// Проверяем нажатие клавиши вниз и в таком случае ускоряем падение или двигаем по умолчанию
		const resultMoveDown = this.currentFigure.moveDown(this.controller.pressed.down ? STEP_MOVE_KEY_Y : this.stepMoveAuto);
		if (resultMoveDown === 'endGame') {
			// Стакан заполнен игра окончена
			return false;
		}
		if (resultMoveDown === 'fixation') {
			this.fixation();
			this.createCurrentFigure();
		}
		if (resultMoveDown === 'fall'
			// Фигура достигла препятствия
			&& this.isCrushedBeetle()) {
			return false;
		}

		return true;
	}

	isCrushedBeetle() {
		const tile = new Point(Math.floor(this.beetle.position.x / SIZE_TILES), Math.floor(this.beetle.position.y / SIZE_TILES));
		for (const elem of this.currentFigure.getPositionTile()) {
			if ((elem.x === tile.x && elem.y === tile.y)
				|| (this.grid.space[tile.y][tile.x].element !== 0
					&& this.beetle.eat === 0)) {
				return true;
			}
		}
		return false;
	}

	clickNewgame() {
		this.status = 'new game';
	}

	clickPause() {
		if (this.status === 'playing') {
			this.status = 'pause';
			this.pauseTime = Date.now();
		} else {
			this.status = 'playing';
			this.beetle.timeBreath += Date.now() - this.pauseTime;
		}
	}
}

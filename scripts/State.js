import { Point } from './class.js';
import { Figure, CurrentFigure } from './Figure.js';
import Grid from './grid.js';
import Beetle from './class_beetle.js';
import {
	SIZE_TILES,
	TIMES_BREATH_LOSE,
	TIME_UPDATE_CONTROLLER,
} from './const.js';

// Класс в котором хранится вся модель игры
export default class State {
	scores;

	grid;

	currentFigure;

	nextFigure;

	beetle;

	constructor(display) {
		this.display = display;
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		this.createCurrentFigure();

		this.beetle = new Beetle(this.grid, this.scores);

		this.scores = 0;
		this.record = localStorage.getItem('Record') || 0;
		this.status = 'playing';

		this.deltaTime = 0;
		this.pauseTime = null;
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

	createCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure.cells);
		this.nextFigure = new Figure();

		this.display.drawNextFigure(this.nextFigure);
	}

	// Фиксация фигуры
	fixation() {
		// Подсчитываем количество исчезнувших рядов, для увеличения количества очков
		const countRowFull = this.grid.getCountRowFull();
		if (countRowFull) {
			this.grid.deleteRows();
		}

		const scoresForRow = 100;
		for (let i = 1; i <= countRowFull; i++) {
			this.scores += i * scoresForRow;
		}

		this.currentFigure.fixation(this.scores);
		this.ifRecord();

		// Уведомляем жука что произошла фиксация фигуры, и надо проверить возможность движения{
		this.beetle.deleteRow = 1;
		this.beetle.isBreath(this.grid);
	}

	ifRecord() {
		const record = localStorage.getItem('Record') || 0;
		if (this.scores > record) {
			this.record = this.scores;
			localStorage.setItem('Record', this.scores);
		}
	}

	update(deltaTime, controller) {
		if (this.status === 'pause') {
			return true;
		}

		this.deltaTime += deltaTime;

		if (this.deltaTime > TIME_UPDATE_CONTROLLER) {
			if (this.actionsControl(controller) === false
				|| (!this.beetle.isBreath(this.grid) && this.checkLose())
				|| this.status === 'new game') {
				this.ifRecord();
				return false;
			}

			if (this.beetle.update(this.grid) === 'eat') {
				this.scores += 50;
			}
			this.deltaTime = 0;
		}

		return true;
	}

	actionsControl(controller) {
		const status = this.currentFigure.moves(controller.pressed);
		if (status === 'endGame'
			// Фигура достигла препятствия
			|| (status === 'fall' && this.isCrushedBeetle())) {
			// Стакан заполнен игра окончена
			return false;
		}
		if (status === 'fixation') {
			this.fixation();
			this.createCurrentFigure();
		}

		return true;
	}

	checkLose() {
		const mSecOfSec = 1000;
		const tile = new Point(Math.floor(this.beetle.position.x), Math.floor(this.beetle.position.y));
		if ((this.grid.space[tile.y][tile.x].element !== 0 && this.beetle.eat === 0)
			|| TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.beetle.timeBreath) / mSecOfSec) <= 0) {
			return true;
		}

		return false;
	}

	isCrushedBeetle() {
		const tile = new Point(Math.floor(this.beetle.position.x), Math.floor(this.beetle.position.y));
		for (const elem of this.currentFigure.getPositionTile()) {
			if ((elem.x === tile.x && elem.y === tile.y)
				|| (this.grid.space[tile.y][tile.x].element !== 0
					&& this.beetle.eat === 0)) {
				return true;
			}
		}
		return false;
	}
}

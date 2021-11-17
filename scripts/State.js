import Point from './Point.js';
import Figure from './Figure.js';
import CurrentFigure from './CurrentFigure.js';
import Grid from './grid.js';
import Character from './Character.js';
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
	character;

	constructor(display) {
		this.display = display;
		this.grid = new Grid(display.canvas.width / SIZE_TILES, display.canvas.height / SIZE_TILES);

		this.createCurrentFigure();

		this.character = new Character(this.grid, this.scores);

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
			this.character.timeBreath += Date.now() - this.pauseTime;
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
		this.character.deleteRow = 1;
		this.character.isBreath(this.grid);
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
				|| (!this.character.isBreath(this.grid) && this.isCrushedBeetle())
				|| this.status === 'new game') {
				this.ifRecord();
				return false;
			}

			if (this.character.update(this.grid) === 'eat') {
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
		const tile = new Point(Math.floor(this.character.position.x), Math.floor(this.character.position.y));
		if ((this.grid.space[tile.y][tile.x].element !== 0 && this.character.eat === 0)
			|| TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.character.timeBreath) / mSecOfSec) <= 0) {
			return true;
		}

		return false;
	}

	isCrushedBeetle() {
		const tile = new Point(Math.round(this.character.position.x), Math.round(this.character.position.y));
		for (const elem of this.currentFigure.getPositionTile()) {
			if ((elem.x === tile.x && elem.y === tile.y)
				|| (this.grid.space[tile.y][tile.x].element !== 0
					&& this.character.eat === 0)) {
				return true;
			}
		}
		return false;
	}
}
import Figure from './Figure/Figure.js';
import CurrentFigure from './Figure/CurrentFigure.js';
import Grid from './grid.js';
import {
	TIMES_BREATH_LOSE,
	NUMBER_FRAMES_ELEMENTS,
} from './const.js';
import CharacterBreath from './Character/CharacterBreath.js';

export default class State {
	constructor(width, height) {
		this.grid = new Grid(width, height);
		this.character = new CharacterBreath(this.grid);

		this.scores = 0;
		this.record = localStorage.getItem('Record') || 0;
		this.status = 'playing';

		this.pauseTime = null;

		this.createCurrentFigure();
	}

	createCurrentFigure() {
		this.nextFigure = this.nextFigure || new Figure();
		this.currentFigure = new CurrentFigure(this.grid, this.nextFigure);
		this.nextFigure = new Figure();
	}

	update(deltaTime, controller) {
		if (this.actionsControl(controller) === false
			|| (!this.character.isBreath(this.grid) && (this.checkLose() || this.isCrushedBeetle()))
			|| this.status === 'new game') {
			this.ifRecord();
			return false;
		}

		const statusCharacter = this.character.update(this.grid);
		if (statusCharacter === 'eat') {
			const tile = this.character.posTile;
			this.grid.space[tile.y][tile.x].setZero();
			this.scores += 50;
		} else if (statusCharacter === 'eatDestroy') {
			this.changeGridDestroyElement();
		}

		return true;
	}

	actionsControl(controller) {
		const status = this.currentFigure.moves(controller.pressed);
		if (status === 'endGame'
			// Фигура достигла препятствия
			|| (status === 'fall' && this.isCrushedBeetle()))
			// Стакан заполнен игра окончена
			return false;

		if (status === 'fixation') {
			this.fixation();
			this.createCurrentFigure();
		}

		return true;
	}

	isCrushedBeetle() {
		const tile = this.character.posTile;
		for (const elem of this.currentFigure.getPositionTile())
			if ((elem.x === tile.x && elem.y === tile.y)
				|| (this.grid.isNotFree(tile) && this.character.eat === 0))
				return true;

		return false;
	}

	fixation() {
		this.currentFigure.getPositionTile()
			.forEach(({ x, y }, index) => {
				this.grid.space[y][x].block = this.currentFigure.cells[index].view;
			});

		const countRowFull = this.grid.getCountRowFull();
		if (countRowFull)
			this.grid.deleteRows();

		const scoresForRow = 100;
		for (let i = 1; i <= countRowFull; i++)
			this.scores += i * scoresForRow;

		this.currentFigure.fixation(this.scores);
		this.ifRecord();

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

	changeGridDestroyElement() {
		const offset = { ...this.character.move };
		if (offset.x === -1) offset.x = 0;

		const tile = {
			x: Math.floor(this.character.position.x) + offset.x,
			y: Math.round(this.character.position.y) + offset.y,
		};
		this.grid.space[tile.y][tile.x].status[this.character.getDirectionEat()] = this.getStatusDestroyElement() + 1;
	}

	getStatusDestroyElement() {
		if (this.character.angle === 0)
			return Math.floor((this.character.position.x % 1) * NUMBER_FRAMES_ELEMENTS);
		if (this.character.angle === 180)
			return 3 - Math.floor((this.character.position.x % 1) * NUMBER_FRAMES_ELEMENTS);

		return 0;
	}

	checkLose() {
		if ((this.grid.isNotFree(this.character.posTile) && this.character.eat === 0)
			|| TIMES_BREATH_LOSE - Math.ceil((Date.now() - this.character.timeBreath) / 1000) <= 0)
			return true;

		return false;
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
}

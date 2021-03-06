import {
	NUMBER_IMAGES_FIGURE,
	TIMES_BREATH_LOSE,
} from './const.js';

const DIRECTORY_IMG = 'Resurs/v1/';
const SIZE_TILES = 30;

// Объект рисования
export default class Display {
	constructor() {
		this.canvas = document.querySelector('#canvasId');
		this.ctx = this.canvas.getContext('2d');
		this.canvasNextFigure = document.querySelector('#canvasNextFigureId');
		this.ctxNextFigure = this.canvasNextFigure.getContext('2d');

		this.txtScores = document.querySelector('#scores');
		this.txtRecord = document.querySelector('#record');
		this.elementTimeBreath = document.querySelector('#Breath');
		this.elementDivBreath = document.querySelector('#infoID');
	}

	get width() {
		return this.canvas.width / SIZE_TILES;
	}

	get height() {
		return this.canvas.height / SIZE_TILES;
	}

	load() {
		// Переменные для отслеживания загрузки изображений
		const numberImg = NUMBER_IMAGES_FIGURE + 1;
		let currentImg = 0;

		// Формируем картинки для фигур
		this.imgKv = Array.from({ length: NUMBER_IMAGES_FIGURE });
		for (let i = 0; i < this.imgKv.length; i++)
			this.imgKv[i] = new Image();

		this.imgFon = new Image();
		this.imgBeetle = new Image();

		return new Promise((resolve) => {
			const loadImage = () => { currentImg < numberImg ? currentImg += 1 : resolve(); };

			for (let i = 0; i < this.imgKv.length; i++) {
				this.imgKv[i].src = `${DIRECTORY_IMG}Kvadrat${i + 1}.png`;
				this.imgKv[i].onload = loadImage;
			}

			this.imgFon.src = `${DIRECTORY_IMG}Fon.png`;
			this.imgFon.onload = loadImage;

			this.imgBeetle.src = `${DIRECTORY_IMG}Beetle.png`;
			this.imgBeetle.onload = loadImage;
		});
	}

	drawNextFigure(nextFigure) {
		this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
		for (const cell of nextFigure.cells)
			this.ctxNextFigure.drawImage(
				this.imgKv[cell.view - 1],
				0, 0,
				SIZE_TILES, SIZE_TILES,
				cell.x * SIZE_TILES, cell.y * SIZE_TILES,
				SIZE_TILES, SIZE_TILES,
			);
	}

	render({ grid, currentFigure, character, scores, record, status, nextFigure }) {
		this.drawGridElements(grid);
		this.drawCurrentFigure(currentFigure);
		this.drawCharacter(character);
		this.drawNextFigure(nextFigure);

		this.txtScores.textContent = String(scores).padStart(6, '0');
		this.txtRecord.textContent = String(record).padStart(6, '0');

		if (status === 'pause')
			document.getElementById('pause').textContent = 'Продолжить';
		else
			document.getElementById('pause').textContent = 'Пауза';

		if (status !== 'pause') {
			let sec;
			if (!character.breath)
				sec = Math.max(TIMES_BREATH_LOSE - Math.ceil((Date.now() - character.timeBreath) / 1000), 0);
			else
				sec = TIMES_BREATH_LOSE;
			if (!character.breath) {
				if (!this.elementTimeBreath) {
					const element = document.createElement('h1');
					element.id = 'Breath';
					document.querySelector('#infoID').append(element);
					this.elementTimeBreath = document.querySelector('#Breath');
				}
				this.elementTimeBreath.innerHTML = `Задыхаемся<br/>Осталось секунд: ${sec}`;
			} else if (this.elementTimeBreath) {
				this.elementTimeBreath.parentNode.removeChild(this.elementTimeBreath);
				this.elementTimeBreath = null;
			}

			const int = (Math.floor(sec) * 255) / TIMES_BREATH_LOSE;
			document.querySelector('#infoID').style.backgroundColor = `rgb(255, ${int}, ${int})`;
		}
	}

	drawGridElements(grid) {
		let offsetX;
		let offsetY;
		for (let y = 0; y < grid.height; y++)
			for (let x = 0; x < grid.width; x++) {
				const screenX = x * SIZE_TILES;
				const screenY = y * SIZE_TILES;
				const NUMBER_COLUMNS_IMAGES_FON = 4;
				const NUMBER_ROWS_IMAGES_FON = 4;
				offsetX = Math.floor(grid.space[y][x].background / NUMBER_COLUMNS_IMAGES_FON) * SIZE_TILES;
				offsetY = (grid.space[y][x].background % NUMBER_ROWS_IMAGES_FON) * SIZE_TILES;

				this.ctx.drawImage(
					this.imgFon,
					offsetX, offsetY,
					SIZE_TILES, SIZE_TILES,
					screenX, screenY,
					SIZE_TILES, SIZE_TILES,
				);
			}

		for (let y = 0; y < grid.height; y++)
			for (let x = 0; x < grid.width; x++)
				if (grid.space[y][x].block !== 0) {
					const screenX = x * SIZE_TILES;
					const screenY = y * SIZE_TILES;
					({ x: offsetX, y: offsetY } = getOffset(grid.space[y][x]));
					this.ctx.drawImage(
						this.imgKv[grid.space[y][x].block - 1],
						offsetX, offsetY,
						SIZE_TILES, SIZE_TILES,
						screenX, screenY,
						SIZE_TILES, SIZE_TILES,
					);
				}
	}

	drawCurrentFigure(currentFigure) {
		for (const cell of currentFigure.cells) {
			const screenX = (cell.x + currentFigure.position.x) * SIZE_TILES;
			const screenY = (cell.y + currentFigure.position.y) * SIZE_TILES;
			this.ctx.drawImage(
				this.imgKv[cell.view - 1],
				0, 0,
				SIZE_TILES, SIZE_TILES,
				screenX, screenY,
				SIZE_TILES, SIZE_TILES,
			);
		}
	}

	drawCharacter(character) {
		let { x: offsetX, y: offsetY } = character.getSprite();
		offsetX *= SIZE_TILES;
		offsetY *= SIZE_TILES;
		const screenX = character.position.x * SIZE_TILES;
		const screenY = character.position.y * SIZE_TILES;
		this.ctx.drawImage(
			this.imgBeetle,
			offsetX, offsetY,
			SIZE_TILES, SIZE_TILES,
			screenX, screenY,
			SIZE_TILES, SIZE_TILES,
		);
	}
}

// Получить смещение по тайлам в зависимости от статуса элемента
function getOffset(element) {
	if (element.getSpaceStatus() === 'R')
		return { x: (element.status.R - 1) * SIZE_TILES, y: 1 * SIZE_TILES };

	if (element.getSpaceStatus() === 'L')
		return { x: (element.status.L - 1) * SIZE_TILES, y: 2 * SIZE_TILES };

	if (element.getSpaceStatus() === 'U')
		return { x: (element.status.U - 1) * SIZE_TILES, y: 3 * SIZE_TILES };

	return { x: 0, y: 0 };
}

import Figure from './Figure.js';
import {
	SIZE_TILES,
	DIRECTORY_IMG,
	TIMES_BREATH_LOSE,
	NUMBER_IMAGES_FIGURE,
} from './const.js';

// Объект рисования
export default class Display {
	canvas;
	ctx;
	canvasNextFigure;
	ctxNextFigure;
	txtScores;
	imgFon;
	imgKv;
	imgBeetle;
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

	load() {
		// Переменные для отслеживания загрузки изображений
		const numberImg = 1 + Figure.numberCell + 1;
		let currentImg = 0;

		// Формируем картинки для фигур
		this.imgKv = Array.from({ length: Figure.numberCell });
		for (let i = 0; i < this.imgKv.length; i++)
			this.imgKv[i] = new Image();

		this.imgFon = new Image();
		this.imgBeetle = new Image();

		return new Promise((resolve) => {
			const loadImage = () => { currentImg < numberImg - 1 ? currentImg += 1 : resolve(); };
			// загружаем картинки фигур
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
				0,
				0,
				SIZE_TILES,
				SIZE_TILES,
				cell.x * SIZE_TILES,
				cell.y * SIZE_TILES,
				SIZE_TILES,
				SIZE_TILES,
			);
	}

	render({
		grid, currentFigure, character, scores, record, status,
	}) {
		// Рисуем фон и целые и поврежденные элементы в стакане
		this.drawGridElements(grid);
		this.drawCurrentFigure(currentFigure);
		this.drawCharacter(character);

		// Обновляем Очки
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
			if (!(character.breath)) {
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

			// Закрашиваем элемент связанный с дыханием
			const int = (Math.floor(sec) * 255) / TIMES_BREATH_LOSE;
			document.querySelector('#infoID').style.backgroundColor = `rgb(255, ${int}, ${int})`;
		}
	}

	drawGridElements(grid) {
		let offsetX; let
			offsetY;
		for (let y = 0; y < grid.height; y++)
			for (let x = 0; x < grid.width; x++) {
				const screenX = x * SIZE_TILES;
				const screenY = y * SIZE_TILES;
				offsetX = Math.floor(grid.space[y][x].background / NUMBER_IMAGES_FIGURE) * SIZE_TILES;
				offsetY = (grid.space[y][x].background % NUMBER_IMAGES_FIGURE) * SIZE_TILES;

				this.ctx.drawImage(
					this.imgFon,
					offsetX,
					offsetY,
					SIZE_TILES,
					SIZE_TILES,
					screenX,
					screenY,
					SIZE_TILES,
					SIZE_TILES,
				);
			}

		for (let y = 0; y < grid.height; y++)
			for (let x = 0; x < grid.width; x++)
				if (grid.space[y][x].element !== 0) {
					const screenX = x * SIZE_TILES;
					const screenY = y * SIZE_TILES;
					[offsetX, offsetY] = getOffset(grid.space[y][x]);
					this.ctx.drawImage(
						this.imgKv[grid.space[y][x].element - 1],
						offsetX,
						offsetY,
						SIZE_TILES,
						SIZE_TILES,
						screenX,
						screenY,
						SIZE_TILES,
						SIZE_TILES,
					);
				}
	}

	drawCurrentFigure(currentFigure) {
		for (const cell of currentFigure.cells) {
			const screenX = (cell.x + currentFigure.position.x) * SIZE_TILES;
			const screenY = (cell.y + currentFigure.position.y) * SIZE_TILES;
			this.ctx.drawImage(
				this.imgKv[cell.view - 1],
				0,
				0,
				SIZE_TILES,
				SIZE_TILES,
				screenX,
				screenY,
				SIZE_TILES,
				SIZE_TILES,
			);
		}
	}

	drawCharacter(character) {
		let [offsetX, offsetY] = character.getSprite();
		offsetX *= SIZE_TILES;
		offsetY *= SIZE_TILES;
		const screenX = character.position.x * SIZE_TILES;
		const screenY = character.position.y * SIZE_TILES;
		this.ctx.drawImage(
			this.imgBeetle,
			offsetX,
			offsetY,
			SIZE_TILES,
			SIZE_TILES,
			screenX,
			screenY,
			SIZE_TILES,
			SIZE_TILES,
		);
	}
}

// Получить смещение по тайлам в зависимости от статуса элемента
function getOffset(element) {
	if (element.getSpaceStatus() === 'R')
		return [(element.status.R - 1) * SIZE_TILES, 1 * SIZE_TILES];

	if (element.getSpaceStatus() === 'L')
		return [(element.status.L - 1) * SIZE_TILES, 2 * SIZE_TILES];

	if (element.getSpaceStatus() === 'U')
		return [(element.status.U - 1) * SIZE_TILES, 3 * SIZE_TILES];

	return [0, 0];
}

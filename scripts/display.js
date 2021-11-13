import { Figure } from './class.js';
import {
	SIZE_TILES,
	DIRECTORY_IMG,
} from './const.js';
//Объект рисования
export class Display {
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
		this.ctx = this.canvas.getContext("2d");
		this.canvasNextFigure = document.querySelector('#canvasNextFigureId');
		this.ctxNextFigure = this.canvasNextFigure.getContext("2d");
		this.txtScores = document.querySelector('#scores');
	}

	load() {
		// Переменные для отслеживания загрузки изображений
		const numberImg = 1 + Figure.numberCell + 1;
		let currentImg = 0;

		//Формируем картинки для фигур
		this.imgKv = Array.from({ length: Figure.numberCell });
		for (let i = 0; i < this.imgKv.length; i++) {
			this.imgKv[i] = new Image();
		}

		this.imgFon = new Image();
		this.imgBeetle = new Image();

		return new Promise(resolve => {
			const loadImage = () => currentImg < numberImg - 1 ? currentImg++ : resolve();
			//загружаем картинки фигур
			for (let i = 0; i < this.imgKv.length; i++) {
				this.imgKv[i].src = DIRECTORY_IMG + 'Kvadrat' + (i + 1) + '.png';
				this.imgKv[i].onload = loadImage;
			}

			this.imgFon.src = DIRECTORY_IMG + 'Fon.png';
			this.imgFon.onload = loadImage;

			this.imgBeetle.src = DIRECTORY_IMG + 'Beetle.png';
			this.imgBeetle.onload = loadImage;
		})
	}

	drawNextFigure(nextFigure) {
		this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
		for (let cell of nextFigure.cells) {
			this.ctxNextFigure.drawImage(this.imgKv[cell.view - 1],
				0, 0, SIZE_TILES, SIZE_TILES,
				(cell.x * SIZE_TILES), (cell.y * SIZE_TILES), SIZE_TILES, SIZE_TILES);
		}
	}

	// Получить смещение по тайлам в зависимости от статуса элемента
	getOffset(element) {
		if (element.getSpaceStatus() === "R") return [(element.status.R - 1) * SIZE_TILES, 1 * SIZE_TILES];
		if (element.getSpaceStatus() === "L") return [(element.status.L - 1) * SIZE_TILES, 2 * SIZE_TILES];
		if (element.getSpaceStatus() === "U") return [(element.status.U - 1) * SIZE_TILES, 3 * SIZE_TILES]
		return [0, 0];
	}

	drawGridElements(grid) {
		let offsetX, offsetY;
		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++) {
				// Рисуем задний фон
				this.ctx.drawImage(this.imgFon,
					Math.floor(grid.space[i][j].background / 4) * SIZE_TILES, (grid.space[i][j].background % 4) * SIZE_TILES, SIZE_TILES,
					SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
				// Рисуем существующие элементы
				if (grid.space[i][j].element !== 0) {
					[offsetX, offsetY] = this.getOffset(grid.space[i][j]);
					this.ctx.drawImage(this.imgKv[grid.space[i][j].element - 1],
						offsetX, offsetY, SIZE_TILES, SIZE_TILES,
						j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
				}
			}
	}

	render({ grid, currentFigure, beetle, scores }) {
		let offsetX, offsetY;
		//Рисуем фон и целые и поврежденные элементы в стакане
		this.drawGridElements(grid)

		//Рисуем текущую падующую фигуру
		for (let cell of currentFigure.cells) {
			this.ctx.drawImage(this.imgKv[cell.view - 1],
				0, 0, SIZE_TILES, SIZE_TILES,
				(cell.x * SIZE_TILES) + currentFigure.position.x, (cell.y * SIZE_TILES) + currentFigure.position.y, SIZE_TILES, SIZE_TILES);
		}

		//Рисуем бегающего жука
		[offsetX, offsetY] = beetle.getSprite();
		this.ctx.drawImage(this.imgBeetle,
			offsetX * SIZE_TILES, offsetY * SIZE_TILES, SIZE_TILES, SIZE_TILES,
			beetle.position.x, beetle.position.y, SIZE_TILES, SIZE_TILES);


		//Обновляем Очки
		this.txtScores.innerHTML = String(scores).padStart(6, "0");

	}
}
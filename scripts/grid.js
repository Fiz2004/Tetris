import Element from './Element.js';
import {
	// Количество изображений для фона
	NUMBER_IMAGES_BACKGROUND,
} from './const.js';

export default class Grid {
	// Массив ячеек из элементов
	space;

	// Количество ячеек по ширине
	width;

	// Количество ячеек по высоте
	height;

	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.space = Array.from({ length: this.height })
			.map(() => Array.from({ length: this.width })
				.map(() => new Element(Math.floor(Math.random() * NUMBER_IMAGES_BACKGROUND))));
	}

	// Проверяем ячейка с x и y внутри сетки
	isInside({ x, y }) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	isOutside({ x, y }) {
		return x < 0 || x >= this.width || y < 0 || y >= this.height;
	}

	isCanMove(point) {
		return this.isOutside(point) || this.isNotFree(point);
	}

	isFree({ x, y }) {
		return this.space[y][x].element === 0;
	}

	isNotFree({ x, y }) {
		return this.space[y][x].element !== 0;
	}

	getCountRowFull() {
		let result = 0;
		this.space.forEach((row) => {
			if (row.every((x) => x.element !== 0)) result += 1;
		});
		return result;
	}

	deleteRows() {
		this.space.forEach((row, rowIndex) => {
			if (row.every((x) => x.element !== 0)) {
				this.deleteRow(rowIndex);
				this.space[0].forEach((x) => x.setZero());
			}
		});
	}

	deleteRow(rowIndex) {
		for (let i = rowIndex; i > 0; i--)
			for (let j = 0; j < this.width; j++)
				this.space[i][j].setElement(this.space[i - 1][j]);
	}
}

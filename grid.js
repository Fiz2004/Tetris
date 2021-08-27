import { Element } from './class.js';
import {
	// Количество изображений для фона
	NUMBER_IMAGES_BACKGROUND
} from './const.js';

export class Grid {
	// Массив ячеек из элементов
	space;
	// Количество ячеек по ширине
	width;
	// Количество ячеек по высоте
	height;
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.space = Array.from({ length: this.height }).map(() =>
			Array.from({ length: this.width }).map(() =>
				new Element(Math.floor(Math.random() * NUMBER_IMAGES_BACKGROUND))));
	};
	// Проверяем ячейка с x и y внутри сетки
	isInside({ x, y }) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	};
	// Проверяем свободна ли ячейка
	isFree({ x, y }) {
		return this.space[y][x].element === 0;
	};
}
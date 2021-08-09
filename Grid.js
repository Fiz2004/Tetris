import { Element, Point, Figure, CurrentFigure } from './class.js';
import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME,
	NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE,
	NAPRDVIG
} from './const.js';

export class Grid{
	space;
	width;
	height;
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.space = Array.from({ length: this.height }).map(() =>
			Array.from({ length: this.width }).map(() =>
				new Element(Math.floor(Math.random() * NUMBER_BACKGROUND_ELEMENTS),0)));
	};
		isInside(point){
			return point.x >= 0 && point.x < this.width && point.y >= 0 && point.x <= height;
	};
	get(point) {
		return this.space[point.x][point.y];
	}
	set(point, value) {
		this.space[point.x][point.y] = value;
	}
}
import Point from './Point.js';

export default class Cell extends Point {
	view;

	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	}
}

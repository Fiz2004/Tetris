import Point from './Point.js';

export default class Cell extends Point {
	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	}
}

export default class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	plus({ x, y }) {
		return new Point(this.x + x, this.y + y);
	}
}

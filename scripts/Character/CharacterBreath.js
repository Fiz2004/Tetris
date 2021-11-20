import CharacterEat from './CharacterEat.js';

export default class CharacterBreath extends CharacterEat {
	constructor(grid) {
		super(grid);

		this.timeBreath = Date.now();
		this.breath = true;
	}

	update(grid) {
		return super.update(grid);
	}

	isBreath(grid) {
		this.breath = this.findWay(this.posTile, [], grid);

		if (this.breath) this.timeBreath = Date.now();

		return this.breath;
	}

	findWay(tile, cash, grid) {
		if (tile.y === 0)
			return true;

		cash.push({ x: tile.x, y: tile.y });

		for (const element of [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }])
			if (grid.isInside(tile.plus(element)) && grid.isFree(tile.plus(element))
				&& !cash.find(({ x, y }) => tile.x + element.x === x && tile.y + element.y === y)
				&& this.findWay(tile.plus(element), cash, grid))
				return true;

		return false;
	}
}

import Grid from "../scripts/grid.js"
import { strict as assert } from 'assert';

describe("Проверяем функцию isInside", function () {
	let grid;
	before(() => console.log("Тестирование началось – перед тестами"));
	after(() => console.log("Тестирование закончилось – после всех тестов"));

	beforeEach(() => {
		grid = new Grid(5, 5)
	});

	it("Значение 0,0", function () {
		assert.equal(grid.isInside({ x: 0, y: 0 }), true);
	});

	it("Значение max(4),max(4)", function () {
		assert.equal(grid.isInside({ x: 4, y: 4 }), true);
	});

	it("Значение x<0,0", function () {
		assert.equal(grid.isInside({ x: - 1, y: 0 }), false);
	});

	it("Значение x>length,0", function () {
		assert.equal(grid.isInside({ x: 7, y: 0 }), false);
	});

	it("Значение 0,y<0", function () {
		assert.equal(grid.isInside({ x: 0, y: -1 }), false);
	});

	it("Значение 0,y>length", function () {
		assert.equal(grid.isInside({ x: 0, y: 7 }), false);
	});

	it("Значение x<0,y<0", function () {
		assert.equal(grid.isInside({ x: - 1, y: -1 }), false);
	});
	it("Значение x>length,y>length", function () {
		assert.equal(grid.isInside({ x: 7, y: 7 }), false);
	});

});

describe("Проверяем функцию getCountRowFull", function () {
	let grid;
	before(() => console.log("Тестирование началось – перед тестами"));
	after(() => console.log("Тестирование закончилось – после всех тестов"));

	beforeEach(() => {
		grid = new Grid(5, 5);
	});

	it("Значение 0", function () {
		assert.equal(grid.getCountRowFull(), 0);
	});

	it("Значение 1", function () {
		for (let space of grid.space[4])
			space.element = 1;
		assert.equal(grid.getCountRowFull(), 1);
	});

	it("Значение 2", function () {
		for (let space of grid.space[4])
			space.element = 1;
		for (let space of grid.space[3])
			space.element = 1;
		assert.equal(grid.getCountRowFull(), 2);
	});

	it("Значение 1 0 1", function () {
		for (let space of grid.space[4])
			space.element = 1;
		for (let space of grid.space[2])
			space.element = 1;
		assert.equal(grid.getCountRowFull(), 2);
	});

});
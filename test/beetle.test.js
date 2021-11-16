import { strict as assert } from 'assert';
import Beetle from '../scripts/class_beetle.js';
import Grid from '../scripts/grid.js';
import {
	NUMBER_FRAMES_BEEATLE,
} from '../scripts/const.js';

describe('Проверяем функцию beetleAnimation', () => {
	let grid;
	let beetle;
	before(() => console.log('Тестирование началось – перед тестами'));
	after(() => console.log('Тестирование закончилось – после всех тестов'));

	beforeEach(() => {
		grid = new Grid(5, 5);
		beetle = new Beetle(grid);
		beetle.position.x = 2;
		beetle.position.y = 4;
	});

	it('Проверяем проходит ли жук за определенное время на одну клетку влево', () => {
		for (let i = 0; i < NUMBER_FRAMES_BEEATLE; i++) { beetle.update(grid); }
		beetle.update(grid);
		for (let i = 0; i < NUMBER_FRAMES_BEEATLE; i++) { beetle.update(grid); }
		assert.equal(Math.round(beetle.position.x), 1);
	});
	// it("Значение max(4),max(4)", function () {
	// 	assert.equal(grid.isInside({ x: 4, y: 4 }), true);
	// });

	// it("Значение x<0,0", function () {
	// 	assert.equal(grid.isInside({ x: - 1, y: 0 }), false);
	// });

	// it("Значение x>length,0", function () {
	// 	assert.equal(grid.isInside({ x: 7, y: 0 }), false);
	// });

	// it("Значение 0,y<0", function () {
	// 	assert.equal(grid.isInside({ x: 0, y: -1 }), false);
	// });

	// it("Значение 0,y>length", function () {
	// 	assert.equal(grid.isInside({ x: 0, y: 7 }), false);
	// });

	// it("Значение x<0,y<0", function () {
	// 	assert.equal(grid.isInside({ x: - 1, y: -1 }), false);
	// });
	// it("Значение x>length,y>length", function () {
	// 	assert.equal(grid.isInside({ x: 7, y: 7 }), false);
	// });
});

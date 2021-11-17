import { strict as assert } from 'assert';
import { getEnvironmentData } from 'worker_threads';
import Character from '../scripts/Character.js';
import getDirection, { isCanRun, isCanMove } from '../scripts/FindWayRun.js';
import Grid from '../scripts/grid.js';

describe('isCanRun', () => {
	let character;
	let grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
		character = new Character(grid);
		character.position.y = 4;
	});

	it('Проверяем движение влево', () => {
		character.position.x = 3;
		assert.equal(isCanRun(character.position, [{ x: -1, y: 0 }], grid), true);
	});
	it('Проверяем движение влево у края', () => {
		character.position.x = 0;
		assert.equal(isCanRun(character.position, [{ x: -1, y: 0 }], grid), false);
	});
	it('Проверяем движение вправо у края', () => {
		character.position.x = grid.space[0].length - 1;
		assert.equal(isCanRun(character.position, [{ x: 1, y: 0 }], grid), false);
	});
	it('Проверяем движение влево у края 2-е движение', () => {
		character.position.x = 1;
		assert.equal(isCanRun(character.position, [{ x: -1, y: 0 }, { x: -1, y: 0 }], grid), false);
	});
});

describe('isCanMove', () => {
	let character;
	let grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
		character = new Character(grid);
		character.position.y = grid.space.length - 1;
	});

	it('Проверяем движение влево', () => {
		character.position.x = 3;
		assert.deepEqual(isCanMove(character, [[{ x: -1, y: 0 }]], grid), [{ x: -1, y: 0 }]);
	});
	it('Проверяем движение влево у края', () => {
		character.position.x = 0;
		assert.deepEqual(isCanMove(character, [[{ x: -1, y: 0 }]], grid), [{ x: 0, y: 0 }]);
	});
	it('Проверяем движение вправо у края', () => {
		character.position.x = grid.space[0].length - 1;
		assert.deepEqual(isCanMove(character, [[{ x: 1, y: 0 }]], grid), [{ x: 0, y: 0 }]);
	});
	it('Проверяем движение влево у края 2-е движение', () => {
		character.position.x = 1;
		assert.deepEqual(isCanMove(character, [[{ x: -1, y: 0 }, { x: -1, y: 0 }]], grid), [{ x: 0, y: 0 }]);
	});
	it('Проверяем движение влево у препятствия слева', () => {
		character.position.x = 1;
		grid.space[grid.space.length - 1][0].element = 1;
		assert.deepEqual(isCanMove(character, [[{ x: -1, y: 0 }, { x: -1, y: 0 }], [{ x: 0, y: -1 }, { x: -1, y: 0 }]], grid), [{ x: 0, y: -1 }, { x: -1, y: 0 }]);
	});
	it('Проверяем движение вправо у препятствия справа', () => {
		character.position.x = 1;
		grid.space[grid.space.length - 1][2].element = 1;
		assert.deepEqual(isCanMove(character, [[{ x: -1, y: 0 }, { x: -1, y: 0 }], [{ x: 0, y: -1 }, { x: 1, y: 0 }]], grid), [{ x: 0, y: -1 }, { x: 1, y: 0 }]);
	});
});
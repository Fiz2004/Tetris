import { strict as assert } from 'assert';
import Character from '../scripts/Character.js';
import getDirection, { isCanDirections, isCanMove } from '../scripts/FindWayRun.js';
import Grid from '../scripts/grid.js';

describe('isCanDirections', () => {
	let character;
	let grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
		character = new Character(grid);
		character.position.y = 4;
	});

	it('Проверяем движение влево', () => {
		character.position.x = 3;
		assert.equal(isCanDirections(character, [{ x: -1, y: 0 }], grid), true);
	});
	it('Проверяем движение влево у края', () => {
		character.position.x = 0;
		assert.equal(isCanDirections(character, [{ x: -1, y: 0 }], grid), false);
	});
	it('Проверяем движение вправо у края', () => {
		character.position.x = grid.space[0].length - 1;
		assert.equal(isCanDirections(character, [{ x: 1, y: 0 }], grid), false);
	});
	it('Проверяем движение влево у края 2-е движение', () => {
		character.position.x = 1;
		assert.equal(isCanDirections(character, [{ x: -1, y: 0 }, { x: -1, y: 0 }], grid), false);
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

describe('Character.getSpeedAngle', () => {
	let character;
	let grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
		character = new Character(grid);
		character.position.x = 3;
		character.position.y = grid.space.length - 1;
	});

	it('Проверяем снизу поворот влево', () => {
		character.angle = 90;
		character.move.x = -1;
		character.move.y = 0;
		assert.deepEqual(character.getSpeedAngle(), { rotate: 45, line: 0 });
	});
	it('Проверяем снизу поворот вправо', () => {
		character.angle = 90;
		character.move.x = 1;
		character.move.y = 0;
		assert.deepEqual(character.getSpeedAngle(), { rotate: -45, line: 0 });
	});
	it('Проверяем слева поворот направо', () => {
		character.angle = 180;
		character.move.x = 1;
		character.move.y = 0;
		assert.deepEqual(character.getSpeedAngle(), { rotate: 45, line: 0 });
	});
	it('Проверяем сверху поворот направо', () => {
		character.angle = 270;
		character.move.x = 1;
		character.move.y = 0;
		assert.deepEqual(character.getSpeedAngle(), { rotate: 45, line: 0 });
	});
});
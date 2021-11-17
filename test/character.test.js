import { strict as assert } from 'assert';
import Character from '../scripts/Character.js';
import Grid from '../scripts/grid.js';

describe('Проверка создания персонажа', () => {
	let character;
	let grid;

	beforeEach(() => {
		grid = new Grid(5, 5);
		character = new Character(grid);
		character.position.x = 3;
	});

	it('Проверяем движение влево', () => {
		character.changePosition();
		assert.equal(character.position.x, 2);
	});

});

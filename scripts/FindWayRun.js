import {
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_BEEATLE_ROTATE,
	NUMBER_FRAMES_ELEMENTS,
	PROBABILITY_EAT,
	NUMBER_FRAMES_BEEATLE_MOVE,
} from './const.js';

const CHARACTER_SPEED_LINE = 30;
const CHARACTER_SPEED_ROTATE = 45;

// Функция для определения направления движения жука
export default function getDirection(character, grid) {
	// Проверяем свободен ли выбранный путь при фиксации фигуры
	if (character.deleteRow === 1
		&& character.moves === isCanMove([character.moves], grid)) {
		character.deleteRow = 0;
	}

	if (character.moves.length === 0 || character.deleteRow === 1) {
		character.moves = getNewDirection(character, grid);
	}

	const startMove = { ...character.move };
	if (startMove.x === character.moves[0].x && startMove.y === character.moves[0].y) {
		character.move = character.moves.shift();
	} else {
		character.move = character.moves[0];
	}

	getSpeedAngle(character);
	character.direction = { ...startMove };
}

function getNewDirection(character, grid) {
	const DIRECTION = {};
	DIRECTION.L = { x: -1, y: 0 };
	DIRECTION.R = { x: 1, y: 0 };
	DIRECTION.D = { x: 0, y: 1 };
	DIRECTION.U = { x: 0, y: -1 };
	DIRECTION['0'] = { x: 0, y: 0 };
	DIRECTION['0D'] = [{ x: 0, y: 1 }];
	DIRECTION.RD = [DIRECTION.D, DIRECTION.R];
	DIRECTION.LD = [DIRECTION.D, DIRECTION.L];
	DIRECTION.R0 = [DIRECTION.R];
	DIRECTION.L0 = [DIRECTION.L];
	DIRECTION.RU = [DIRECTION.U, DIRECTION.R];
	DIRECTION.LU = [DIRECTION.U, DIRECTION.L];
	DIRECTION.RUU = [DIRECTION.U, DIRECTION.U, DIRECTION.R];
	DIRECTION.LUU = [DIRECTION.U, DIRECTION.U, DIRECTION.L];
	DIRECTION.LEFTDOWN = [DIRECTION['0D'], DIRECTION.LD, DIRECTION.RD];
	DIRECTION.RIGHTDOWN = [DIRECTION['0D'], DIRECTION.RD, DIRECTION.LD];
	DIRECTION.LEFT = [DIRECTION.L0, DIRECTION.LU, DIRECTION.LUU];
	DIRECTION.RIGHT = [DIRECTION.R0, DIRECTION.RU, DIRECTION.RUU];

	character.deleteRow = 0;
	character.direction = {};
	[character.direction.x, character.direction.y] = [Math.round(Math.cos(character.angle * Math.PI / 180)), Math.round(Math.sin(character.angle * Math.PI / 180))]
	const code = `${[character.direction.x, character.direction.y, character.move.x, character.move.y].join('')}`;
	// Если двигаемся вправо
	if (code === '0010' || code === '1010') {
		character.lastDirection = 'R';
		return isCanMove(character, [...DIRECTION.RIGHTDOWN, ...DIRECTION.RIGHT, ...DIRECTION.LEFT], grid);
	}
	// Если двигаемся влево
	if (code === '00-10' || code === '-10-10') {
		character.lastDirection = 'L';
		return isCanMove(character, [...DIRECTION.LEFTDOWN, ...DIRECTION.LEFT, ...DIRECTION.RIGHT], grid);
	}

	if (character.direction.x === -1) {
		return isCanMove(character, [...[DIRECTION['0D']], ...DIRECTION.LEFT, ...DIRECTION.RIGHT], grid);
	}
	return isCanMove(character, [...[DIRECTION['0D']], ...DIRECTION.RIGHT, ...DIRECTION.LEFT], grid);
}

function isCanMove(character, arrayDirectionses, grid) {
	for (const directions of arrayDirectionses) {
		if (isCanDirections(character, directions, grid)) {
			return directions;
		}
	}

	return [{ x: 0, y: 0 }];
};

function isCanDirections(character, directions, grid) {
	let TekX = 0;
	let TekY = 0;
	for (const direction of directions) {
		TekX += direction.x;
		TekY += direction.y;
		const point = {
			x: Math.round(character.position.x) + TekX,
			y: Math.round(character.position.y) + TekY,
		};

		if (grid.isOutside(point)) {
			return false;
		}

		if (grid.isNotFree(point)) {
			if (TekY === 0 && (Math.random() * 100 < PROBABILITY_EAT)) {
				character.eat = 1;
				directions.length = directions.indexOf(direction) + 1;
				return true;
			}
			return false;
		}
	}
	return true;
};

function getSpeedAngle(character) {
	if (Math.round(Math.cos(character.angle * Math.PI / 180)) === character.move.x
		&& Math.round(Math.sin(character.angle * Math.PI / 180)) === character.move.y) {
		character.speed.rotate = 0;
		character.speed.line = 1 / 10;
		return;
	}

	character.speed.line = 0;
	character.speed.rotate = CHARACTER_SPEED_ROTATE;
}

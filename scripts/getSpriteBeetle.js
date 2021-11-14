import {
	NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_BEEATLE_MOVE,
} from './const.js';

// Получить Спрайт если жук ест
export function EatingNow(directionMovement, framesAnimation) {
	// Поворот Лево->Лево
	if (directionMovement === '-10-10')
		return framesAnimation === 0
			? [6, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 6];

	// Поворот Вниз->Вниз
	if (directionMovement === '0101')
		return framesAnimation === 0
			? [0, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 8];

	// Поворот Вверх->Вверх
	if (directionMovement === '0-10-1')
		return framesAnimation === 0
			? [4, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 7];

	// Поворот Направо->Направо
	if (directionMovement === '1010')
		return framesAnimation === 0
			? [2, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 5];

}

function NoEatingNowIfDirectLeft(directionMovement, framesAnimation) {
	if (directionMovement === '-10-10')
		return framesAnimation === 0
			? [6, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 2];

	// Поворот Лево->0
	if (directionMovement === '-1000')
		return framesAnimation === 0 ? [6, 0] : [7, 0];

	// Поворот Лево->Направо
	if (directionMovement === '-1010')
		return [[6, 0], [7, 0], [0, 0], [1, 0], [2, 0]][framesAnimation];

	// Поворот Лево->Наверх
	if (directionMovement === '-100-1')
		return framesAnimation === 0 ? [6, 0] : [5, 0];

	// Поворот Лево->Вниз
	if (directionMovement === '-1001')
		return framesAnimation === 0 ? [6, 0] : [7, 0];
}

function NoEatingNowIfDirectUp(directionMovement, framesAnimation) {
	// Поворот Наверх->Налево
	if (directionMovement === '0-1-10')
		return framesAnimation === 0 ? [4, 0] : [5, 0];

	// Поворот Наверх->0
	if (directionMovement === '0-100')
		return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][framesAnimation];

	// Поворот Наверх->Направо
	if (directionMovement === '0-110')
		return framesAnimation === 0 ? [4, 0] : [3, 0];

	// Поворот Наверх->Наверх
	if (directionMovement === '0-10-1')
		return framesAnimation === 0
			? [4, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 3];

	// Поворот Наверх->Вниз
	if (directionMovement === '0-101')
		return [[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]][framesAnimation];
}

function NoEatingNowIfDirect0(directionMovement, framesAnimation) {
	// Поворот 0->Налево
	if (directionMovement === '00-10')
		return framesAnimation === 0 ? [0, 0] : [7, 0];

	// Поворот 0->Налево
	if (directionMovement === '0000')
		return [0, 0];

	// Поворот 0->Направо
	if (directionMovement === '0010')
		return framesAnimation === 0 ? [0, 0] : [1, 0];

	// Поворот 0->Наверх
	if (directionMovement === '000-1')
		return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][framesAnimation];

	// Поворот 0->Вниз
	if (directionMovement === '0001')
		return [0, 0];
}

function NoEatingNowIfDirectDown(directionMovement, framesAnimation) {
	// Поворот Вниз->Наверх
	if (directionMovement === '010-1')
		return [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]][framesAnimation];

	// Поворот Вниз->0
	if (directionMovement === '0100')
		return [0, 0];

	// Поворот Вниз->Вниз
	if (directionMovement === '0101')
		return framesAnimation === 0
			? [0, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 4];

	// Поворот Вниз->Налево
	if (directionMovement === '01-10')
		return framesAnimation === 0 ? [0, 0] : [7, 0];

	// Поворот Вниз->Направо
	if (directionMovement === '0110')
		return framesAnimation === 0 ? [0, 0] : [1, 0];
}

function NoEatingNowIfDirectRight(directionMovement, framesAnimation) {
	// Поворот Направо->Наверх
	if (directionMovement === '100-1')
		return framesAnimation === 0 ? [3, 0] : [4, 0];

	// Поворот Направо->0
	if (directionMovement === '1000')
		return framesAnimation === 0 ? [1, 0] : [0, 0];

	// Поворот Направо->Вниз
	if (directionMovement === '1001')
		return framesAnimation === 0 ? [1, 0] : [0, 0];

	// Поворот Направо->Налево
	if (directionMovement === '10-10')
		return [[2, 0], [1, 0], [0, 0], [7, 0], [6, 0]][framesAnimation];

	// Поворот Направо->Направо
	if (directionMovement === '1010')
		return framesAnimation === 0
			? [2, 0]
			: [Math.floor(framesAnimation / (NUMBER_FRAMES_BEEATLE / NUMBER_FRAMES_BEEATLE_MOVE)), 1];

}

export function NoEatingNow(directionMovement, framesAnimation) {
	if (directionMovement[0] === '-')
		return NoEatingNowIfDirectLeft(directionMovement, framesAnimation);

	if (directionMovement[1] === '-')
		return NoEatingNowIfDirectUp(directionMovement, framesAnimation);

	if (directionMovement[0] === '0' && directionMovement[1] === '0')
		return NoEatingNowIfDirect0(directionMovement, framesAnimation);

	if (directionMovement[0] === '0' && directionMovement[1] === '1')
		return NoEatingNowIfDirectDown(directionMovement, framesAnimation);

	if (directionMovement[0] === '1' && directionMovement[1] === '0')
		return NoEatingNowIfDirectRight(directionMovement, framesAnimation);

}


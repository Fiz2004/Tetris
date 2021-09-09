/* eslint-disable linebreak-style */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
/* eslint-disable no-tabs */
/* eslint-disable linebreak-style */
// Размер в пикселях элемента
export const SIZE_TILES = 30;
// Количество изображений для фона
export const NUMBER_IMAGES_BACKGROUND = 16;
// Количество изображений для фигуры
export const NUMBER_IMAGES_FIGURE = 4;
// Время в милисекундах одного движения
export const UPDATE_TIME = 1000;
// Шаг движения блоков по умолчанию
export const STEP_MOVE_AUTO = 50;
// Шаг движения блоков по горизонтали
export const STEP_MOVE_KEY_X = SIZE_TILES;
// Шаг движения блоков по вертикали
export const STEP_MOVE_KEY_Y = 300;

export const TIME_ROTATE = 0.1;
// Число кадров движения
export const NUMBER_FRAMES_BEEATLE = 10;
// Число кадров движения налево и направо
export const NUMBER_FRAMES_BEEATLE_MOVE = 5;
// Число кадров движения при повороте
export const NUMBER_FRAMES_BEEATLE_ROTATE = 1;
export const NUMBER_FRAMES_BEEATLE_ROTATE_0 = 5;
// Количество Кадров при повреждении фигуры
export const NUMBER_FRAMES_ELEMENTS = 4;
// Время без дыхания для прогирыша
export const TIMES_BREATH_LOSE = 60;
// Вероятность того что жук будет есть блок
export const PROBABILITY_EAT = 20;
// Директория где храняться картинки
export const DIRECTORY_IMG = 'Resurs/v3/';
// Обозначение фигур, задаются координаты каждой ячейки
export const FIGURE = [
	[[0, 1], [1, 1], [2, 1], [3, 1]],
	[[1, 1], [2, 1], [2, 2], [3, 2]],
	[[1, 1], [2, 1], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [1, 3]],
	[[1, 1], [1, 2], [2, 1], [2, 2]],
	[[1, 1], [2, 1], [1, 2], [1, 3]],
];

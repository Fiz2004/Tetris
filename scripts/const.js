// Размер в пикселях элемента
export const SIZE_TILES = 30;
// Количество изображений для фона
export const NUMBER_IMAGES_BACKGROUND = 16;
// Количество изображений для фигуры
export const NUMBER_IMAGES_FIGURE = 4;
// Время в милисекундах одного движения
export const UPDATE_TIME = 100;
// Шаг движения блоков по умолчанию
export const STEP_MOVE_AUTO = 5;
// Шаг движения блоков по горизонтали
export const STEP_MOVE_KEY_X = 30;
// Шаг движения блоков по вертикали
export const STEP_MOVE_KEY_Y = 90;
// Число кадров движения
export const NUMBER_FRAMES_BEEATLE = 10;
// Число кадров движения налево и направо
export const NUMBER_FRAMES_BEEATLE_MOVE = 5;
// Число кадров движения при повороте
export const NUMBER_FRAMES_BEEATLE_ROTATE = 1;
// Количество Кадров при повреждении фигуры
export const NUMBER_FRAMES_ELEMENTS = 4;
// Время без дыхания для прогирыша
export const TIMES_BREATH_LOSE = 60;
// Вероятность того что жук будет есть блок
export const PROBABILITY_EAT = 20;
// Директория где храняться картинки
export const DIRECTORY_IMG = "Resurs/v3/";
// Обозначение фигур, задаются координаты каждой ячейки
export const FIGURE = [
	[[0, 1], [1, 1], [2, 1], [3, 1]],
	[[1, 1], [2, 1], [2, 2], [3, 2]],
	[[1, 1], [2, 1], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [2, 3]],
	[[1, 1], [1, 2], [2, 2], [1, 3]],
	[[1, 1], [1, 2], [2, 1], [2, 2]],
	[[1, 1], [2, 1], [1, 2], [1, 3]]
];

export const NAPRDVIG = {
	//?FIXME Починить движение запрыгивания когда исчезает ряд
	["L0"]: [
		{ x: "L", y: "D" },
		{ x: "L", y: "0" },
		{ x: "L", y: "U" },
		{ x: "L", y: "UU" },
		{ x: "R", y: "0" },
		{ x: "R", y: "U" },
		{ x: "R", y: "UU" }
	],
	["R0"]: [
		{ x: "R", y: "D" },
		{ x: "R", y: "0" },
		{ x: "R", y: "U" },
		{ x: "R", y: "UU" },
		{ x: "L", y: "0" },
		{ x: "L", y: "U" },
		{ x: "L", y: "UU" }
	],
	["LD"]: [
		{ x: "L", y: "D" },
		{ x: "L", y: "0" },
		{ x: "R", y: "0" },
		{ x: "L", y: "U" },
		{ x: "L", y: "UU" },
		{ x: "R", y: "U" },
		{ x: "R", y: "UU" }
	],
	["RD"]: [
		{ x: "R", y: "D" },
		{ x: "R", y: "0" },
		{ x: "L", y: "0" },
		{ x: "R", y: "U" },
		{ x: "R", y: "UU" },
		{ x: "L", y: "U" },
		{ x: "L", y: "UU" }
	],

	["LU"]: [
		{ x: "L", y: "0" },
		{ x: "R", y: "0" },
		{ x: "L", y: "U" },
		{ x: "R", y: "U" },
		{ x: "L", y: "D" }
	],
	["RU"]: [
		{ x: "R", y: "0" },
		{ x: "L", y: "0" },
		{ x: "R", y: "U" },
		{ x: "L", y: "U" },
		{ x: "R", y: "D" }
	],

	["LUU"]: [
		{ x: "L", y: "U" },
		{ x: "R", y: "U" },
		{ x: "L", y: "0" },
		{ x: "R", y: "0" },
		{ x: "L", y: "D" }
	],
	["RUU"]: [
		{ x: "R", y: "U" },
		{ x: "L", y: "U" },
		{ x: "R", y: "0" },
		{ x: "L", y: "0" },
		{ x: "R", y: "D" }
	],

	["00"]: [
		{ x: "L", y: "D" },
		{ x: "L", y: "0" },
		{ x: "L", y: "U" },
		{ x: "L", y: "UU" },
		{ x: "R", y: "0" },
		{ x: "R", y: "U" },
		{ x: "R", y: "UU" }
	],
};

// Класс для обозначения элементов на поле
export class Element {
	// Номер картинки для фона элемента от 0 до NUMBER_IMAGES_BACKGROUND
	background;
	//Показывает вид элемента от 0 до NUMBER_IMAGES_FIGURE
	element;
	//Показывает повреждения хранит свойства L,R,U со значениями от 0 до NUMBER_FRAMES_ELEMENTS
	status;
	constructor(background, valueElement = 0) {
		this.background = background;
		this.element = valueElement;
		//Показывает значение сьеденного элемента и направление
		this.status = {
			L: 0,
			R: 0,
			U: 0,
		};
	}
	// Получить статус элемента, поврежден ли он или целый
	getSpaceStatus() {
		if (this.status.L !== 0) {
			return 'L';
		}
		if (this.status.R !== 0) {
			return 'R';
		}
		if (this.status.U !== 0) {
			return 'U';
		}
		return '0';
	}
	//Установить в 0 все значения элемента
	setZero() {
		this.element = 0;
		this.status = { L: 0, R: 0, U: 0 };
	}

	setElement(element) {
		this.element = element.element;
		this.status = { L: element.status.L, R: element.status.R, U: element.status.U };
	}
}

// Класс для обзначения координат x и y
export class Point {
	x;
	y;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

// Класс для обзначения ячейки с координатами x и y, и сохранением номера фона
export class Cell extends Point {
	view;
	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	}
}

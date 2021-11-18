export default class Element {
	// Номер картинки для фона элемента от 0 до NUMBER_IMAGES_BACKGROUND
	background;

	// Показывает вид элемента от 0 до NUMBER_IMAGES_FIGURE
	element;

	// Показывает повреждения хранит свойства L,R,U со значениями от 0 до NUMBER_FRAMES_ELEMENTS
	status;

	constructor(background, valueElement = 0) {
		this.background = background;
		this.element = valueElement;
		// Показывает значение сьеденного элемента и направление
		this.status = {
			L: 0,
			R: 0,
			U: 0,
		};
	}

	// Получить статус элемента, поврежден ли он или целый
	getSpaceStatus() {
		if (this.status.L !== 0) return 'L';
		if (this.status.R !== 0) return 'R';
		if (this.status.U !== 0) return 'U';

		return '0';
	}

	// Установить в 0 все значения элемента
	setZero() {
		this.element = 0;
		this.status = { L: 0, R: 0, U: 0 };
	}

	setElement(element) {
		this.element = element.element;
		this.status = { L: element.status.L, R: element.status.R, U: element.status.U };
	}
}

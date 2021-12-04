export default class Element {
	constructor(background, valueElement = 0) {
		this.background = background;
		this.block = valueElement;
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

	setZero() {
		this.block = 0;
		this.status = { L: 0, R: 0, U: 0 };
	}

	setElement(element) {
		this.block = element.block;
		this.status = { L: element.status.L, R: element.status.R, U: element.status.U };
	}
}

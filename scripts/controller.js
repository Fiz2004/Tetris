export default class Controller {
	pressed;

	codes;

	// Точка начала касания
	touchStart;

	// Текущая позиция
	touchPosition;

	constructor(codes) {
		// Задаем начальное значение падения
		this.pressed = Object.create(null);
		this.codes = codes;
		// Точка начала касания
		this.touchStart = null;
		// Текущая позиция
		this.touchPosition = null;

		window.addEventListener('keydown', this.handler);
		window.addEventListener('keyup', this.handler);
		window.addEventListener('touchstart', this.touchStarts);
		window.addEventListener('touchmove', this.touchMove);
		window.addEventListener('touchend', this.touchEnd);
		window.addEventListener('touchcancel', this.touchEnd);
	}

	refresh() {
		for (const key in this.pressed)
			if (Object.prototype.hasOwnProperty.call(this.pressed, key))
				this.pressed[key] = null;
	}

	handler = (event) => {
		if (Object.prototype.hasOwnProperty.call(this.codes, event.keyCode)) {
			this.pressed[this.codes[event.keyCode]] = (event.type === 'keydown');
			event.preventDefault();
		}
	};

	touchStarts = (event) => {
		if (event.cancelable && event.target !== 'button')
			event.preventDefault();

		this.touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		this.touchPosition = { x: this.touchStart.x, y: this.touchStart.y };

		const partHorizontal = 0.295;
		const partVertical = 0.5;

		const cW = document.documentElement.clientWidth;
		const cH = document.documentElement.clientHeight;
		if ((this.touchStart.x > cW * partHorizontal)
			&& this.touchStart.x < cW - (cW * partHorizontal))
			if (this.touchStart.y < cH * partVertical) {
				this.pressed.left = false;
				this.pressed.up = true;
				this.pressed.right = false;
				this.pressed.down = false;
			} else {
				this.pressed.left = false;
				this.pressed.up = false;
				this.pressed.right = false;
				this.pressed.down = true;
			}

		if (this.touchStart.x <= cW * partHorizontal) {
			this.pressed.left = true;
			this.pressed.up = false;
			this.pressed.right = false;
			this.pressed.down = false;
		}

		if (this.touchStart.x >= cW - (cW * partHorizontal)) {
			this.pressed.left = false;
			this.pressed.up = false;
			this.pressed.right = true;
			this.pressed.down = false;
		}
	};

	touchEnd = (event) => {
		if (event.cancelable)
			event.preventDefault();

		this.pressed.left = false;
		this.pressed.up = false;
		this.pressed.right = false;
		this.pressed.down = false;

		this.touchStart = null;
		this.touchPosition = null;
	};
}

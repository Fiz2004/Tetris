export class Controller {
	pressed;
	codes;
	//Точка начала касания
	touchStart;
	//Текущая позиция
	touchPosition;
	constructor(codes) {
		//Задаем начальное значение падения
		this.pressed = Object.create(null);
		this.codes = codes;
		//Точка начала касания
		this.touchStart = null;
		//Текущая позиция
		this.touchPosition = null;

		window.addEventListener("keydown", this.handler);
		window.addEventListener("keyup", this.handler);
		window.addEventListener("touchstart", this.touchStarts);
		window.addEventListener("touchmove", this.touchMove);
		window.addEventListener("touchend", this.touchEnd);
		window.addEventListener("touchcancel", this.touchEnd);
	}

	refresh() {
		this.pressed = null;
	}

	handler = event => {
		if (this.codes.hasOwnProperty(event.keyCode)) {
			this.pressed[this.codes[event.keyCode]] = (event.type === "keydown");
			event.preventDefault();
		}
	}

	touchStarts = event => {
		if (event.cancelable && event.target !== "button") {
			event.preventDefault();
		}
		this.touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		this.touchPosition = { x: this.touchStart.x, y: this.touchStart.y };

		if ((this.touchStart.x > document.documentElement.clientWidth * 0.295)
			&& this.touchStart.x < document.documentElement.clientWidth - (document.documentElement.clientWidth * 0.295)) {
			if (this.touchStart.y < document.documentElement.clientHeight * 0.5) {
				this.pressed["left"] = false;
				this.pressed["up"] = true;
				this.pressed["right"] = false;
				this.pressed["down"] = false;
			} else {
				this.pressed["left"] = false;
				this.pressed["up"] = false;
				this.pressed["right"] = false;
				this.pressed["down"] = true;
			}
		}
		if (this.touchStart.x <= document.documentElement.clientWidth * 0.295) {
			this.pressed["left"] = true;
			this.pressed["up"] = false;
			this.pressed["right"] = false;
			this.pressed["down"] = false;
		}
		if (this.touchStart.x >= document.documentElement.clientWidth - (document.documentElement.clientWidth * 0.295)) {
			this.pressed["left"] = false;
			this.pressed["up"] = false;
			this.pressed["right"] = true;
			this.pressed["down"] = false;
		}

	}

	touchEnd = event => {
		if (event.cancelable) {
			event.preventDefault();
		}
		this.pressed["left"] = false;
		this.pressed["up"] = false;
		this.pressed["right"] = false;
		this.pressed["down"] = false;

		this.touchStart = null;
		this.touchPosition = null;
	}
}
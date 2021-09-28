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

		document.addEventListener("keydown", this.handler);
		document.addEventListener("keyup", this.handler);
		document.addEventListener("touchstart", this.touchStarts);
		document.addEventListener("touchmove", this.touchMove);
		document.addEventListener("touchend", this.touchEnd);
		document.addEventListener("touchcancel", this.touchEnd);
	};
	refresh() {
		this.pressed = null;
	}
	handler = event => {
		if (this.codes.hasOwnProperty(event.keyCode)) {
			this.pressed[this.codes[event.keyCode]] = event.type == "keydown";
			event.preventDefault();
		}
	};
	touchStarts = event => {
		this.touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
		this.touchPosition = { x: this.touchStart.x, y: this.touchStart.y };

		if ((this.touchStart.x > document.documentElement.clientWidth * 0.295)
			&& this.touchStart.x < document.documentElement.clientWidth - (document.documentElement.clientWidth * 0.295)) {
			if (this.touchStart.y < document.documentElement.clientHeight * 0.5) {
				this.pressed["left"] = false;
				this.pressed["up"] = true;
				this.pressed["right"] = false;
				this.pressed["down"] = false;
			}
			else {
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

	};
	touchMove = event => {

	};
	touchEnd = event => {
		this.pressed["left"] = false;
		this.pressed["up"] = false;
		this.pressed["right"] = false;
		this.pressed["down"] = false;

		this.touchStart = null;
		this.touchPosition = null;
	};
};
export class Controller {
	pressed;
	codes;
	touchStart; //Точка начала касания
	touchPosition; //Текущая позиция
	sensitivity;
	constructor(codes) {
		//Задаем начальное значение падения
		this.pressed = Object.create(null);
		this.codes = codes;
		this.touchStart = null; //Точка начала касания
		this.touchPosition = null; //Текущая позиция
		this.sensitivity = 20;

		document.addEventListener("keydown", this.handler);
		document.addEventListener("keyup", this.handler);
		document.addEventListener("touchstart", this.touchStarts);
		document.addEventListener("touchmove", this.touchMove);
		document.addEventListener("touchend", this.touchEnd);
		document.addEventListener("touchcancel", this.touchEnd);
		document.addEventListener("contextmenu", this.contextMenu);

	};
	refresh() {
		this.pressed = null;
	}
	contextMenu = event => {
		event.preventDefault();
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
		//console.log("start= ", this.touchStart.x, this.touchStart.y)

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
		/*	this.touchPosition = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
			console.log("position= ", this.touchPosition.x, this.touchPosition.y)
			var d = //Получаем расстояния от начальной до конечной точек по обеим осям
			{
				x: this.touchStart.x - this.touchPosition.x,
				y: this.touchStart.y - this.touchPosition.y
			};
			console.log("end= ", d.x, d.y)
			if (Math.abs(d.x) > Math.abs(d.y)) //Проверяем, движение по какой оси было длиннее
			{
				if (Math.abs(d.x) > this.sensitivity) //Проверяем, было ли движение достаточно длинным
				{
					if (d.x > 0) //Если значение больше нуля, значит пользователь двигал пальцем справа налево
					{
	
					}
					else //Иначе он двигал им слева направо
					{
	
					}
				}
			}
			else //Аналогичные проверки для вертикальной оси
			{
				if (Math.abs(d.y) > this.sensitivity) {
					if (d.y > 0) //Свайп вверх
					{
	
					}
					else //Свайп вниз
					{
	
					}
				}
			}*/
	};
	touchEnd = event => {

		/*	var d = //Получаем расстояния от начальной до конечной точек по обеим осям
			{
				x: this.touchStart.x - this.touchPosition.x,
				y: this.touchStart.y - this.touchPosition.y
			};*/
		this.pressed["left"] = false;
		this.pressed["up"] = false;
		this.pressed["right"] = false;
		this.pressed["down"] = false;
		/*
		console.log("end= ", d.x, d.y)

		var msg = ""; //Сообщение

		if (Math.abs(d.x) > Math.abs(d.y)) //Проверяем, движение по какой оси было длиннее
		{
			if (Math.abs(d.x) > this.sensitivity) //Проверяем, было ли движение достаточно длинным
			{
				if (d.x > 0) //Если значение больше нуля, значит пользователь двигал пальцем справа налево
				{
					this.pressed[controller.codes[37]] = false;
				}
				else //Иначе он двигал им слева направо
				{
					this.pressed[controller.codes[39]] = false
				}
			}
		}
		else //Аналогичные проверки для вертикальной оси
		{
			if (Math.abs(d.y) > this.sensitivity) {
				if (d.y > 0) //Свайп вверх
				{

				}
				else //Свайп вниз
				{

				}
			}
		}*/

		this.touchStart = null;
		this.touchPosition = null;
	};

};
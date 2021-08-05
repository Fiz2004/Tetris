// Размер в пикселях элемента
const SIZE_TILES = 30;
// Количество элементов фона
const NUMBER_BACKGROUND_ELEMENTS = 16;
// Время в милисекундах одного движения
const UPDATE_TIME = 100;
// Шаг движения блоков
const STEP_MOVEMENT_AUTO = 10;
// Шаг движения блоков
const STEP_MOVEMENT_KEYPRESS = 30;
// Количество элементов фигур
const NUMBER_FIGURE_ELEMENTS = 4;
// Число кадров движения
const NUMBER_PERSONNAL = 10;
// Обозначение фигур, задаются координаты каждой ячейки
const FIGURE = [
	[
		[0, 1], [1, 1], [2, 1], [3, 1]
	],
	[
		[1, 1], [2, 1], [2, 2], [3, 2]
	],
	[
		[1, 1], [2, 1], [2, 2], [2, 3]
	],
	[
		[1, 1], [1, 2], [2, 2], [2, 3]
	],
	[
		[1, 1], [1, 2], [2, 2], [1, 3]
	],
	[
		[1, 1], [1, 2], [2, 1], [2, 2]
	],
	[
		[1, 1], [2, 1], [1, 2], [1, 3]
	]
];

// Просто сохранить, функция поворота точки x,y относительно x0,y0 на угол angle
function rotate(x, y, angle, x0 = 0, y0 = 0) {
	return {
		x: (x - x0) * Math.cos(pi * angle / 180) - (y - y0) * Math.sin(pi * angle / 180),
		y: (x - x0) * Math.sin(pi * angle / 180) + (y - y0) * Math.cos(pi * angle / 180),
	}
}

// Класс для обзначения координат x и y
class Point {
	x;
	y;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

// Класс для обзначения ячейки с координатами x и y, и сохранением номера фона
class Cell extends Point {
	view;
	constructor(x, y, view) {
		super(x, y);
		this.view = view;
	}
}

// Класс для фигуры
class Figure {
	cell = [];
	constructor() {
		//Задаем случайный номер для фигуры
		let randNumber = Math.floor(Math.random() * FIGURE.length);
		for (let i = 0; i < 4; i++) {
			//Задаем случайный фон для ячейки
			let randView = Math.floor(Math.random() * NUMBER_FIGURE_ELEMENTS) + 1;
			this.cell[i] = new Cell(FIGURE[randNumber][i][0], FIGURE[randNumber][i][1], randView);
		}
	};
}

// Класс для текущей падающей фигуры
class CurrentFigure extends Figure {
	position;
	constructor(fieldWidth, newCell) {
		super();
		this.cell = [...newCell];
		//Задаем стартовую позицию
		let width = this.cell.reduce((a, b) => a.x > b.x ? a : b).x;
		let height = this.cell.reduce((a, b) => a.y > b.y ? a : b).y;
		this.position = new Point(Math.floor(Math.random() * (fieldWidth - 1 - width)) * SIZE_TILES, (-1 - height) * SIZE_TILES);
	};

	//Получить массив занимаемый текущей фигурой по умолчанию, либо с задаными x и y, например при проверке коллизии
	getPosition(x = this.position.x, y = this.position.y) {
		let position = [];
		this.cell.forEach((cell) => position.push(new Point(
			cell.x + Math.ceil(x / SIZE_TILES),
			cell.y + Math.ceil(y / SIZE_TILES)
		)));
		return position;
	};
	
	// Проверяем столкновение
	isCollission(x, y, field) {
		let position = this.getPosition(x, y);
		for (let i = 0; i < position.length; i++) {
			if (position[i].x < 0) return true;
			if (position[i].x > (view.canvas.width - SIZE_TILES) / SIZE_TILES) return true;
			if (position[i].y < 0) return false;
			if (position[i].y > (view.canvas.height - SIZE_TILES) / SIZE_TILES) return true;
			if (field[position[i].y][position[i].x] !== 0) return true;
		}

		return false;
	};

	//функция поворота фигуры
	rotate() {
		this.cell.forEach((cell) => {
			let v = cell.x
			cell.x = 3 - cell.y;
			cell.y = v;
		})
	};
}

//Объект в котором хранится вся модель игры
let model = {
	//Текущие очки
	scores: 0,
	//Рекорд очков за все время
	record: 0,
	// Массив со значениями поля
	field: [],
	//Вспомогательная переменная для хранения ширины поля
	fieldWidth: 0,
	//Вспомогательная переменная для хранения высоты поля
	fieldHeight: 0,
	//Массив со значениями блоков
	fieldBlocks: [],
	//Текущая фигура
	currentFigure: {},
	//Следующая фигура
	nextFigure: {},
	//ID строки для выводла рекорда
	txtRecord: {},
	//Объект жука, с его координатами, направлением движения и кадром движения
	beetle: { position: Point, positionTile: Point, trafficX: "L", trafficY: "0", numberAnimation: 0 },
	//Инициализация модели игры
	init() {
		this.fieldWidth = view.canvas.width / SIZE_TILES;
		this.fieldHeight = view.canvas.height / SIZE_TILES;
		//Инициализируем массив фона с случайными числами
		this.field = Array.from({ length: this.fieldHeight }).map(() =>
			Array.from({ length: this.fieldWidth }).map(() =>
				(Math.floor(Math.random() * NUMBER_BACKGROUND_ELEMENTS))));
		this.fieldBlocks = Array.from({ length: this.fieldHeight }).map(() =>
			Array.from({ length: this.fieldWidth }).map(() => 0));
		this.scores = 0;

		this.nextFigure = new Figure();
		this.formCurrentFigure();

		this.beetle.positionTile = new Point(Math.floor(Math.random() * this.fieldWidth), (this.fieldHeight) - 1);
		this.beetle.position = new Point(0, 0);
		//Установить случайное движение
		this.beetle.trafficX = "L";
		this.beetle.trafficY = "0";
		this.getTrafficBeetle();
		this.beetle.numberAnimation = 0;
		this.record = localStorage.getItem('Record');
		this.txtRecord = document.getElementById('record');
		this.txtRecord.innerHTML = String(this.record).padStart(6, "0");

		//?Временное для тестирования
		/*
		for (let i = 0; i < this.fieldWidth - 1; i++)
			this.fieldBlocks[29][i] = 1;
		this.fieldBlocks[28][4] = 1;
		this.fieldBlocks[27][4] = 1;
		this.fieldBlocks[28][8] = 1;
		this.beetle.positionTile.y = 28;*/
	},

	//Функция для определения направления движения жука по горизонтали
	getTrafficBeetle() {
		function isCanNapr(napr) {
			const Y = model.beetle.positionTile.y;
			const X = model.beetle.positionTile.x;
			const mY = model.fieldHeight;
			const mX = model.fieldWidth;

			switch (napr.x + napr.y) {
				//Проверяем возможность пойти влево
				case "L0":
					//Если Жук находиться в крайней левой точке
					if (X == 0) return false;
					//Если слева препятствие
					if (model.fieldBlocks[Y][X - 1] != 0) return false;
					//Если Жук не на дне стакана то проверить есть ли слева снизу блок
					//if (Y + 1 < mY && model.fieldBlocks[Y+1][X-1] == 0) return false; 
					break;
				case "R0":
					//Если Жук находиться в крайней правой точке
					if (X + 1 == mX) return false;
					//Если справа препятствие
					if (model.fieldBlocks[Y][X + 1] != 0) return false;
					//Если Жук не на дне стакана то проверить есть ли справа снизу блок
					// if (Y + 1 < mY && model.fieldBlocks[Y + 1][X + 1]== 0) return false; 
					break;
				//Проверяем возможность пойти вниз
				case "RD":
				case "LD":
					//Если Жук находиться на дне стакана
					if (Y + 1 == mY) return false;
					//Если внизу есть препятствие
					if (model.fieldBlocks[Y + 1][X] != 0) return false;
					break;
				//Проверяем возможность пойти верх
				case "RU":
				case "LU":
					//Если Жук находиться на верху стакана
					if (Y - 1 < 0) return false;
					//Если сверху есть препятствие
					if (model.fieldBlocks[Y - 1][X] != 0) return false;
					switch (napr.x) {
						case "L":
							if (X == 0) return false; //Если Жук находиться в крайней левой точке
							if (model.fieldBlocks[Y - 1][X - 1] != 0) return false; //Если сверху слева есть препятствие
							if (model.fieldBlocks[Y][X - 1] == 0) return false; //Проверить есть ли слева снизу блок
							break;
						case "R":
							if (X + 1 == mX) return false; //Если Жук находиться в крайней правой точке
							if (model.fieldBlocks[Y - 1][X + 1] != 0) return false; //Если сверху справа есть препятствие
							if (model.fieldBlocks[Y][X + 1] == 0) return false; //Если Жук не на дне стакана то проверить есть ли справа снизу блок
							break;
					}
					break;
				//Проверяем возможность пойти верх верх
				case "RUU":
				case "LUU":
					//Если Жук находиться на верху стакана
					if (Y - 2 < 0) return false;
					//Если сверху есть препятствие
					if (model.fieldBlocks[Y - 1][X] != 0) return false;
					//Если сверху есть препятствие
					if (model.fieldBlocks[Y - 2][X] != 0) return false;
					switch (napr.x) {
						case "L":
							//Если Жук находиться в крайней левой точке
							if (X == 0) return false;
							//Если сверху слева есть препятствие
							if (model.fieldBlocks[Y - 2][X - 1] != 0) return false;
							//Если Жук не на дне стакана то проверить есть ли слева снизу блок
							if (Y - 1 < mY && model.fieldBlocks[Y - 1][X - 1] == 0) return false;
							break;
						case "R":
							//Если Жук находиться в крайней правой точке
							if (X + 1 == mX) return false;
							//Если сверху справа есть препятствие
							if (model.fieldBlocks[Y - 2][X + 1] != 0) return false;
							//Если Жук не на дне стакана то проверить есть ли слева снизу блок
							if (Y - 1 < mY && model.fieldBlocks[Y - 1][X + 1] == 0) return false;
							break;
					}
					break;
				case "00":
					break;
				default:
					console.log("Ошибка в блоке switch model.beetle.traffic (isCanNapr)= ", this.beetle.trafficX);
					console.log("Ошибка в блоке switch model.beetle.traffic (isCanNapr)= ", this.beetle.trafficY);
			}
			return true;
		}

		const naprDvig = {
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

		let lengthArray = naprDvig[this.beetle.trafficX + this.beetle.trafficY].length;
		for (let i = 0; i < lengthArray; i++) {
			let napr = naprDvig[this.beetle.trafficX + this.beetle.trafficY].shift()
			if (isCanNapr(napr)) {
				this.beetle.trafficX = napr.x;
				this.beetle.trafficY = napr.y;
				return;
			}
		}

		this.beetle.trafficX = "0";
		this.beetle.trafficY = "0";

		/*
		 * //Продолжаем движение в заданном направлении или шанс 1 из 10 что изменяем его на противоположноеж
		 * let traffic = Math.floor(Math.random() * 10);
		 * if (traffic == 0)
		 *			return "L"
		 *	else if (traffic == 1)
		 *		return "R"
		 *	else
		 *			//if (this.beetle.trafficX != undefined)
		 *			return this.beetle.trafficX;
		 *		//else
		 *	//return getTrafficBeetle();*/

	},

	//Метод движения жука
	beetleAnimation() {
		//Проверка перехода за край клетки
		function examCoor(value) {
			if (value.coor < 0) {
				value.coorTiles -= 1;
				value.coor = SIZE_TILES + value.coor;
			}

			if (value.coor >= SIZE_TILES) {
				value.coorTiles += 1;
				value.coor = value.coor - SIZE_TILES;
			}

			return [value.coor, value.coorTiles];
		}

		if (this.beetle.numberAnimation++ == NUMBER_PERSONNAL) {
			model.getTrafficBeetle();
			this.beetle.numberAnimation = 1;
		}

		switch (this.beetle.trafficY) {
			case "U":
			case "UU":
			case "D":
				switch (this.beetle.trafficY) {
					case "U":
					case "UU":
						this.beetle.position.y -= SIZE_TILES / NUMBER_PERSONNAL;
						break;
					case "D":
						this.beetle.position.y += SIZE_TILES / NUMBER_PERSONNAL;
						break;
				}

				[this.beetle.position.y, this.beetle.positionTile.y] = examCoor({ coor: this.beetle.position.y, coorTiles: this.beetle.positionTile.y });
				break;
			case "0":
				break;
			default:
				console.log("Ошибка в блоке switch model.beetle.trafficY= ", this.beetle.trafficY);
		}

		if (this.beetle.trafficY == "0")
			switch (this.beetle.trafficX) {
				case "L":
				case "R":
					switch (this.beetle.trafficX) {
						case "L":
							this.beetle.position.x -= SIZE_TILES / NUMBER_PERSONNAL;
							break;
						case "R":
							this.beetle.position.x += SIZE_TILES / NUMBER_PERSONNAL;
							break;
					}

					[this.beetle.position.x, this.beetle.positionTile.x] = examCoor({ coor: this.beetle.position.x, coorTiles: this.beetle.positionTile.x });
					break;
				case "0":
					break;
				default:
					console.log("Ошибка в блоке switch model.beetle.trafficX= ", this.beetle.trafficX);
			}
	},

	//Метод формирования текущей фигуры
	formCurrentFigure() {
		this.currentFigure = new CurrentFigure(this.fieldWidth, this.nextFigure.cell);
		this.nextFigure = new Figure();

		//?Почему то не показывает с самого начала первую фигуру, если убрать отрисову в методе view.draw
		//view.drawNextFigure();

		controller.init();
	},

	//Удаление строки
	deleteRow() {
		this.fieldBlocks.forEach((y) => {
			if (y.every((x) => x !== 0)) {
				//?Проверить как лучше чтобы жук падал сразщу при исчезновании или двигался вниз
				// if (this.beetle.positionTile.y < this.fieldBlocks.indexOf(y))
				// 	this.beetle.positionTile.y += 1;
				this.fieldBlocks.splice(this.fieldBlocks.indexOf(y), 1);
				this.fieldBlocks.unshift(Array.from({ length: this.fieldWidth }).map(() =>0));
				
				/*for (let i = this.fieldBlocks.indexOf(y); i > 0; i--)
					for (let j = 0; j < this.fieldWidth; j++)
						this.fieldBlocks[i][j] = this.fieldBlocks[i - 1][j];*/
				
			/*	this.field = Array.from({ length: this.fieldHeight }).map(() =>
					Array.from({ length: this.fieldWidth }).map(() =>
						(Math.floor(Math.random() * NUMBER_BACKGROUND_ELEMENTS))));
				this.fieldBlocks = Array.from({ length: this.fieldHeight }).map(() =>
					Array.from({ length: this.fieldWidth }).map(() => 0));
			*/	
				this.scores += 100;
			}
		})
	},

	get_tX: (x) => Math.ceil(x / SIZE_TILES),
	get_tY: (y) => Math.ceil(y / SIZE_TILES),
	tick() {
		if (controller.leftPressed) {
			if (this.currentFigure.isCollission(this.currentFigure.position.x - STEP_MOVEMENT_KEYPRESS, this.currentFigure.position.y, this.fieldBlocks) == false)
				this.currentFigure.position.x -= STEP_MOVEMENT_KEYPRESS;
		}

		if (controller.rightPressed) {
			if (this.currentFigure.isCollission(this.currentFigure.position.x + STEP_MOVEMENT_KEYPRESS, this.currentFigure.position.y, this.fieldBlocks) == false)
				this.currentFigure.position.x += STEP_MOVEMENT_KEYPRESS;
		}

		if (controller.upPressed) {
			this.currentFigure.rotate();
			if (this.currentFigure.isCollission(this.currentFigure.position.x, this.currentFigure.position.y, this.fieldBlocks)) {
				this.currentFigure.rotate();
				this.currentFigure.rotate();
				this.currentFigure.rotate();
			}
		}

		let stepY = STEP_MOVEMENT_AUTO;
		if (controller.downPressed) {
			stepY = STEP_MOVEMENT_KEYPRESS;
		}

		this.currentFigure.position.y += stepY;

		if (this.currentFigure.isCollission(this.currentFigure.position.x, this.currentFigure.position.y, this.fieldBlocks)) {
			let positionCells = this.currentFigure.getPosition();
			for (let i = 0; i < positionCells.length; i++) {
				//! Условия проигрыша не полные иногда фигура ложится в существующую
				if (positionCells[i].y - 1 < 0) {
					localStorage.setItem('Record', model.scores);
					alert("Вы проиграли");
					this.init();
					return;
				}

				this.fieldBlocks[positionCells[i].y - 1][positionCells[i].x] = this.currentFigure.cell[i].view;
			}
			this.deleteRow();
			this.formCurrentFigure();
		};

		if (this.fieldBlocks[model.beetle.positionTile.y][this.beetle.positionTile.x] != 0) {
			console.log("!!!Вы проиграли!!!");
			localStorage.setItem('Record', model.scores);
			alert("Вы проиграли");
			this.init();
			return;
		}

		this.beetleAnimation();
		view.draw();
	},
};
//Объект рисования
let view = {
	canvas: {},
	ctx: {},
	canvasNextFigure: {},
	ctxNextFigure: {},
	txtScores: {},
	imgFon: new Image(),
	imgKv: [],
	imgBeetle: new Image(),
	init() {
		this.canvas = document.getElementById('canvasId');
		this.ctx = this.canvas.getContext("2d");
		this.canvasNextFigure = document.getElementById('canvasNextFigureId');
		this.ctxNextFigure = this.canvasNextFigure.getContext("2d");
		this.txtScores = document.getElementById('scores');

		//Формируем картинки для фигур
		this.imgKv = new Array(NUMBER_FIGURE_ELEMENTS);
		for (let i = 0; i < this.imgKv.length; i++) {
			this.imgKv[i] = new Image();
		}

		//загружаем картинки фона
		this.imgFon.src = 'fon.png';

		//загружаем картинки фигур
		for (let i = 0; i < this.imgKv.length; i++) {
			this.imgKv[i].src = 'Kvadrat' + (i + 1) + '.png';
		}

		this.imgBeetle.src = 'Beetle.png';
	},
	drawNextFigure() {
		this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
		for (let i = 0; i < model.nextFigure.cell.length; i++) {
			this.ctxNextFigure.drawImage(this.imgKv[model.nextFigure.cell[i].view - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.nextFigure.cell[i].x * SIZE_TILES), (model.nextFigure.cell[i].y * SIZE_TILES), SIZE_TILES, SIZE_TILES);
		}
	},
	draw() {
		//Рисуем фон и заполненный стакан
		for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
			for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
				if (model.fieldBlocks[i][j] === 0) {
					this.ctx.drawImage(this.imgFon, Math.floor(model.field[i][j] / 4) * SIZE_TILES, (model.field[i][j] % 4) * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
				} else {
					this.ctx.drawImage(this.imgKv[model.fieldBlocks[i][j] - 1], 0, 0, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
				}

		//Рисуем текущую падующую фигуру
		for (let i = 0; i < model.currentFigure.cell.length; i++) {
			this.ctx.drawImage(this.imgKv[model.currentFigure.cell[i].view - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.currentFigure.cell[i].x * SIZE_TILES) + model.currentFigure.position.x, (model.currentFigure.cell[i].y * SIZE_TILES) + model.currentFigure.position.y, SIZE_TILES, SIZE_TILES);
		}

		//Рисуем бегующего жука
		let imgSmX;
		let imgSmY;
		if (model.beetle.trafficY == "0" || (model.beetle.numberAnimation % 2 == 0 && model.beetle.trafficY != "U" && model.beetle.trafficY != "UU"))
			[imgSmX, imgSmY] = [...[0, 0]];
		else if (model.beetle.trafficX == "L" && model.beetle.trafficY == "0")
			[imgSmX, imgSmY] = [...[1 * SIZE_TILES, 0]];
		else if (model.beetle.trafficX == "R" && model.beetle.trafficY == "0")
			[imgSmX, imgSmY] = [...[2 * SIZE_TILES, 0]];
		else if (model.beetle.trafficX == "L" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
			[imgSmX, imgSmY] = [...[0, 1 * SIZE_TILES]];
		else if (model.beetle.trafficX == "R" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
			[imgSmX, imgSmY] = [...[0, 2 * SIZE_TILES]];
		else
			[imgSmX, imgSmY] = [...[3 * SIZE_TILES, 0]];

		this.ctx.drawImage(this.imgBeetle, imgSmX, imgSmY, SIZE_TILES, SIZE_TILES, model.beetle.positionTile.x * SIZE_TILES + model.beetle.position.x, model.beetle.positionTile.y * SIZE_TILES + model.beetle.position.y, SIZE_TILES, SIZE_TILES);

		//Обновляем
		this.txtScores.innerHTML = String(model.scores).padStart(6, "0");

		view.drawNextFigure();
	}
};

let controller = {
	rightPressed: false,
	leftPressed: false,
	upPressed: false,
	downPressed: false,

	init() {
		document.addEventListener("keydown", this.keyDownHandler, false);
		document.addEventListener("keyup", this.keyUpHandler, false);
		//Задаем начальное значение падения
		controller.rightPressed = false;
		controller.upPressed = false;
		controller.leftPressed = false;
		controller.downPressed = false;
	},

	keyDownHandler(e) {
		switch (e.keyCode) {
			case 39: controller.rightPressed = true; break;
			case 38: controller.upPressed = true; break;
			case 37: controller.leftPressed = true; break;
			case 40: controller.downPressed = true; break;
		}
	},

	keyUpHandler(e) {
		switch (e.keyCode) {
			case 39: controller.rightPressed = false; break;
			case 38: controller.upPressed = false; break;
			case 37: controller.leftPressed = false; break;
			case 40: controller.downPressed = false; break;
		}
	},

};

window.onload = function () {
	view.init();
	model.init();
	setInterval(() => model.tick(), UPDATE_TIME);
}






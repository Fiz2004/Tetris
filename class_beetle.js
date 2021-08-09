import { Element, Point, Figure, CurrentFigure } from './class.js';
import {
	SIZE_TILES, NUMBER_BACKGROUND_ELEMENTS, UPDATE_TIME,
	 NUMBER_FIGURE_ELEMENTS, NUMBER_FRAMES_BEEATLE,
	NUMBER_FRAMES_ELEMENTS, PROBABILITY_EAT, DIRECTORY_IMG, FIGURE,
	NAPRDVIG
} from './const.js';

// Класс для жука
export class Beetle {
	position;
	positionTile;
	trafficX;
	trafficY;
	framesAnimation;
	eat;
	grid;
	constructor(grid) {
		this.grid = grid;
		this.positionTile = new Point(Math.floor(Math.random() * this.grid.width), (this.grid.height) - 1);
		this.position = new Point(0, 0);
		//Установить случайное движение
		this.trafficX = "L";
		this.trafficY = "0";
		this.eat = 0;
		this.getTrafficBeetle();
		this.framesAnimation = 0;
	};
	//Функция для определения направления движения жука по горизонтали
	getTrafficBeetle() {
		function isCanNapr(napr) {
			const Y = this.positionTile.y;
			const X = this.positionTile.x;
			const mY = this.grid.height;
			const mX = this.grid.width;
			//Определяем будет ли жук есть блок исходя из вероятности заданной константой
			const randEat = Math.floor(Math.random() * 100) < PROBABILITY_EAT ? true : false;

			switch (napr.x + napr.y) {
				//Проверяем возможность пойти влево
				case "L0":
					//Если Жук находиться в крайней левой точке
					if (X == 0) return false;
					//Если слева препятствие
					if (this.grid.space[Y][X - 1].element != 0) {
						if (randEat) {
							this.eat = 1;
							return true;
						}
						else { return false; }
					}
					break;

				case "R0":
					//Если Жук находиться в крайней правой точке
					if (X + 1 == mX) return false;
					//Если справа препятствие
					if (this.grid.space[Y][X + 1].element != 0) {
						//?Забыл что проверяет, уточнить
						//if (model.fieldBlocks[Y][X - 1].view != 0) return false;
						if (randEat) {
							this.eat = 1;
							return true;
						}
						else { return false; }
					}
					break;
				//Проверяем возможность пойти вниз
				case "RD":
				case "LD":
					//Если Жук находиться на дне стакана
					if (Y + 1 == mY) return false;
					//Если внизу есть препятствие
					if (this.grid.space[Y + 1][X].element != 0) {
						//?Забыл что проверяет, уточнить
						//if (model.fieldBlocks[Y][X - 1].view != 0) return false;
						if (randEat) {
							this.eat = 1;
							return true;
						}
						else { return false; }
					}
					break;
				//Проверяем возможность пойти верх
				case "RU":
				case "LU":
					//Если Жук находиться на верху стакана
					if (Y - 1 < 0) return false;
					//Если сверху есть препятствие
					if (this.grid.space[Y - 1][X].element != 0) return false;
					switch (napr.x) {
						case "L":
							//Если Жук находиться в крайней левой точке
							if (X == 0) return false;
							//Если сверху слева есть препятствие
							if (this.grid.space[Y - 1][X - 1].element != 0) return false;
							//Проверить есть ли слева снизу блок
							if (this.grid.space[Y][X - 1].element == 0) return false;
							break;
						case "R":
							//Если Жук находиться в крайней правой точке
							if (X + 1 == mX) return false;
							//Если сверху справа есть препятствие
							if (this.grid.space[Y - 1][X + 1].element != 0) return false;
							//Если Жук не на дне стакана то проверить есть ли справа снизу блок
							if (this.grid.space[Y][X + 1].element == 0) return false;
							break;
					}
					break;
				//Проверяем возможность пойти верх верх
				case "RUU":
				case "LUU":
					//Если Жук находиться на верху стакана
					if (Y - 2 < 0) return false;
					//Если сверху есть препятствие
					if (this.grid.space[Y - 1][X].element != 0) return false;
					//Если сверху есть препятствие
					if (this.grid.space[Y - 2][X].element != 0) return false;
					switch (napr.x) {
						case "L":
							//Если Жук находиться в крайней левой точке
							if (X == 0) return false;
							//Если сверху слева есть препятствие
							if (this.grid.space[Y - 2][X - 1].element != 0) return false;
							//Если Жук не на дне стакана то проверить есть ли слева снизу блок
							if (Y - 1 < mY && this.grid.space[Y - 1][X - 1].element == 0) return false;
							break;
						case "R":
							//Если Жук находиться в крайней правой точке
							if (X + 1 == mX) return false;
							//Если сверху справа есть препятствие
							if (this.grid.space[Y - 2][X + 1].element != 0) return false;
							//Если Жук не на дне стакана то проверить есть ли слева снизу блок
							if (Y - 1 < mY && this.grid.space[Y - 1][X + 1].element == 0) return false;
							break;
					}
					break;
				case "00":
					break;
				default:
					console.log("Ошибка в блоке switch class_beetle.traffic (isCanNapr)= ", this.trafficX);
					console.log("Ошибка в блоке switch class_beetle.traffic (isCanNapr)= ", this.trafficY);
			}
			return true;
		}

		let naprDvig = [...NAPRDVIG[this.trafficX + this.trafficY]];
		for (let i = 0; i < NAPRDVIG[this.trafficX + this.trafficY].length; i++) {
			let napr = naprDvig.shift()
			if (isCanNapr.call(this,napr)) {
				this.trafficX = napr.x;
				this.trafficY = napr.y;
				return;
			}
		}

		this.trafficX = "0";
		this.trafficY = "0";

		/*
		 * //Продолжаем движение в заданном направлении или шанс 1 из 10 что изменяем его на противоположноеж
		 * let traffic = Math.floor(Math.random() * 10);
		 * if (traffic == 0)
		 *			return "L"
		 *	else if (traffic == 1)
		 *		return "R"
		 *	else
		 *			//if (this.trafficX != undefined)
		 *			return this.trafficX;
		 *		//else
		 *	//return getTrafficBeetle();*/

	};

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

		if (this.framesAnimation++ == NUMBER_FRAMES_BEEATLE) {
			if (this.eat == 1) {
				this.eat = 0;
				this.grid.space[this.positionTile.y][this.positionTile.x].element = 0;
				this.grid.space[this.positionTile.y][this.positionTile.x].status.L = 0;
				this.grid.space[this.positionTile.y][this.positionTile.x].status.R = 0;
				this.grid.space[this.positionTile.y][this.positionTile.x].status.U = 0;
			}
			this.getTrafficBeetle();
			this.framesAnimation = 1;
		}

		if (this.eat == 1 && (this.trafficX + this.trafficY) == "L0") {
			if (this.framesAnimation <= 3)
				this.grid.space[this.positionTile.y][this.positionTile.x].status.R = 1;
			if (this.framesAnimation > 3 && this.framesAnimation <= 6)
				this.grid.space[this.positionTile.y][this.positionTile.x].status.R = 2;
			if (this.framesAnimation > 6 && this.framesAnimation <= 8)
				this.grid.space[this.positionTile.y][this.positionTile.x].status.R = 3;
			if (this.framesAnimation > 6 && this.framesAnimation <= NUMBER_FRAMES_BEEATLE)
				this.grid.space[this.positionTile.y][this.positionTile.x].status.R = 4;
		}
		if (this.eat == 1 && (this.trafficX + this.trafficY) == "R0") {
			if (this.framesAnimation <= 3)
				this.grid.space[this.positionTile.y][this.positionTile.x + 1].status.L = 1;
			if (this.framesAnimation > 3 && this.framesAnimation <= 6)
				this.grid.space[this.positionTile.y][this.positionTile.x + 1].status.L = 2;
			if (this.framesAnimation > 6 && this.framesAnimation <= 8)
				this.grid.space[this.positionTile.y][this.positionTile.x + 1].status.L = 3;
			if (this.framesAnimation > 6 && this.framesAnimation <= NUMBER_FRAMES_BEEATLE)
				this.grid.space[this.positionTile.y][this.positionTile.x + 1].status.L = 4;
		}
		if (this.eat == 1 && ((this.trafficX + this.trafficY) == "RD" || (this.trafficX + this.trafficY) == "LD")) {
			if (this.framesAnimation <= 3)
				this.grid.space[this.positionTile.y + 1][this.positionTile.x].status.U = 1;
			if (this.framesAnimation > 3 && this.framesAnimation <= 6)
				this.grid.space[this.positionTile.y + 1][this.positionTile.x].status.U = 2;
			if (this.framesAnimation > 6 && this.framesAnimation <= 8)
				this.grid.space[this.positionTile.y + 1][this.positionTile.x].status.U = 3;
			if (this.framesAnimation > 6 && this.framesAnimation <= NUMBER_FRAMES_BEEATLE)
				this.grid.space[this.positionTile.y + 1][this.positionTile.x].status.U = 4;
		}

		switch (this.trafficY) {
			case "U":
			case "UU":
			case "D":
				switch (this.trafficY) {
					case "U":
					case "UU":
						this.position.y -= SIZE_TILES / NUMBER_FRAMES_BEEATLE;
						break;
					case "D":
						this.position.y += SIZE_TILES / NUMBER_FRAMES_BEEATLE;
						break;
				}

				[this.position.y, this.positionTile.y] = examCoor({ coor: this.position.y, coorTiles: this.positionTile.y });
				break;
			case "0":
				break;
			default:
				console.log("Ошибка в блоке switch class_beetle.trafficY= ", this.trafficY);
		}

		if (this.trafficY == "0")
			switch (this.trafficX) {
				case "L":
				case "R":
					switch (this.trafficX) {
						case "L":
							this.position.x -= SIZE_TILES / NUMBER_FRAMES_BEEATLE;
							break;
						case "R":
							this.position.x += SIZE_TILES / NUMBER_FRAMES_BEEATLE;
							break;
					}

					[this.position.x, this.positionTile.x] = examCoor({ coor: this.position.x, coorTiles: this.positionTile.x });
					break;
				case "0":
					break;
				default:
					console.log("Ошибка в блоке switch class_beetle.trafficX= ", this.trafficX);
			}
	};
}
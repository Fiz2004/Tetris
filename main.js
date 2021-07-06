const SIZE_TILES = 30;//Размер в пикселях элемента
const NUMBER_BACKGROUND_ELEMENTS = 16;//Количество элементов фона
const UPDATE_TIME = 100;//Время в милисекундах одного движения
const STEP_MOVEMENT_AUTO = 10;//Шаг движения блоков
const STEP_MOVEMENT_KEYPRESS = 30;//Шаг движения блоков
const NUMBER_FIGURE_ELEMENTS = 4;// Количество элементов фигур
const FIGURE = [[
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]]],
[
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 1], [0, 2], [1, 0]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 1], [0, 2], [1, 0]]],
[
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]]],
[
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 0], [2, 0]]],
[
    [[0, 0], [0, 1], [1, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 0], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 0]]],
[
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]]],
[
    [[0, 0], [1, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1]]]
];

let model = {
    scores: 0,
    field: [],
    fieldBlocks: [],
    tekFig: {},
    formtekFigure() {
        //Формируем текущую фигуру
        let numberTekFig = Math.floor(Math.random() * FIGURE.length);
        this.tekFig = {
            ...FIGURE[numberTekFig],
            rotate: 0,
            viewElement: Array.from({ length: FIGURE[numberTekFig][0].length }).map(() => Math.floor(Math.random() * NUMBER_FIGURE_ELEMENTS) + 1)
        };

        controller.init();
    },
    init() {
        //Инициализируем массив фона с случайными числами
        this.field = Array.from({ length: view.canvas.height / SIZE_TILES }).map(() =>
            Array.from({ length: view.canvas.width / SIZE_TILES }).map(() =>
                (Math.floor(Math.random() * NUMBER_BACKGROUND_ELEMENTS))));
        this.fieldBlocks = Array.from({ length: view.canvas.height / SIZE_TILES }).map(() =>
            Array.from({ length: view.canvas.width / SIZE_TILES }).map(() => 0));
        this.scores = 0;
        this.formtekFigure();

    },
    deleteRow() {
        this.fieldBlocks.forEach((y) => {
            if (y.every((x) => x !== 0)) {
                for (let i = this.fieldBlocks.indexOf(y); i > 0; i--)
                    for (let j = 0; j < view.canvas.width / SIZE_TILES; j++)
                        this.fieldBlocks[i][j] = this.fieldBlocks[i - 1][j];
                this.scores += 100;
            }
        })
    }
};
let view = {
    canvas: {},
    ctx: {},
    txtScores: {},
    imgFon: new Image(),
    imgKv: [],
    init() {
        this.canvas = document.getElementById('canvasId');
        this.ctx = this.canvas.getContext("2d");
        this.txtScores = document.getElementById('scores');
        document.addEventListener("keydown", controller.keyDownHandler, false);
        document.addEventListener("keyup", controller.keyUpHandler, false);
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
    },
    draw() {
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.canvas.height / SIZE_TILES; i++)
            for (let j = 0; j < this.canvas.width / SIZE_TILES; j++)
                if (model.fieldBlocks[i][j] === 0) {
                    this.ctx.drawImage(this.imgFon, Math.floor(model.field[i][j] / 4) * SIZE_TILES, (model.field[i][j] % 4) * SIZE_TILES, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
                }
                else {
                    this.ctx.drawImage(this.imgKv[model.fieldBlocks[i][j] - 1], 0, 0, SIZE_TILES, SIZE_TILES, j * SIZE_TILES, i * SIZE_TILES, SIZE_TILES, SIZE_TILES);
                }
        for (let i = 0; i < model.tekFig[model.tekFig.rotate].length; i++) {
            this.ctx.drawImage(this.imgKv[model.tekFig.viewElement[i] - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.tekFig[model.tekFig.rotate][i][0] * SIZE_TILES) + controller.x, (model.tekFig[model.tekFig.rotate][i][1] * SIZE_TILES) + controller.y, SIZE_TILES, SIZE_TILES);
        }
        this.txtScores.innerHTML = model.scores;
    }
};
let controller = {
    x: 0,
    y: 0,
    rightPressed: false,
    leftPressed: false,
    upPressed: false,
    downPressed: false,
    get_tX(x) {
        return Math.ceil(x / SIZE_TILES);
    },
    get_tY(y) {
        return Math.ceil(y / SIZE_TILES);
    },
    tick() {
        let startY = this.y;



        if (this.leftPressed) {
            if (this.collission.call(this, this.x - STEP_MOVEMENT_KEYPRESS, this.y) == false)
                this.x -= STEP_MOVEMENT_KEYPRESS;
        }

        if (this.rightPressed) {
            if (this.collission.call(this, this.x + STEP_MOVEMENT_KEYPRESS, this.y) == false)
                this.x += STEP_MOVEMENT_KEYPRESS;
        }

        if (this.upPressed) {
            if (model.tekFig.rotate + 1 == 4)
                model.tekFig.rotate = 0;
            else
                model.tekFig.rotate += 1;
            if (this.collission.call(this, this.x, this.y))
                if (model.tekFig.rotate - 1 < 0)
                    model.tekFig.rotate = 4;
                else
                    model.tekFig.rotate -= 1;
        }

        let stepY = STEP_MOVEMENT_AUTO;
        if (this.downPressed) {
            stepY = STEP_MOVEMENT_KEYPRESS;
        }
        this.y += stepY;

        if (this.collission.call(this, this.x, this.y) == true) {
            for (let i = 0; i < model.tekFig[model.tekFig.rotate].length; i++) {
                let tX = this.get_tX(this.x) + model.tekFig[model.tekFig.rotate][i][0];
                let tY = this.get_tY(this.y) + model.tekFig[model.tekFig.rotate][i][1];
                model.fieldBlocks[tY - 1][tX] = model.tekFig.viewElement[i];
            }
            model.deleteRow();
            model.formtekFigure();
            this.y = 0;
        }
        if (startY == 0 && this.y == 0) {
            alert("Вы проиграли");
            model.init();
        }
        view.draw();
    },
    collission(x, y) { // Проверяем столкновение

        for (let i = 0; i < model.tekFig[model.tekFig.rotate].length; i++) {
            let tX = this.get_tX(x) + model.tekFig[model.tekFig.rotate][i][0];
            let tY = this.get_tY(y) + model.tekFig[model.tekFig.rotate][i][1];

            if (tX < 0)
                return true;
            if (tX > (view.canvas.width - SIZE_TILES) / SIZE_TILES)
                return true;

            if (tY > (view.canvas.height - SIZE_TILES) / SIZE_TILES)
                return true;

            if (model.fieldBlocks[tY][tX] !== 0)
                return true;


            //!Дописать условие при сдвиге влево и вправо при существующем блоке
            /*if (tY > 0 && typeof (model.map[tY][tX]) !== "number" &&
                ((y + model.tekFig[model.tekFig.rotate][i][1] * SIZE_TILES + SIZE_TILES) % SIZE_TILES) <= SIZE_TILES - STEP_MOVEMENT_AUTO - 1)
                return true;*/
        }
        return false;
    },
    init() {
        //Задаем начальное значение падения
        this.y = 0;
        let width = model.tekFig[model.tekFig.rotate].reduce((max, coor) => coor[0] > max[0] ? max[0] : coor[0]);
        this.x = Math.floor(Math.random() * (view.canvas.width / SIZE_TILES - width)) * SIZE_TILES;
    },
    keyDownHandler(e) {
        if (e.keyCode == 39) {
            controller.rightPressed = true;
        }
        else if (e.keyCode == 38) {
            controller.upPressed = true;
        }
        else if (e.keyCode == 37) {
            controller.leftPressed = true;
        }
        else if (e.keyCode == 40) {
            controller.downPressed = true;
        }

    },

    keyUpHandler(e) {
        if (e.keyCode == 39) {
            controller.rightPressed = false;
        }
        else if (e.keyCode == 38) {
            controller.upPressed = false;
        }
        else if (e.keyCode == 37) {
            controller.leftPressed = false;
        }
        else if (e.keyCode == 40) {
            controller.downPressed = false;
        }

    }
};



window.onload = function () {
    view.init();
    model.init();
    setInterval(() => controller.tick(), UPDATE_TIME);
}






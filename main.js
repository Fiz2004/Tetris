const SIZE_TILES = 30;//Размер в пикселях элемента
const NUMBER_BACKGROUND_ELEMENTS = 16;//Количество элементов фона
const UPDATE_TIME = 100;//Время в милисекундах одного движения
const STEP_MOVEMENT_AUTO = 10;//Шаг движения блоков
const STEP_MOVEMENT_KEYPRESS = 30;//Шаг движения блоков
const NUMBER_FIGURE_ELEMENTS = 4;// Количество элементов фигур
const FIGURE = [{
    number: 4,
    сoordinates: [[[0, 0], [1, 0], [2, 0], [3, 0]],
    // ****
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    //    *
    //    *
    //    *
    //    *
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    // ****
    [[0, 0], [0, 1], [0, 2], [0, 3]]]
    //    *
    //    *
    //    *
    //    *
}, {
    number: 4,
    сoordinates: [[[0, 0], [1, 0], [1, 1], [2, 1]],
    //** 
    // **
    [[0, 1], [1, 1], [0, 2], [1, 0]],
    // *
    //**
    //*
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 1], [0, 2], [1, 0]]]
}, {
    number: 4,
    сoordinates: [[[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]]]
},
{
    number: 4,
    сoordinates: [[[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 0], [2, 0]]]
},
{
    number: 4,
    сoordinates: [[[0, 0], [0, 1], [1, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 0], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 0]]]
},
{
    number: 4,
    сoordinates: [[[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]]]
},
{
    number: 4,
    сoordinates: [[[0, 0], [1, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1]]]
},
];

let model = {
    scores: 0,
    map: [],
    tekFig: {},
    formtekFigure() {
        //Формируем текущую фигуру
        let numberTekFig = Math.floor(Math.random() * FIGURE.length);
        this.tekFig = {
            ...FIGURE[numberTekFig],
            rotate: 0,
            viewElement: Array.from({ length: FIGURE[numberTekFig].number }).map(() => Math.floor(Math.random() * NUMBER_FIGURE_ELEMENTS))
        };
        
        controller.init();
    },
    init() {
        //Инициализируем массив фона с случайными числами
        this.map = Array.from({ length: view.canvas.width / SIZE_TILES }).map(() =>
            Array.from({ length: view.canvas.height / SIZE_TILES }).map(() =>
                (Math.floor(Math.random() * NUMBER_BACKGROUND_ELEMENTS))));
        this.scores = 0;
        this.formtekFigure();

    },
    deleteRow() {
        for (let j = 0; j < view.canvas.height / SIZE_TILES; j++) {
            var del = true;
            let y = j;
            for (let i = 0; i < view.canvas.width / SIZE_TILES; i++)
                if (typeof (this.map[i][j]) === 'number') {
                    del = false;
                    break;
                }
            if (del == true) {
                // Если вся строка заполнена удаляем ее
                for (let i = 0; i < view.canvas.width / SIZE_TILES; i++)
                    for (let j = y; j > 0; j--)
                        if (typeof (this.map[i][j]) !== 'number' && typeof (this.map[i][j - 1]) === 'number') {
                            this.map[i][j] = this.map[i][j].fon;
                        }
                        else if (typeof (this.map[i][j]) !== 'number' && typeof (this.map[i][j - 1]) !== 'number') {
                            this.map[i][j] = { elements: "Block", nomer: this.map[i][j - 1].nomer, fon: this.map[i][j].fon };
                            this.map[i][j - 1] = this.map[i][j - 1].fon;
                        } else if (typeof (this.map[i][j]) === 'number' && typeof (this.map[i][j - 1]) !== 'number') {
                            this.map[i][j] = { elements: "Block", nomer: this.map[i][j - 1].nomer, fon: this.map[i][j]};
                            this.map[i][j - 1] = this.map[i][j - 1].fon;
                        }
                this.scores += 100;
            }

        }
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
        for (let i = 0; i < this.canvas.width / SIZE_TILES; i++)
            for (let j = 0; j < this.canvas.height / SIZE_TILES; j++)
                if (typeof (model.map[i][j]) === "number") {
                    this.ctx.drawImage(this.imgFon, Math.floor(model.map[i][j] / 4) * SIZE_TILES, (model.map[i][j] % 4) * SIZE_TILES, SIZE_TILES, SIZE_TILES, i * SIZE_TILES, j * SIZE_TILES, SIZE_TILES, SIZE_TILES);
                }
                else {
                    this.ctx.drawImage(this.imgKv[model.map[i][j].nomer], 0, 0, SIZE_TILES, SIZE_TILES, i * SIZE_TILES, j * SIZE_TILES, SIZE_TILES, SIZE_TILES);
                }
        for (let i = 0; i < model.tekFig.number; i++) {
            this.ctx.drawImage(this.imgKv[model.tekFig.viewElement[i]], 0, 0, SIZE_TILES, SIZE_TILES, (model.tekFig.сoordinates[model.tekFig.rotate][i][0] * SIZE_TILES) + controller.x, (model.tekFig.сoordinates[model.tekFig.rotate][i][1] * SIZE_TILES) + controller.y, SIZE_TILES, SIZE_TILES);
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
    tick() {
        let startY = this.y;

        if (!this.downPressed) {
            this.y += STEP_MOVEMENT_AUTO;
        }
        else {
            this.y += STEP_MOVEMENT_KEYPRESS;
        }

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


        if (this.collission.call(this, this.x, this.y) == true) {
            for (let i = 0; i < model.tekFig.number; i++) {
                model.map[Math.floor(this.x / SIZE_TILES) + model.tekFig.сoordinates[model.tekFig.rotate][i][0]][Math.floor(this.y / SIZE_TILES) + model.tekFig.сoordinates[model.tekFig.rotate][i][1]] = { elements: "Block", nomer: model.tekFig.viewElement[i], fon: model.map[Math.floor(this.x / SIZE_TILES) + model.tekFig.сoordinates[model.tekFig.rotate][i][0]][Math.floor(this.y / SIZE_TILES) + model.tekFig.сoordinates[model.tekFig.rotate][i][1]] };
                
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

        for (let i = 0; i < model.tekFig.number; i++) {
            if (x + (model.tekFig.сoordinates[model.tekFig.rotate][i][0] * SIZE_TILES) < 0) return true;
            if (x + (model.tekFig.сoordinates[model.tekFig.rotate][i][0] * SIZE_TILES) > view.canvas.width - SIZE_TILES) return true;

            if (y + (model.tekFig.сoordinates[model.tekFig.rotate][i][1] * SIZE_TILES) > view.canvas.height - SIZE_TILES) return true;

            if (typeof (model.map[Math.floor((x + model.tekFig.сoordinates[model.tekFig.rotate][i][0] * SIZE_TILES) / SIZE_TILES)][Math.floor((y + model.tekFig.сoordinates[model.tekFig.rotate][i][1] * SIZE_TILES + SIZE_TILES) / SIZE_TILES)]) !== "number")
                return true;
            
            if (typeof (model.map[Math.floor((x + model.tekFig.сoordinates[model.tekFig.rotate][i][0] * SIZE_TILES) / SIZE_TILES)][Math.floor((y + model.tekFig.сoordinates[model.tekFig.rotate][i][1] * SIZE_TILES + SIZE_TILES) / SIZE_TILES) - 1]) !== "number" &&
                ((y + model.tekFig.сoordinates[model.tekFig.rotate][i][1] * SIZE_TILES + SIZE_TILES) % SIZE_TILES) <= SIZE_TILES - STEP_MOVEMENT_AUTO-1)
                return true;
        }
        return false;
    },
    init() {
        //Задаем начальное значение падения
        this.y = 0;
        let width = model.tekFig.сoordinates[model.tekFig.rotate][0][0];
        for (let i = 1; i < model.tekFig.сoordinates[model.tekFig.rotate].length; i++) {
            if (model.tekFig.сoordinates[model.tekFig.rotate][i][0] > width)
                width = model.tekFig.сoordinates[model.tekFig.rotate][i][0];
        }
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






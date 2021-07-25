const SIZE_TILES = 30;//Размер в пикселях элемента
const NUMBER_BACKGROUND_ELEMENTS = 16;//Количество элементов фона
const UPDATE_TIME = 100;//Время в милисекундах одного движения
const STEP_MOVEMENT_AUTO = 10;//Шаг движения блоков
const STEP_MOVEMENT_KEYPRESS = 30;//Шаг движения блоков
const NUMBER_FIGURE_ELEMENTS = 4;// Количество элементов фигур
const NUMBER_PERSONNAL = 10;
// Придумать более легкое обозначение фигур
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
    tekFig: {},
    //Следующая фигура
    nextFig: {},
    //ID строки для выводла рекорда
    txtRecord: {},
    //Объект жука, с его координатами, направлением движения и кадром движения
    beetle: { x: 0, y: 0, tX: 0, tY: 0, trafficX: "L", trafficY: "0", numberAnimation: 0 },
    //Функция для определения направления движения жука по горизонтали
    getTrafficBeetle() {

        function isCanNapr(napr) {
            const Y = model.beetle.tY;
            const X = model.beetle.tX;
            const mY = model.fieldHeight;
            const mX = model.fieldWidth;

            switch (napr.x+napr.y) {
                case "L0"://Проверяем возможность пойти влево
                    if (X == 0) return false; //Если Жук находиться в крайней левой точке
                    if (model.fieldBlocks[Y][X - 1] != 0) return false; //Если слева препятствие
                    //if (Y + 1 < mY && model.fieldBlocks[Y+1][X-1] == 0) return false; //Если Жук не на дне стакана то проверить есть ли слева снизу блок
                    break;
                case "R0":
                    if (X+1 == mX) return false; //Если Жук находиться в крайней правой точке
                    if (model.fieldBlocks[Y][X + 1] != 0) return false; //Если справа препятствие
                   // if (Y + 1 < mY && model.fieldBlocks[Y + 1][X + 1]== 0) return false; //Если Жук не на дне стакана то проверить есть ли справа снизу блок
                    break;
                case "RD":
                case "LD"://Проверяем возможность пойти вниз
                    if (Y + 1 == mY) return false; //Если Жук находиться на дне стакана
                    if (model.fieldBlocks[Y+1][X] != 0) return false; //Если внизу есть препятствие
                    break;
                case "RU":
                case "LU"://Проверяем возможность пойти верх
                    if (Y - 1 <0) return false; //Если Жук находиться на верху стакана
                    if (model.fieldBlocks[Y - 1][X] != 0) return false; //Если сверху есть препятствие
                    switch (napr.x) {
                        case "L":
                            if (X == 0) return false; //Если Жук находиться в крайней левой точке
                            if (model.fieldBlocks[Y - 1][X - 1] != 0) return false; //Если сверху слева есть препятствие
                            if (model.fieldBlocks[Y][X - 1] == 0) return false; //Проверить есть ли слева снизу блок
                            break;
                        case "R":
                            if (X + 1 == mX) return false; //Если Жук находиться в крайней правой точке
                            if (model.fieldBlocks[Y - 1][X + 1] != 0) return false; //Если сверху справа есть препятствие
                            if ( model.fieldBlocks[Y][X + 1] == 0) return false; //Если Жук не на дне стакана то проверить есть ли справа снизу блок
                            break;
                    }
                    break;
                case "RUU":
                case "LUU"://Проверяем возможность пойти верх верх
                    if (Y - 2 < 0) return false; //Если Жук находиться на верху стакана
                    if (model.fieldBlocks[Y - 1][X] != 0) return false; //Если сверху есть препятствие
                    if (model.fieldBlocks[Y - 2][X] != 0) return false; //Если сверху есть препятствие
                    switch (napr.x) {
                        case "L":
                            if (X == 0) return false; //Если Жук находиться в крайней левой точке
                            if (model.fieldBlocks[Y - 2][X - 1] != 0) return false; //Если сверху слева есть препятствие
                            if (Y -1  < mY && model.fieldBlocks[Y-1][X - 1] == 0) return false; //Если Жук не на дне стакана то проверить есть ли слева снизу блок
                            break;
                        case "R":
                            if (X + 1 == mX) return false; //Если Жук находиться в крайней правой точке
                            if (model.fieldBlocks[Y - 2][X + 1] != 0) return false; //Если сверху справа есть препятствие
                            if (Y - 1 < mY && model.fieldBlocks[Y - 1][X + 1] == 0) return false; //Если Жук не на дне стакана то проверить есть ли слева снизу блок
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
            //Починить движение запрыгивания когда исчезает ряд
            ["L0"]: [{ x: "L", y: "D" }, { x: "L", y: "0" }, { x: "L", y: "U" }, { x: "L", y: "UU" }, { x: "R", y: "0" }, { x: "R", y: "U" }, { x: "R", y: "UU" }],
            ["R0"]: [{ x: "R", y: "D" }, { x: "R", y: "0" }, { x: "R", y: "U" }, { x: "R", y: "UU" }, { x: "L", y: "0" }, { x: "L", y: "U" }, { x: "L", y: "UU" }],
            ["LD"]: [{ x: "L", y: "D" }, { x: "L", y: "0" }, { x: "R", y: "0" }, { x: "L", y: "U" }, { x: "L", y: "UU" }, { x: "R", y: "U" }, { x: "R", y: "UU" }],
            ["RD"]: [{ x: "R", y: "D" }, { x: "R", y: "0" }, { x: "L", y: "0" }, { x: "R", y: "U" }, { x: "R", y: "UU" }, { x: "L", y: "U" }, { x: "L", y: "UU" }],

            ["LU"]: [{ x: "L", y: "0" }, { x: "R", y: "0" }, { x: "L", y: "U" }, { x: "R", y: "U" }, { x: "L", y: "D" }],
            ["RU"]: [{ x: "R", y: "0" }, { x: "L", y: "0" }, { x: "R", y: "U" }, { x: "L", y: "U" }, { x: "R", y: "D" }],

            ["LUU"]: [{ x: "L", y: "U" }, { x: "R", y: "U" },{ x: "L", y: "0" }, { x: "R", y: "0" }, { x: "L", y: "D" }],
            ["RUU"]: [{ x: "R", y: "U" }, { x: "L", y: "U" }, { x: "R", y: "0" }, { x: "L", y: "0" }, { x: "R", y: "D" }],
            
            ["00"]: [{ x: "L", y: "D" }, { x: "L", y: "0" }, { x: "L", y: "U" }, { x: "L", y: "UU" }, { x: "R", y: "0" }, { x: "R", y: "U" }, { x: "R", y: "UU" }],
        };
        //Иногда жук заходит внутрь блока найти причину, заметил при падении бывает движение в блок
        console.log("Движение в направлении model.beetle.trafficX= ", this.beetle.trafficX);
        console.log("Движение в направлении model.beetle.trafficY= ", this.beetle.trafficY);

        let lengthArray = naprDvig[this.beetle.trafficX + this.beetle.trafficY].length;
        for (let i = 0; i < lengthArray; i++) {
            let napr = naprDvig[this.beetle.trafficX + this.beetle.trafficY].shift()
            if (isCanNapr(napr)) {
                console.log("Движение возможно в направлении x= ", napr.x, " y= ", napr.y);
                this.beetle.trafficX = napr.x;
                this.beetle.trafficY = napr.y;
                return;
            }
        }
        this.beetle.trafficX = "0";
        this.beetle.trafficY = "0";

        /*


        //Продолжаем движение в заданном направлении или шанс 1 из 10 что изменяем его на противоположноеж
        let traffic = Math.floor(Math.random() * 10);
        if (traffic == 0)
            return "L"
        else if (traffic == 1)
            return "R"
        else
            //if (this.beetle.trafficX != undefined)
            return this.beetle.trafficX;
        //else
        //return getTrafficBeetle();*/



    },
    //Метод движения жука
    beetleAnimation() {
        function examCoor(value) {//Проверка перехода за край клетки
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
                        this.beetle.y -= SIZE_TILES / NUMBER_PERSONNAL;
                        break;
                    case "D":
                        this.beetle.y += SIZE_TILES / NUMBER_PERSONNAL;
                        break;
                }
                [this.beetle.y, this.beetle.tY] = examCoor({ coor: this.beetle.y, coorTiles: this.beetle.tY });
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
                            this.beetle.x -= SIZE_TILES / NUMBER_PERSONNAL;
                            break;
                        case "R":
                            this.beetle.x += SIZE_TILES / NUMBER_PERSONNAL;
                            break;
                    }
                    [this.beetle.x, this.beetle.tX] = examCoor({ coor: this.beetle.x, coorTiles: this.beetle.tX });
                    break;
                case "0":
                    break;
                default:
                    console.log("Ошибка в блоке switch model.beetle.trafficX= ", this.beetle.trafficX);
            }
    },
    //Метод формирования текущей фигуры
    formTekFigure() {
        function formFigure() {
            let numberTekFig = Math.floor(Math.random() * FIGURE.length);
            return {
                ...FIGURE[numberTekFig],
                rotate: 0,
                viewElement: Array.from({ length: FIGURE[numberTekFig][0].length }).map(() => Math.floor(Math.random() * NUMBER_FIGURE_ELEMENTS) + 1)
            }
        };

        if (Object.keys(this.tekFig).length == 0) {
            this.nextFig = formFigure();
        }
        this.tekFig = { ...this.nextFig };
        this.nextFig = formFigure();
        controller.init();
    },
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
        this.formTekFigure();
        this.beetle.tX = Math.floor(Math.random() * this.fieldWidth);
        this.beetle.tY = (this.fieldHeight) - 1;
        this.beetle.x = 0;
        this.beetle.y = 0;
        //Установить случайное движение
        this.beetle.trafficX = "L";
        this.beetle.trafficY = "0";
        this.getTrafficBeetle();
        this.beetle.numberAnimation = 0;
        this.record = localStorage.getItem('Record');
        this.txtRecord = document.getElementById('record');
        this.txtRecord.innerHTML = String(this.record).padStart(6, "0");
    },
    //Удаление строки
    deleteRow() {
        this.fieldBlocks.forEach((y) => {
            if (y.every((x) => x !== 0)) {
                for (let i = this.fieldBlocks.indexOf(y); i > 0; i--)
                    for (let j = 0; j < this.fieldWidth; j++)
                        this.fieldBlocks[i][j] = this.fieldBlocks[i - 1][j];
                this.scores += 100;
            }
        })
    }
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

        this.imgBeetle.src = 'Beetle.png';
    },
    drawNextFigure() {
        this.ctxNextFigure.clearRect(0, 0, this.canvasNextFigure.width, this.canvasNextFigure.height);
        for (let i = 0; i < model.nextFig[model.nextFig.rotate].length; i++) {
            this.ctxNextFigure.drawImage(this.imgKv[model.nextFig.viewElement[i] - 1], 0, 0, SIZE_TILES, SIZE_TILES, (model.nextFig[model.nextFig.rotate][i][0] * SIZE_TILES), (model.nextFig[model.nextFig.rotate][i][1] * SIZE_TILES), SIZE_TILES, SIZE_TILES);
        }
    }
    ,
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

        if (model.beetle.trafficY == "0" || (model.beetle.numberAnimation % 2 == 0 && model.beetle.trafficY != "U" && model.beetle.trafficY != "UU"))
            this.ctx.drawImage(this.imgBeetle, 0, 0, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);
        else if (model.beetle.trafficX == "L" && model.beetle.trafficY == "0")
            this.ctx.drawImage(this.imgBeetle, 30, 0, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);
        else if (model.beetle.trafficX == "R" && model.beetle.trafficY == "0")
            this.ctx.drawImage(this.imgBeetle, 60, 0, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);
        else if (model.beetle.trafficX == "R" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
            this.ctx.drawImage(this.imgBeetle, 0, 60, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);
        else if (model.beetle.trafficX == "L" && (model.beetle.trafficY == "U" || model.beetle.trafficY == "UU"))
            this.ctx.drawImage(this.imgBeetle, 0, 30, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);
        else
            this.ctx.drawImage(this.imgBeetle, 90, 0, SIZE_TILES, SIZE_TILES, model.beetle.tX * SIZE_TILES + model.beetle.x, model.beetle.tY * SIZE_TILES + model.beetle.y, SIZE_TILES, SIZE_TILES);


        this.txtScores.innerHTML = String(model.scores).padStart(6, "0");
        view.drawNextFigure();
    }
};
let controller = {
    x: 0,
    y: 0,
    rightPressed: false,
    leftPressed: false,
    upPressed: false,
    downPressed: false,
    get_tX: (x) => Math.ceil(x / SIZE_TILES),
    get_tY: (y) => Math.ceil(y / SIZE_TILES),
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

        //!!!не дает застрять палке верху и проиграть
        // Проверить иногда палка застревает в верху стакана
        if (this.collission.call(this, this.x, this.y) == true) {
            for (let i = 0; i < model.tekFig[model.tekFig.rotate].length; i++) {
                let tX = this.get_tX(this.x) + model.tekFig[model.tekFig.rotate][i][0];
                let tY = this.get_tY(this.y) + model.tekFig[model.tekFig.rotate][i][1];
                model.fieldBlocks[tY - 1][tX] = model.tekFig.viewElement[i];
            }
            model.deleteRow();
            model.formTekFigure();
            this.y = 0;
        }
        else
            if ((startY == 0 && this.y == 0) || model.fieldBlocks[model.beetle.tY][model.beetle.tX] != 0) {
                console.log("!!!Вы проиграли!!!");

                //Для отладки
                console.log("Последнее движение было в направлении model.beetle.trafficX= ", model.beetle.trafficX);
                console.log("Последнее движение было в направлении model.beetle.trafficY= ", model.beetle.trafficY);

                localStorage.setItem('Record', model.scores);
                alert("Вы проиграли");
                model.init();
            }
        model.beetleAnimation();
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
        controller.rightPressed = false;
        controller.upPressed = false;
        controller.leftPressed = false;
        controller.downPressed = false;
        let width = model.tekFig[model.tekFig.rotate].reduce((max, coor) => coor[0] > max[0] ? max[0] : coor[0]);
        this.x = Math.floor(Math.random() * (model.fieldWidth-1 - width)) * SIZE_TILES;
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






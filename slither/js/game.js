import { Food } from './food.js';
import { Snake } from './snake.js';

const names = ["Ahmed Steinke", "NamZ Bede"];

class Game {
    constructor() {
        this.game_W = 0;
        this.game_H = 0;

        this.bg_im = new Image();
        this.bg_im.src = "images/Map2.png";
        this.SPEED = 1;
        this.MaxSpeed = 5;
        this.chX = 0;
        this.chY = 0;
        this.mySnake = [];
        this.FOOD = [];
        this.NFood = 2000;
        this.Nsnake = 20;
        this.sizeMap = 2000;
        this.index = 0;
        this.minScore = 200;
        this.die = false;

        this.Xfocus = 0;
        this.Yfocus = 0;
        this.XX = 0;
        this.YY = 0;

        this.init();
    }

    init() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);

        this.render();

        for (let i = 0; i < this.Nsnake; i++) {
            this.mySnake[i] = new Snake(
                names[Math.floor(Math.random() * 99999) % names.length],
                this,
                Math.floor(2 * this.minScore + Math.random() * 2 * this.minScore),
                (Math.random() - Math.random()) * this.sizeMap,
                (Math.random() - Math.random()) * this.sizeMap
            );
        }

        this.mySnake[0] = new Snake("HaiZuka", this, this.minScore, this.game_W / 2, this.game_H / 2);
        for (let i = 0; i < this.NFood; i++) {
            this.FOOD[i] = new Food(this, this.getSize() / (7 + Math.random() * 10), (Math.random() - Math.random()) * this.sizeMap, (Math.random() - Math.random()) * this.sizeMap);
        }

        this.loop();
        this.listenMouse();
        this.listenTouch();
    }

    listenTouch() {
        document.addEventListener("touchmove", evt => {
            var y = evt.touches[0].pageY;
            var x = evt.touches[0].pageX;
            let targetX = (x - this.game_W / 2) / 15;
            let targetY = (y - this.game_H / 2) / 15;
            this.chX = targetX;
            this.chY = targetY;
        });

        document.addEventListener("touchstart", () => {
            this.mySnake[0].speed = 2;
        });

        document.addEventListener("touchend", () => {
            this.mySnake[0].speed = 1;
        });
    }

    listenMouse() {
        document.addEventListener("mousedown", () => {
            this.mySnake[0].speed = 2;
        });

        document.addEventListener("mousemove", evt => {
            var x = evt.offsetX === undefined ? evt.layerX : evt.offsetX;
            var y = evt.offsetY === undefined ? evt.layerY : evt.offsetY;
            let targetX = (x - this.game_W / 2) / 15;
            let targetY = (y - this.game_H / 2) / 15;
            this.chX = targetX;
            this.chY = targetY;
        });

        document.addEventListener("mouseup", () => {
            this.mySnake[0].speed = 1;
        });
    }

    loop() {
        if (this.die) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
    updateCamera() {
    if (this.mySnake.length > 0) {
        let headX = this.mySnake[0].v[0].x;
        let headY = this.mySnake[0].v[0].y;

        // Smooth camera movement
        this.XX += (headX - this.XX - this.game_W / 2) * 0.1;
        this.YY += (headY - this.YY - this.game_H / 2) * 0.1;
    }
}

    update() {
         this.updateCamera();
        this.render();
        this.unFood();
        this.changeFood();
        this.changeSnake();
        this.updateChXY();
        this.checkDie();
    }

    updateChXY() {}

    changeFood() {
        for (let i = 0; i < this.FOOD.length; i++) {
            if (this.range(this.mySnake[0].v[0].x, this.mySnake[0].v[0].y, this.FOOD[i].x, this.FOOD[i].y) > this.sizeMap) {
                this.FOOD[i] = new Food(
                    this,
                    this.getSize() / (10 + Math.random() * 10),
                    (Math.random() - Math.random()) * this.sizeMap + this.mySnake[0].v[0].x,
                    (Math.random() - Math.random()) * this.sizeMap + this.mySnake[0].v[0].y
                );
            }
        }
    }

    changeSnake() {
        for (let i = 0; i < this.mySnake.length; i++) {
            if (this.range(this.mySnake[0].v[0].x, this.mySnake[0].v[0].y, this.mySnake[i].v[0].x, this.mySnake[i].v[0].y) > this.sizeMap) {
                this.mySnake[i].v[0].x = (this.mySnake[0].v[0].x + this.mySnake[i].v[0].x) / 2;
                this.mySnake[i].v[0].y = (this.mySnake[0].v[0].y + this.mySnake[i].v[0].y) / 2;
            }
        }
    }

    unFood() {
        if (this.mySnake.length <= 0) return;

        for (let i = 0; i < this.mySnake.length; i++) {
            let head = this.mySnake[i].v[0];
            let snakeSize = this.mySnake[i].size;

            for (let j = 0; j < this.FOOD.length; j++) {
                let food = this.FOOD[j];
                if (this.range(head.x, head.y, food.x, food.y) < 1.5 * snakeSize) {
                    this.mySnake[i].score += Math.floor(food.value);
                    this.FOOD[j] = new Food(
                        this,
                        this.getSize() / (5 + Math.random() * 10),
                        (Math.random() - Math.random()) * 5000 + this.XX,
                        (Math.random() - Math.random()) * 5000 + this.YY
                    );
                }
            }
        }
    }

    checkDie() {
        for (let i = 0; i < this.mySnake.length; i++) {
            for (let j = 0; j < this.mySnake.length; j++) {
                if (i !== j) {
                    let head = this.mySnake[i].v[0];
                    let otherSnake = this.mySnake[j];
                    for (let k = 0; k < otherSnake.v.length; k++) {
                        let segment = otherSnake.v[k];
                        if (this.range(head.x, head.y, segment.x, segment.y) < this.mySnake[i].size) {
                            for (let m = 0; m < this.mySnake[i].v.length; m += 5) {
                                this.FOOD[this.index] = new Food(
                                    this,
                                    this.getSize() / (2 + Math.random() * 2),
                                    this.mySnake[i].v[m].x + Math.random() * this.mySnake[i].size / 2,
                                    this.mySnake[i].v[m].y + Math.random() * this.mySnake[i].size / 2
                                );
                                this.FOOD[this.index++].value = 0.4 * this.mySnake[i].score / (this.mySnake[i].v.length / 5);
                                if (this.index >= this.FOOD.length) this.index = 0;
                            }
                            if (i !== 0) {
                                this.mySnake[i] = new Snake(
                                    names[Math.floor(Math.random() * 99999) % names.length],
                                    this,
                                    Math.max(Math.floor((this.mySnake[0].score > 10 * this.minScore) ? this.mySnake[0].score / 10 : this.minScore), this.mySnake[i].score / 10),
                                    this.randomXY(this.XX),
                                    this.randomXY(this.YY)
                                );
                            } else {
                                window.alert("Your Score: " + Math.floor(this.mySnake[i].score));
                                this.die = true;
                                window.location.href = ".";
                            }
                        }
                    }
                }
            }
        }
    }

    render() {
        if (this.canvas.width !== document.documentElement.clientWidth || this.canvas.height !== document.documentElement.clientHeight) {
            this.canvas.width = document.documentElement.clientWidth;
            this.canvas.height = document.documentElement.clientHeight;
            this.game_W = this.canvas.width;
            this.game_H = this.canvas.height;
            this.SPEED = this.getSize() / 7;
            this.SPEED = 1;
            this.MaxSpeed = this.getSize() / 7;
            if (this.mySnake.length === 0) return;
            if (this.mySnake[0].v !== null) {
                this.mySnake[0].v[0].x = this.XX + this.game_W / 2;
                this.mySnake[0].v[0].y = this.YY + this.game_H / 2;
            }
        }
    }

    draw() {
        this.clearScreen();
        for (let i = 0; i < this.FOOD.length; i++) this.FOOD[i].draw(this.XX, this.YY);
        for (let i = 0; i < this.mySnake.length; i++) {
            if (typeof this.mySnake[i].draw === "function") {
                this.mySnake[i].draw();
            } else {
                console.error(`mySnake[${i}] does not have a draw function`, this.mySnake[i]);
            }
        }
    }

    clearScreen() {
        this.context.clearRect(0, 0, this.game_W, this.game_H);
        this.context.drawImage(this.bg_im, this.Xfocus, this.Yfocus, 1.5 * this.game_W, 1.5 * this.game_H, 0, 0, this.game_W, this.game_H);
    }

    getSize() {
        var area = this.game_W * this.game_H;
        return Math.sqrt(area / 300);
    }

    range(a, b, c, d) {
        return Math.sqrt((a - c) * (a - c) + (b - d) * (b - d));
    }

    randomXY(n) {
        let ans = 0;
        while (Math.abs(ans) < 1) {
            ans = 3 * Math.random() - 3 * Math.random();
        }
        return ans * this.sizeMap + n;
    }

    isPoint(x, y) {
        if (x - this.XX < -3 * this.getSize()) return false;
        if (y - this.YY < -3 * this.getSize()) return false;
        if (x - this.XX > this.game_W + 3 * this.getSize()) return false;
        if (y - this.YY > this.game_H + 3 * this.getSize()) return false;
        return true;
    }
}

var g = new Game();

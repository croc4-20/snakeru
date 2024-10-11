let Nball = 13;

export class Snake {
    constructor(name, game, score, x, y) {
        this.name = name;
        this.game = game;
        this.score = score;
        this.x = x;
        this.y = y;
        this.init();
    }

    init() {
        this.time = Math.floor(20 + Math.random() * 100);
        this.speed = 1;
        this.size = this.game.getSize() * 1;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = this.game.MaxSpeed;  // Access MaxSpeed from the Game instance
        this.turnSpeed = 0.05;

        this.v = [];
        for (let i = 0; i < 50; i++) {
            this.v[i] = { x: this.x, y: this.y };
        }

        this.sn_im = new Image();
        this.sn_im.src = "images/head001.png";
        this.bd_im = new Image();
        this.bd_im.src = "images/body/" + Math.floor(Math.random() * 999999) % Nball + ".png";
    }

    update() {
    this.time--;
    let targetAngle;
    
    // If the snake is controlled by the player
    if (this.name === "HaiZuka") {
        targetAngle = Math.atan2(this.game.chY, this.game.chX);
    } else {
        // AI snake logic for other snakes
        if (this.time <= 0) {
            this.time = Math.floor(10 + Math.random() * 20);
            let dx = Math.random() * this.maxSpeed - Math.random() * this.maxSpeed;
            let dy = Math.random() * this.maxSpeed - Math.random() * this.maxSpeed;

            let minRange = Infinity;
            for (let i = 0; i < this.game.FOOD.length; i++) {
                if (this.game.FOOD[i].size > this.game.getSize() / 10) {
                    let dist = this.range(this.v[0], this.game.FOOD[i]);
                    if (dist < minRange) {
                        minRange = dist;
                        dx = this.game.FOOD[i].x - this.v[0].x;
                        dy = this.game.FOOD[i].y - this.v[0].y;
                    }
                }
            }
            let magnitude = Math.sqrt(dx * dx + dy * dy);
            this.acceleration.x = (dx / magnitude) * 0.1;
            this.acceleration.y = (dy / magnitude) * 0.1;
        }
        this.score += this.score / 666;
    }

    // Smooth out turning (to avoid over-restricting turns)
    let desiredAngle = targetAngle !== undefined ? targetAngle : Math.atan2(this.velocity.y, this.velocity.x);
    let angleDifference = this.normalizeAngle(desiredAngle - this.angle);
    angleDifference = Math.max(-this.turnSpeed, Math.min(this.turnSpeed, angleDifference));
    this.angle += angleDifference;

    // Apply acceleration to velocity
    this.acceleration.x = Math.cos(this.angle) * 0.1;
    this.acceleration.y = Math.sin(this.angle) * 0.1;

    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // Ensure speed limit
    let speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    let maxSpeed = this.maxSpeed * this.speed;  // maxSpeed depends on whether speed is 1 or 2
    if (speed > maxSpeed) {
        this.velocity.x *= maxSpeed / speed;
        this.velocity.y *= maxSpeed / speed;
    }

    // Update snake's head position
    this.v[0].x += this.velocity.x;
    this.v[0].y += this.velocity.y;

    // Make sure the snake's body follows its head
    for (let i = 1; i < this.v.length; i++) {
        let dx = this.v[i - 1].x - this.v[i].x;
        let dy = this.v[i - 1].y - this.v[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.size / 5) {
            let angle = Math.atan2(dy, dx);
            this.v[i].x = this.v[i - 1].x - Math.cos(angle) * this.size / 5;
            this.v[i].y = this.v[i - 1].y - Math.sin(angle) * this.size / 5;
        }
    }

    if (this.score < 200) return;

    // Adjust snake size as it grows
    let csUp = Math.pow(this.score / 1000, 1 / 5);
    this.size = this.game.getSize() / 2 * csUp;
    let N = 3 * Math.floor(50 * Math.pow(this.score / 1000, 1));
    if (N > this.v.length) {
        this.v.push({ x: this.v[this.v.length - 1].x, y: this.v[this.v.length - 1].y });
    } else {
        this.v = this.v.slice(0, N);
    }
}

    draw() {
        this.update();

        for (let i = this.v.length - 1; i >= 1; i--) {
            if (this.game.isPoint(this.v[i].x, this.v[i].y)) {
                this.game.context.drawImage(this.bd_im, this.v[i].x - this.game.XX - (this.size) / 2, this.v[i].y - this.game.YY - (this.size) / 2, this.size, this.size);
            }
        }

        this.game.context.save();
        this.game.context.translate(this.v[0].x - this.game.XX, this.v[0].y - this.game.YY);
        this.game.context.rotate(this.angle - Math.PI / 2);
        this.game.context.drawImage(this.sn_im, -this.size / 2, -this.size / 2, this.size, this.size);
        this.game.context.restore();
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    range(v1, v2) {
        return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
    }
}

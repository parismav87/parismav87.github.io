class Bird {

    constructor() {
        this.x = 30;
        this.y = height / 2;
        this.d = 30;
        this.r = this.d / 2;
        this.velocity = 0;
        this.gravity = 1;
        this.antiGravity = 15;
        this.dead = false;
    }

    show() {
        fill(255, 255, 50);
        stroke(0);
        strokeWeight(3);
        ellipse(this.x, this.y, this.d, this.d);
    }

    update() {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;
    }

    jump() {
        this.velocity -= this.antiGravity;
    }

    checkBorder() {
        if (this.y > height - 32) {
            bird.dead = true;
            this.y = height - 32;
        } else if (this.y < 0) {
            this.y = 0;
        }
    }
}
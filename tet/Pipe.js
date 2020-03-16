class Pipe {

    constructor() {
        this.spacing = 140;
        this.x = width - 50;
        this.yUP = random(150, height - (this.spacing * 2));
        this.yDW = this.yUP + this.spacing;
        this.w = 32;
        this.speed = 5;
    }

    show() {
        stroke(0);
        strokeWeight(3);
        fill(0, 255, 0);
        rect(this.x, 0, this.w, this.yUP);
        rect(this.x, this.yDW, this.w, height);
    }

    update() {
        this.x -= this.speed;
    }

    checkBorder() {
        return this.x < 0;
    }

    hit(bird) {
        if (bird.y - bird.r < this.yUP || bird.y + bird.r > this.yDW) {
            if (bird.x == this.x || bird.x == this.x + this.w) {
                return true;
            }
        }

        return false;
    }

    scored(bird){
        return bird.x == this.x && !bird.dead;
    }
}
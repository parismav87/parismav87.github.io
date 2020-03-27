class Bird {

    constructor() {
        this.x = 300;
        this.y = height / 2;
        this.d = 30;
        this.r = this.d / 2;
        this.velocity = 0;
        this.gravity = .75;
        this.antiGravity = 15;
        //this.dead = false;
        this.dead = 'notStarted'; //notStarted, yes, no
    }



    update() {
        this.velocity += this.gravity;
        this.velocity *= 0.9;
        this.y += this.velocity;
    }

    jump() {
        this.velocity -= this.antiGravity;
    }

    show() {
        //text("Velocity" + this.velocity, width/2, height/2);
        if (this.velocity > 0){
            fill(50,255,255);
        } else if (this.velocity <= 0){
            fill(255,50,50)
        }

        stroke(0);
        strokeWeight(3);
        ellipse(this.x, this.y, this.d, this.d);
    }

    checkBorder() {
        if (this.y > height - 32) {
            bird.dead = 'yes';
            this.y = height - 32;
        } else if (this.y < 0) {
            this.y = 0;
            bird.dead = 'yes';
        }
    }
}
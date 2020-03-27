BIRD_VELOCITY = 0;
BIRD_GRAVITY = .25;
BIRD_ANTIGRAVITY = -7;
BIRD_ROTATION_DROP = 0.15;
BIRD_ROTATION_JUMP = -4.2;
GROUND_Y = window.innerHeight-100
PIPE_VELOCITY = -6
IS_DEAD = false
PIPE_GAP_MIN = 0
PIPE_GAP_MAX = 50



function preload() {
  pipeImg = loadImage('pipe.png');
  birdImg = loadImage('bird.png');
}


function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pipes = new Group();
  bird = createSprite(100,300,50,50)
  bird.addImage(birdImg)
  bird.scale = 0.05
  bird.addImage(birdImg);
  bird.setCollider("circle")
}




function draw() {
  
  background(135,206,235);
  let c = color(255, 204, 0);
  fill(c);
  noStroke();
  rect(0, GROUND_Y, window.innerWidth, 100)

  noStroke();
  fill(0);
  textAlign(CENTER);
  textSize(32);

  bird.velocity.y += BIRD_GRAVITY
  if(bird.position.y<0){
    bird.position.y = 0;
  } else if(bird.position.y>GROUND_Y){
    bird.position.y = GROUND_Y
  }

  bird.rotationSpeed += BIRD_ROTATION_DROP
  if(bird.rotation>65){
    bird.rotation = 65
  } else if (bird.rotation < -65){
    bird.rotation = -65
  }


  if(frameCount % 60 == 0 && !IS_DEAD){
    gap = random(PIPE_GAP_MIN, PIPE_GAP_MAX)
    pipeX = window.innerWidth

    bottomPipe = createSprite(pipeX, GROUND_Y-200, 50, 500)
    bottomPipe.width = 50
    bottomPipe.addImage(pipeImg)
    bottomPipe.scale = 0.4
    bottomPipe.velocity.x = PIPE_VELOCITY

    topPipe = createSprite(pipeX, 0, 100, 100)
    topPipe.addImage(pipeImg)
    topPipe.mirrorY(-1)
    topPipe.scale = 0.3
    topPipe.velocity.x = PIPE_VELOCITY

    pipes.add(bottomPipe)
    pipes.add(topPipe)
  }

  for(p of pipes){
    if(p.overlap(bird)){
      die()
    }
  }
      
  drawSprites()
  
}

function mousePressed() {
  if(!IS_DEAD){
    bird.velocity.y = BIRD_ANTIGRAVITY;
    bird.rotationSpeed = BIRD_ROTATION_JUMP
  }  
}

function die(){
  IS_DEAD = true
  bird.velocity.y = 0
  bird.rotationSpeed = 0
  for(p of pipes){
    p.velocity.x =0
  }
}



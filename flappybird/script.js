SCREEN_HEIGHT = window.innerHeight
BIRD_VELOCITY = 0;
BIRD_GRAVITY = .25;
BIRD_ANTIGRAVITY = -7;
BIRD_ROTATION_DROP = 0.15;
BIRD_ROTATION_JUMP = -4.2;
GROUND_Y = SCREEN_HEIGHT-(SCREEN_HEIGHT/10)
PIPE_VELOCITY = -6
IS_DEAD = false
PIPE_BODY_HEIGHT = 70
PIPE_GAP_MIN = 1
PIPE_GAP_MAX = 5
PIPE_BOTTOM_MIN = GROUND_Y -100
SCALE = 0.5




function preload() {
  pipeBodyImg = loadImage('pipe_1.png');
  pipeHeadImg = loadImage('pipe_2.png');
  birdImg = loadImage('bird.png');
  myFont = loadFont('8bit.TTF');
}


function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pipes = new Group();
  scorePipes = new Group(); //separate group for score keeping
  bird = createSprite(100,300,50,50)
  bird.addImage(birdImg)
  bird.scale = 0.05
  bird.addImage(birdImg);
  bird.setCollider("circle")
  MAX_NUMBER_BODIES = int(SCREEN_HEIGHT/(PIPE_BODY_HEIGHT*SCALE))-3 // leave at least 3x pipe body height as gap
  score = 0
}




function draw() {
  
  background(135,206,235);
  let c = color(255, 204, 0);
  fill(c);
  noStroke();
  rect(0, GROUND_Y, window.innerWidth, SCREEN_HEIGHT/10)

  

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


  if(frameCount % 80 == 0 && !IS_DEAD){

    gap = int(random(PIPE_GAP_MIN, PIPE_GAP_MAX))

    //bottom pipes
    bottomBodies = int(random(PIPE_GAP_MAX, MAX_NUMBER_BODIES)) - gap
    for(var i=0; i<bottomBodies; i++){
      p = createSprite(window.innerWidth, GROUND_Y - (i * PIPE_BODY_HEIGHT * SCALE), 100, 70)
      if(i == bottomBodies -1){
        p.addImage(pipeHeadImg)
      } else{
        p.addImage(pipeBodyImg)
      }
      p.velocity.x = -5
      p.scale = 0.5
      pipes.add(p)
      if(i==0){
        scorePipes.add(p)
      }
    }

    //top pipes
    topBodies = MAX_NUMBER_BODIES - bottomBodies - gap
    for(var i=0; i<topBodies; i++){
      p = createSprite(window.innerWidth, 0 + (i * PIPE_BODY_HEIGHT * SCALE), 100, 70)
      if(i == topBodies -1){
        p.addImage(pipeHeadImg)
        p.mirrorY(-1)
      } else{
        p.addImage(pipeBodyImg)
      }
      p.velocity.x = -5
      p.scale = 0.5
      pipes.add(p)
    }



  }
  removed = false
  for(p of pipes){
    // console.log(p.position.x)
    if(p.overlap(bird)){
      die()
    }
    if(p.position.x < -100){
      p.remove()
    }
  }
  for (s of scorePipes){
    if(s.position.x<100){
      score += 1;
      scorePipes.remove(s)
    }
  }

      
  drawSprites()


  noStroke();
  fill(255);
  textFont(myFont)
  textAlign(CENTER);
  textSize(32);
  text(score, 50, 50)
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



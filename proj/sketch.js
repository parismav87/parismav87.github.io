let x = 10;
let y = 200;
let w = 50;
let h = 50;
let xacc = 0.1;
let yacc = -20;
let xmax = 8;
let ymax = 200;
let jumpMove = false
let gravity = 5
let faceRight = true
let showText = false
let str = "This is my cat, Kira."
let i = 0;
let isOverlapping = false


function setup() {
	// createCanvas(window.innerWidth, window.innerHeight);
	createCanvas(windowWidth, windowHeight)
  s = createSprite(400, 200, 128 , 128)
  k = createSprite(700, 200, 32,32)

  var stand_r = s.addAnimation('stand_r', 'sprite_1.png')
  var stand_l = s.addAnimation('stand_l', 'sprite_2.png')
  var  walk_r = s.addAnimation('walk_r', 'sprite_1.png', 'sprite_0.png');
  var  walk_l = s.addAnimation('walk_l', 'sprite_2.png', 'sprite_3.png');
  var kira = k.addAnimation('stand', 'kira.png');

  s.depth = 100
  walk_r.frameDelay = 20
  walk_l.frameDelay = 20
}

function preload(){
  myFont = loadFont('8bit.TTF');
}

function draw() {
  clear()
	background(0,200,255)
 	// rect(x, y, w, h);
  // drawSprites()
  // s.changeAnimation('stand_r')
	if(keyIsDown(RIGHT_ARROW)){
		s.velocity.x = 1
    s.changeAnimation('walk_r')
    faceRight = true
	}
	if(keyIsDown(LEFT_ARROW)){
		s.velocity.x = -1
    s.changeAnimation('walk_l')
    faceRight = false
	}
  if(keyIsDown(UP_ARROW)){
    s.velocity.y = -1
    if(faceRight){
      s.changeAnimation('walk_r')
    } else {
      s.changeAnimation('walk_l')
    }
    
  }
  if(keyIsDown(DOWN_ARROW)){
    s.velocity.y = 1
    if(faceRight){
      s.changeAnimation('walk_r')
    } else {
      s.changeAnimation('walk_l')
    }
  }
  
	if(xacc>xmax){
		xacc = xmax
	}
	if(jumpMove){
		y+=1*yacc
		yacc+=1
		if(y>ymax){
			y = ymax
			jumpMove = false
			yacc = -20
		}
	}
	if(x>=400-w && x<=500){
		ymax = 150
	} else{
		ymax = 200
	}
	if(y<ymax){
	 y+=gravity
  }


  if(s.overlap(k)){
    textSize(20)
    fill(255)
    textFont(myFont)
    textAlign(CENTER)
    text("Press E to interact", s.position.x, s.position.y - 100)
    isOverlapping = true
  } else{
    showText = false
  }

  if(showText){
    textSize(20)
    fill(255)
    textFont(myFont)
    textAlign(LEFT)
    
    if(i<=str.length){
      interactText = text(str.substring(0,i), 10 ,100)
      if(frameCount%10==0 && i<str.length){
        i++;
      }
    }
  }

  drawSprites()

}

function keyPressed(){
	if(keyCode === UP_ARROW){
		jumpMove = true
	} 
  if (keyCode == 69 && isOverlapping){
    showText = true
  } 
}

function keyReleased(){
  if(keyCode === RIGHT_ARROW){
    s.changeAnimation('stand_r')
    s.velocity.x=0
  } else if (keyCode === LEFT_ARROW){
    s.changeAnimation('stand_l')
    s.velocity.x=0
  } else if(keyCode === UP_ARROW || keyCode === DOWN_ARROW){
    s.velocity.y =0
    if(faceRight){
      s.changeAnimation('stand_r')
    } else {
      s.changeAnimation('stand_l')
    }
  }
}

function resetAcceleration(){
	xacc = 0.1
}
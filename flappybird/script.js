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


var recordedChunks = [];
var texts = []
var constraints = { audio: false, video: {frameRate: {min: 28, max: 32, ideal: 30}} };
var options = {mimeType: 'video/webm; codecs=vp9'};


function startExperiment(){
  // console.log("haha")
  var x = document.getElementById("container");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
  setTimeout(function(){ download(); }, 30000);
  STARTED = true
  reset()
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("satisfied")
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(2000);
    webcamTime = Date.now() + 2000;
  })
}

function handleDataAvailable(event) {
  // console.log(event)
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      console.log(stream)
      var video = document.getElementById("videoElement");
      video.srcObject = stream
      console.log(video)
    })
    .catch(function (err0r) {
      console.log(err0r);
    });
}

function download() {
  mediaRecorder.stop()
  var blob = new Blob(recordedChunks, {
  type: 'video/webm'
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.body.appendChild(a);
  

  a.style = 'display: none';
  a.href = url;
  a.download = str(webcamTime)+'.webm';
  a.click();
  window.URL.revokeObjectURL(url);

  var textDoc = document.createElement('a');

    textDoc.href = 'data:attachment/text,' + encodeURI(texts.join('\n'));
    textDoc.target = '_blank';
    textDoc.download = str(webcamTime)+'.txt';
    textDoc.click();
}




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
  STARTED = false

  document.getElementById("startExperiment").addEventListener("click", startExperiment);
}




function draw() {
  var str = "newFrame" + ";" + Date.now() + ';BirdStatus; ' + bird.dead + ';Score; ' + score + ';bird.y; ' + bird.y + ';EndLine' + ';';
  texts.push(str);
  
  background(135,206,235);
  let c = color(255, 204, 0);
  fill(c);
  noStroke();
  rect(0, GROUND_Y, window.innerWidth, SCREEN_HEIGHT/10)

  

  bird.velocity.y += BIRD_GRAVITY
  if(bird.position.y<0){
    bird.position.y = 0;
  } else if(bird.position.y>GROUND_Y){
    die()
  }

  bird.rotationSpeed += BIRD_ROTATION_DROP
  if(bird.rotation>65){
    bird.rotation = 65
  } else if (bird.rotation < -65){
    bird.rotation = -65
  }


  if(frameCount % 80 == 0 && !IS_DEAD && STARTED){

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

  if(!STARTED){
    bird.velocity.y = 0
    bird.rotationSpeed = 0
  }
      
  drawSprites()


  noStroke();
  fill(255);
  textFont(myFont)
  textAlign(CENTER);
  textSize(32);
  text(score, 50, 50)

  if(IS_DEAD){
    noStroke();
    fill(255);
    textFont(myFont)
    textAlign(CENTER);
    textSize(32);
    var str = "Total score: "+ score + "\nPress R to reset."
    text(str, window.innerWidth/2, 200)
  }
}

function mousePressed() {
  if(!IS_DEAD){
    bird.velocity.y = BIRD_ANTIGRAVITY;
    bird.rotationSpeed = BIRD_ROTATION_JUMP
    var str = "JUMP;" + Date.now() + ";EndLineJump" + ';';
    texts.push(str);
  }  
}

function keyPressed(){
  if(key == 'r'){
    reset()
  } else if (key == "Escape"){
    die()
    download()
  }
}

function die(){
  IS_DEAD = true
  for(p of pipes){
    p.velocity.x = 0
  }
  bird.velocity.y = 0
  bird.rotationSpeed = 0

  
}

function reset(){
  pipes.removeSprites()
  IS_DEAD = false
  bird.position.y = 300
  bird.rotation = 0
  score = 0
  // var str = "RESET;";
  // texts.push(str);
}



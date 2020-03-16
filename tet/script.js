var recordedChunks = [];
var constraints = { audio: false, video: true };
var options = {mimeType: 'video/webm; codecs=vp9'};



if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	console.log("satisfied")
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		mediaRecorder = new MediaRecorder(stream, options);
		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.start(2000);
	})
}

function handleDataAvailable(event) {
  console.log(event)
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
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
	a.download = 'test.webm';
	a.click();
	window.URL.revokeObjectURL(url);

	var textDoc = document.createElement('a');

	  textDoc.href = 'data:attachment/text,' + encodeURI(texts.join('\n'));
	  textDoc.target = '_blank';
	  textDoc.download = 'myFile.txt';
	  textDoc.click();
}



var bird;
var pipes = [];
var texts = []

function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  this.score = 0;
  var el = document.getElementById('finished');
	if(el){
		console.log(" haha")
	  el.addEventListener('click', download);
	}
}

function draw() {
  background(135,206,235);

  noStroke();
  fill(0);
  textAlign(CENTER);
  textSize(32);
  text(this.score, width / 2, 50);

  if (!bird.dead) {

    noStroke();
    fill(205,133,63);
    rect(0, height - 32, width, height - 32);

    fill(255, 255, 0);
    ellipse(0, 0, 256, 256);

    bird.show();
    bird.update();
    bird.checkBorder();

    if (frameCount % 40 == 0) {
      pipes.push(new Pipe());
    }

    for (var p of pipes) {
      p.show();
      p.update();
      if (p.hit(bird)) {
        bird.dead = true;
        var str = Date.now() + "," + "DEAD" + "," + score;
    	texts.push(str)
      }

      if (p.scored(bird)) {
        this.score++;
      }
    }

    for (var i = 0; i < pipes.length; i++) {
      if (pipes[i].checkBorder()) {
        pipes.splice(i, 1);
      }
    }

  } else if (bird.dead) {

    noStroke();
    fill(0);
    textAlign(CENTER);
    textSize(25);
    text("Press ENTER to play again.", width / 2, height / 2 + 10);

    noStroke();
    textSize(32);
    fill(0);
    text("DEAD!", width / 2, 200);
  }
}

function mousePressed() {
  if(!bird.dead){
    bird.jump();
  }
}

function keyPressed() {
  if (key == ' ') {
    bird.jump();
    var str = Date.now() + "," + "JUMP" + "," + score;
    texts.push(str)
  } else if(keyCode === RETURN || keyCode === ENTER){
    pipes = [];
    bird = new Bird();
    this.score = 0;
    var str = Date.now() + "," + "RESET" + "," + score;
    texts.push(str)
  }
}
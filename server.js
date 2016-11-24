var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');

app.use(express.static(__dirname));

var users = [];
var player1 = [];
var player2 = [];
var playersready = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  // console.log(socket.id);

  socket.on("disconnect", function(){
    console.log("user " + socket.name + " has disconnected.");
    // console.log(socket.name);
    var index = users.indexOf(socket.name);
    users.splice(index,1);
    console.log(users);
  })

  socket.on("login", function(data){

    var loginData = {
      socketid: socket.id,
      name: data
    }
    loginUser(users, loginData)
    socket.name = data;
    if(users.length == 2){
      console.log(users);
      initGame();
    }

  })

  socket.on("ready", function(data){
    console.log("player is ready");
    playersready +=1;
    if(playersready == 2){
      io.to(users[0].socketid).emit("startGame", users[1].name);
      io.to(users[1].socketid).emit("startGame", users[0].name);      
      startGame();
    }
  })

  socket.on("swapmove", function(data){
    // console.log(socket.id);
    var playerNo = getPlayerNumber(socket.id);
    doSwap(playerNo, data);
    var object = {
      move: "swap",
      previous: data.previous,
      next: data.next
    }
    if(playerNo == 1 ){
      io.to(users[0].socketid).emit("turnend", player1);
      object["blocks"] = player2;
      io.to(users[1].socketid).emit("turnstart", object);
    } else {
      io.to(users[1].socketid).emit("turnend", player2);
      object["blocks"] = player1;
      io.to(users[0].socketid).emit("turnstart", object);
    }
  })

  socket.on("trademove", function(data){
    // console.log(socket.id);
    // console.log(data)
    var playerNo = getPlayerNumber(socket.id);
    var ended = checkIfGameEnded(playerNo,data);
    
    var object = {
      move: "trade",
      index: data.next
    }
    if(playerNo == 1 ){
      io.to(users[0].socketid).emit("turnend", player1);
      object["blocks"] = player2;
      io.to(users[1].socketid).emit("turnstart", object);
    } else {
      io.to(users[1].socketid).emit("turnend", player2);
      object["blocks"] = player1;
      io.to(users[0].socketid).emit("turnstart", object);
    }
    if(ended == true){
      if(playerNo == 1){
        io.to(users[0].socketid).emit("wongame", "you won the game!")
      } else {
        io.to(users[1].socketid).emit("wongame", "you won the game!")
      }
    }
    
  })


});


function doSwap(playerNo, data){
  if(playerNo == 1){
    var temp = player1[data.next];
    player1[data.next] = player1[data.previous]
    player1[data.previous] = temp;
  } else {
    var temp = player2[data.next];
    player2[data.next] = player2[data.previous]
    player2[data.previous] = temp;
  }
}

function checkIfGameEnded(playerNo, data){
  var ended = false
  if(playerNo == 1){
    var temp = player2[data.next];
    player2[data.next] = player1[data.previous];
    player1[data.previous] = temp;
    if(getSumOfArray(player1) == 20){
      // console.log("game has ended");
      ended = true;
    }
    console.log(player1);
    console.log(player2);
  } else{
    var temp = player1[data.next];
    player1[data.next] = player2[data.previous];
    player2[data.previous] = temp;
    if(getSumOfArray(player2) == 20){
      // console.log("game has ended");
      ended = true;
    }
    console.log(player1);
    console.log(player2);
  }
  return ended;
}

function getPlayerNumber(socketid){
  for(i=0; i<2; i++){
    if(users[i].socketid == socketid){
      return users[i].playerNumber;
    }
  }
}

function startGame(){
  io.to(users[0].socketid).emit("turnstart","");
  io.to(users[1].socketid).emit("turnend", "");
}


function initGame(){
  constructPlayer1Board();
  io.to(users[0].socketid).emit("board", player1);
  users[0]["playerNumber"] = 1;
  player2 = constructPlayer2Board();
  io.to(users[1].socketid).emit("board", player2);
  users[1]["playerNumber"] = 2;
  // io.emit("broadcast", something);
}

function constructPlayer2Board(){
  var numbers = [1,2,3,4,6,7,8,9];
  var len = player1.length;
  for(i=0; i<len; i++){
    numbers.splice(numbers.indexOf(player1[i]),1);
  }
  return numbers;
}

function constructPlayer1Board(){
  var player1Sum = 0;
  for(i=0; i<4; i++){
    if(i<3){
      addNumberToBoard(player1);
    } else {
      addLastNumberToBoard(player1);
    }
  }
}

function addNumberToBoard(arr){
  var z = getRandomInt(1,9);
  if(!existsInArray(z,arr) && z!=5){
    arr.push(z);
  } else{
    addNumberToBoard(arr);
  }
}

function addLastNumberToBoard(arr){
  var z = getRandomInt(1,9);
  var sum = getSumOfArray(arr);
  if(!existsInArray(z,arr) && sum!=20 && z!=5){
    arr.push(z);
  } else{
    addLastNumberToBoard(arr);
  }
}

function getSumOfArray(arr){
  var len = arr.length;
  var sum = 0;
  for(i=0; i<len; i++){
    sum+= arr[i];
  }
  return sum;
}

function existsInArray(num, arr){
  var len = arr.length;
  var exists = false;
  for(i=0; i<len; i++){
    if(num == arr[i]){
      exists = true;
    }
  }
  return exists;
}

function loginUser(users, data){
	// io.emit("coordinates", io.connected());
  users.push(data);
  console.log(data.name + ' has logged in.');
  
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}





http.listen(8080, function(){
  console.log('listening on *:8080');
});

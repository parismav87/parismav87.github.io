numbers = {
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A"
}
suites ={
  1: "H",
  2: "D",
  3: "C",
  4: "S"
}

let socket;
let me;



var Card = function(){
  this.back = loadAnimation("cards/back.png")
  this.sprite = createSprite(-200,-200,100,140)
  this.sprite.active = ""
  this.number = 0
  this.suite = 0
  for(n in numbers){
    for(s in suites){
      cardName = numbers[n]+suites[s]
      animation = loadAnimation("cards/"+cardName+".png")
      this.sprite.addAnimation(cardName, animation)
    }
  }  
  this.sprite.addAnimation("back", this.back)
}

function clickOnCard(card, mouseX, mouseY){
  if(card.getBoundingBox().top() <= mouseY && card.getBoundingBox().bottom() >= mouseY && card.getBoundingBox().left() <= mouseX && card.getBoundingBox().right() >= mouseX){
    return true
  }
  return false
}

function playCard(n,s,p){
  var anim = numbers[n]+suites[s]
  for(c of board){
    if(!c.visible){
      c.changeAnimation(anim)
      c.visible = true
      break;
    }
  }
  if(me.position == p){
    for(c of myCards){
      if(c.active){
        c.visible = false
      }
    }
  } else {
    removeCard(p)
  }
  
}

function initCards(){
  for(let i=0; i<8; i++){
    var card = new Card()
    card.sprite.visible = false
    card.sprite.position.x = 640 - (8*15) + (i*25)
    card.sprite.position.y = 575
    myCards.add(card.sprite)
    myCardsObject.push(card)
  }
  initOthers(8, "top")
  initOthers(8, "right")
  initOthers(8, "left")
}

function updateCards(){
  for(var c in me.cards){
    var crd = me.cards[c]
    var cardName = numbers[crd.number]+suites[crd.suite]
    myCards[c].changeAnimation(cardName)
    myCardsObject[c].number = crd.number
    myCardsObject[c].suite = crd.suite
    myCards[c].visible = true
    myCards[c].active = false
  }  
}

function getPosition(posNr){
  if(posNr == me.position){
    return "bottom"
  }
  if(me.position == 1){
    if(posNr == 2){
      return "left"
    } else if(posNr ==  3){
      return "top"
    } else {
      return "right"
    }
  } else if(me.position == 2){
    if(posNr == 3){
      return "left"
    } else if(posNr ==  4){
      return "top"
    } else {
      return "right"
    }
  } else if(me.position == 3){
    if(posNr == 4){
      return "left"
    } else if(posNr ==  1){
      return "top"
    } else {
      return "right"
    }
  } else {
    if(posNr == 1){
      return "left"
    } else if(posNr ==  2){
      return "top"
    } else {
      return "right"
    }
  }
}

function removeCard(posNr){
  position = getPosition(posNr)
  if(position == "top"){
    for(c of topCards){
      if(c.visible){
        c.visible  = false;
        break;
      }
    }
  } else if(position == "right"){
    for(c of rightCards){
      if(c.visible){
        c.visible  = false;
        break;
      }
    } 
  } else {
    for(c of leftCards){
      if(c.visible){
        c.visible  = false;
        break;
      }
    } 
  }
}

function initOthers(nrCards, position){
  for(i=0; i<nrCards; i++){
    var c = new Card()
    c.sprite.changeAnimation("back")
    if(position == "top"){
      c.sprite.position.x = 640 - (nrCards*15) + (i*25)
      c.sprite.position.y = 0 
      c.sprite.visible = false
      topCards.add(c.sprite)   
    } else if(position == "right"){
      c.sprite.position.x = 1240
      c.sprite.position.y = 300 - (nrCards*15) + (i*25)
      c.sprite.rotation = 90
      c.sprite.visible = false
      rightCards.add(c.sprite)
    } else {
      c.sprite.position.x = 0
      c.sprite.position.y = 300 - (nrCards*15) + (i*25)
      c.sprite.rotation = 90
      c.sprite.visible = false
      leftCards.add(c.sprite)
    }
  }
}

function updateOthersCards(posNr){
  var position = getPosition(posNr)
  if(position == "top"){
    for(c in topCards){
      if(c<me.cards.length){
        topCards[c].visible = true
      }
    }
  } else if(position == "right"){
    for(c in rightCards){
      if(c<me.cards.length){
        rightCards[c].visible = true
      }
    }
  } else {
    for(c in leftCards){
      if(c<me.cards.length){
        leftCards[c].visible = true
      }
    }
  }
}

function updatePlayers(players){
  clearPlayers()
  console.log(players)
    for(p of players){
      if(p.name != me.name){
        var position = getPosition(p.position)
        if(position == "top"){
          document.getElementById('player3').innerHTML = p.name
        } else if(position == "right"){
          document.getElementById('player2').innerHTML = p.name
        } else {
          document.getElementById('player4').innerHTML = p.name
        }
      }
    }
}

function clearPlayers(){
  document.getElementById('player2').innerHTML = ""
  document.getElementById('player3').innerHTML = ""
  document.getElementById('player4').innerHTML = ""
}

function toggleTurn(gPos){
  console.log("turn position", gPos)
  document.getElementById('player1').style.color = "white"
  document.getElementById('player2').style.color = "white"
  document.getElementById('player3').style.color = "white"
  document.getElementById('player4').style.color = "white"
  document.getElementById('buy').style.display = "none"
  document.getElementById('pass').style.display = "none"
  if(gPos == "top"){
    document.getElementById('player3').style.color = "orange"
  } else if(gPos == "right"){
    document.getElementById('player2').style.color = "orange"
  } else if(gPos == "left"){
    document.getElementById('player4').style.color = "orange"
  } else{
    document.getElementById('player1').style.color = "orange"
    document.getElementById('buy').style.display = "block"
    document.getElementById('pass').style.display = "block"
  }
}


function preload() {
  myCards = new Group()
  board = new Group()
  topCards = new Group()
  rightCards = new Group()
  leftCards = new Group()
  myCardsObject = []
}


function setup() {
  socket = io.connect("http://2e112e99.ngrok.io")
  createCanvas(1280, 600);

  
  document.getElementById("join").addEventListener("click", function(evt){
    socket.emit("newPlayer",{
      name: document.getElementById("myName").value
    })
  })

  for(el of document.querySelectorAll(".suite")){
    el.addEventListener("click", function(evt){
      socket.emit("buySuite", {
        "position": me.position,
        "suite": this.dataset.suite
      })
    })
  }
  

  document.querySelector("#pass").addEventListener("click", function(evt){
    socket.emit("pass", me.position)
  })

  me = {
    position: 0,
    name : "",
    cards : [],
    team: 0,
    hasTurn: false,
    bought: false,
    hasJoined : false
  }

  initCards()
  // updateCards()

  //draw board
  for(let i=0; i<4; i++){
    var c = new Card()
    c.sprite.visible = false
    c.sprite.position.x = 550 + (i*20)
    c.sprite.position.y = 280
    board.add(c.sprite)
  }

  socket.on("connect", function(data){
    socket.emit("updatePlayers", {})
  })

  socket.on("playerJoin", function(data){
    socket.emit("updatePlayers", {})
  })

  socket.on("hasBought", function(data){
    socket.emit("requestCards")
    document.getElementById('buy').style.display = "none"
    document.getElementById('pass').style.display = "none"
  })

  socket.on("joinSuccess", function(data){
    document.getElementById("player1").innerHTML = data['name']
    me.position = data['position']
    me.team = data['team']
    me.hasJoined = true
    me.name = data.name
    document.getElementById("myName").style.display = 'none'
    document.getElementById("join").style.display = 'none'
    socket.emit("updatePlayers", {})
  })

  socket.on("updatePlayers", function(data){
    updatePlayers(data)
  })

  socket.on("turn", function(data){
    toggleTurn(getPosition(data))
  })

  socket.on("gameStart", function(data){
    socket.emit("requestCards")
    console.log("requesting cards")
    socket.emit("requestScores")
    console.log("requesting scores")
  })

  socket.on("updateScores", function(data){
    var team1 = data[0]
    var team2 = data[1]
    team1Name = team1.players[0].name + "/" + team1.players[1].name
    team2Name = team2.players[0].name + "/" + team2.players[1].name
    team1Score = team1.score
    team2Score = team2.score
    document.getElementById("team1name").innerHTML = team1Name
    document.getElementById("team2name").innerHTML = team2Name
    document.getElementById("team1score").innerHTML = team1Score
    document.getElementById("team2score").innerHTML = team2Score
  })
    
  socket.on("getCards", function(data){
    me.cards = data
    console.log("got cards")
    updateCards()
    for(let i=1; i<me.cards.length; i++){
      if(i!= me.position){
        updateOthersCards(i)
      }
    }
  })

  socket.on("roundReset", function(data){
    socket.emit("requestCards", me.position)
  })

  socket.on("showBuy", function(data){
    if(data == me.position){
      document.getElementById('buy').style.display = "block"
      document.getElementById('pass').style.display = "block"
    } else {
      document.getElementById('buy').style.display = "none"
      document.getElementById('pass').style.display = "none"
    }
  })

  socket.on("getBoard", function(data){
    if(data!=null){
      var cardName = numbers[data.number] + suites[data.suite]
      board[0].visible = true
      board[0].changeAnimation(cardName)
    } else {
      board[0].visible = false
    }
    
  })

  socket.on("moveSuccess", function(data){
    var n = data.number
    var s = data.suite
    var p = data.position
    playCard(n,s,p)    

  })

  socket.on("moveFail", function(data){
    console.log("fail move")
  })

  socket.on("trickEnd", function(data){
    setTimeout(function(e){
      for(c of board){
        c.visible = false
      }
    }, 1500)
  })

  socket.on("roundEnd", function(data){
    socket.emit("requestScores")
    socket.emit("requestCards")
  })
}




function draw() {
  background(23, 64, 26)
  drawSprites(myCards)
  drawSprites(topCards)
  drawSprites(leftCards)
  drawSprites(rightCards)
  drawSprites(board)
}

function mouseClicked(evt){
  let clickedCard;
  let depth = -999
  let clickedCardObj;

  for(c of myCards){
    if(clickOnCard(c,mouseX,mouseY)){
      if(c.depth > depth){
        depth = c.depth
        clickedCard = c
      }
    }
  }
  if(typeof(clickedCard)!="undefined" && !clickedCard.active){
    clickedCard.active = true
    clickedCard.position.y-=25
    for(c of myCards){
      if(c != clickedCard && c.active){
        c.active = false
        c.position.y+=25
      }
    }
  } else if(typeof(clickedCard)!="undefined" && clickedCard.active){
    if(typeof(socket)!= "undefined"){
      for(c of myCardsObject){
        if(c.sprite == clickedCard){
          clickedCardObj = c
        }
      }
      var data = {
        'position': me.position,
        'number': clickedCardObj.number,
        'suite': clickedCardObj.suite
      }
      socket.emit("makeMove", data)
    }
  }
  
}





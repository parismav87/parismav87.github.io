

let socket;
let me;



var Card = function(cardType, index){
  this.numbers = {
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
    14: "A"
  }
  this.suites ={
    1: "H",
    2: "D",
    3: "C",
    4: "S"
  }
  this.back = "cards/back.png"
  let elStr = cardType+index
  this.sprite = $("#"+ elStr)
  this.active = false
  this.number = 0
  this.suite = 0
  this.loadAnimation = function(number,suite){
    if(number !=0 && suite!= 0){
      let cardName = "cards/"+this.numbers[number]+this.suites[suite]+".png"
      // console.log(cardName)
      this.sprite.attr("src", cardName)
      show(this.sprite)
      this.active = false
    }
  } 
  this.loadBack = function(){
    this.sprite.attr("src", this.back)
  }
}

function show(el){
  $(el).css("visibility", "visible")
}

function hide(el){
  $(el).css("visibility", "hidden")
}

function playCard(n,s,p){
  for(c of board){
    if($(c.sprite).css("visibility") == "hidden"){
      c.loadAnimation(n,s)
      show(c.sprite)
      break;
    }
  }
  if(me.position == p){
    for(c of me.cards){
      if(c.active){
        hide(c.sprite)
      }
    }
  } else {
    removeCard(p)
  }
  
}

function initCards(){
  var myCards = []
  for(let i=1; i<9; i++){
    var card = new Card("player1card",i)
    myCards.push(card)
  }
  me.cards = myCards
  initOthers(8, "top")
  initOthers(8, "right")
  initOthers(8, "left")
}

function updateCards(){
  // console.log("updatecards")
  for(var c of me.cards){
    // console.log(c)
    c.loadAnimation(c.number, c.suite)
  }  
}

function haveSeven(boardCard){
  for(c of me.cards){
    if(c.suite == boardCard.suite && c.number == 7){
      return true
    }
  }
  return false
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
      if($(c.sprite).css("visibility") == "visible"){
        hide(c.sprite)
        break;
      }
    }
  } else if(position == "right"){
    for(c of rightCards){
      if($(c.sprite).css("visibility") == "visible"){
        hide(c.sprite)
        break;
      }
    } 
  } else {
    for(c of leftCards){
      if($(c.sprite).css("visibility") == "visible"){
        hide(c.sprite)
        break;
      }
    } 
  }
}

function initOthers(nrCards, position){
  for(i=1; i<nrCards+1; i++){
    if(position == "top"){
      var c = new Card("player3card",i)
      topCards.push(c)   
    } else if(position == "right"){
      var c = new Card("player2card",i)
      rightCards.push(c)
    } else {
      var c = new Card("player4card",i)
      leftCards.push(c)
    }
  }
}

function updateOthersCards(position, index){
  // var position = getPosition(posNr)
  if(position == "top"){
    show(topCards[index].sprite)
  } else if(position == "right"){
    show(rightCards[index].sprite)
  } else {
    show(leftCards[index].sprite)
  }
}

function updatePlayers(players){
  clearPlayers()
  // console.log(players)
    for(p of players){
      if(p.name != me.name){
        var position = getPosition(p.position)
        if(position == "top"){
          $('#player3').text(p.name)
          show('#player3')
        } else if(position == "right"){
          $('#player2').text(p.name)
          show('#player2')
        } else {
          $('#player4').text(p.name)
          show('#player4')
        }
      }
    }
}

function clearPlayers(){
  document.getElementById('player2').innerHTML = ""
  document.getElementById('player3').innerHTML = ""
  document.getElementById('player4').innerHTML = ""
}

function toggleTurn(gPos, buy){
  console.log("turn position", gPos)
  document.getElementById('player1').style.color = "white"
  document.getElementById('player2').style.color = "white"
  document.getElementById('player3').style.color = "white"
  document.getElementById('player4').style.color = "white"
  hide("#buy")
  hide("#pass")
  if(gPos == "top"){
    document.getElementById('player3').style.color = "orange"
    me.hasTurn = true
  } else if(gPos == "right"){
    document.getElementById('player2').style.color = "orange"
    me.hasTurn = true
  } else if(gPos == "left"){
    document.getElementById('player4').style.color = "orange"
    me.hasTurn = true
  } else{
    document.getElementById('player1').style.color = "orange"
    if(buy){
      console.log("showing")
      show("#buy")
      show("#pass")
    }
    
    me.hasTurn = true
  }
}

function restoreBack(gPos){
  if(gPos == "top"){
    for(c of topCards){
      c.loadBack()
    }
  } else if(gPos == "right"){
    for(c of rightCards){
      c.loadBack()
    }
  } else {
    for(c of leftCards){
      c.loadBack()
    }
  }
}

function handleDeclarations(data){
  console.log("declaration data")
  console.log(data)
  var position = data.position;
  var gPos = getPosition(position)
  if(position != me.position){
    for(d of data.declarations){
      for(c of d.cards){
        showCard(c, gPos)
      }
    }
    setTimeout(function(){
      restoreBack(gPos)
    },3000)
  }
}

function showCard(card, position){
  console.log("showing card  ", card, position)
  if(position == "top"){
    for(c of topCards){
      if($(c.sprite).attr("src").includes("back.png")){
        // show(c.sprite);
        c.loadAnimation(card.number, card.suite)
        break;
      }
    }
  } else if(position == "right"){
    for(c of rightCards){
      if($(c.sprite).attr("src").includes("back.png")){
        // show(c.sprite);
        c.loadAnimation(card.number, card.suite)
        break;
      }
    } 
  } else {
    for(c of leftCards){
      if($(c.sprite).attr("src").includes("back.png")){
        // show(c.sprite);
        c.loadAnimation(card.number, card.suite)
        break;
      }
    } 
  }
}



function toggleDealer(gPos){
  hide(".player1dealer")
  hide(".player2dealer")
  hide(".player3dealer")
  hide(".player4dealer")
  if(gPos == "top"){
    show(".player3dealer")
  } else if(gPos == "right"){
    show(".player2dealer")
  } else if(gPos == "left"){
    show(".player4dealer")
  } else{
    show(".player1dealer")
  }
}

function toggleBought(data){
  let gPos = getPosition(data.position)
  let suite = data.suite
  hide(".player1buy")
  hide(".player2buy")
  hide(".player3buy")
  hide(".player4buy")
  if(gPos == "top"){
    show(".player3buy")
    let imgName = suite + ".png"
    $(".player3buy").attr("src", imgName)
  } else if(gPos == "right"){
    show(".player2buy")
    let imgName = suite + ".png"
    $(".player2buy").attr("src", imgName)
  } else if(gPos == "left"){
    show(".player4buy")
    let imgName = suite + ".png"
    $(".player4buy").attr("src", imgName)
  } else{
    show(".player1buy")
    let imgName = suite + ".png"
    $(".player1buy").attr("src", imgName)
  }
}


$( document ).ready(function() {
  console.log( "ready!" );
  socket = io.connect("https://1b34ffc6.ngrok.io")


  board = []
  topCards = []
  rightCards = []
  leftCards = []



  
  $("#playCard").on("click", function(evt){
    for(c of me.cards){
      if(c.active){
        var data = {
          'position': me.position,
          'number': c.number,
          'suite': c.suite
        }
        socket.emit("makeMove", data)
        hide("#playCard")
      }      
    }
  })
  
  $(".player1card").on("click", function(evt){
    for(c of me.cards){
      if(c.sprite[0] == evt.target){
        if(!c.active){
          c.active = true
          c.sprite.addClass("active")
          if(me.hasTurn){
            show("#playCard")
          }
        } else {
          c.active = false
          c.sprite.removeClass("active")
          hide("#playCard")
          
        }
        
      } else {
        c.active = false
        c.sprite.removeClass("active")
      }
    }
    console.log(evt)
  })
  
  $("#join").on("click", function(evt){
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

  $("#tradeSevenYes").on("click", function(evt){
    hide("#tradeSeven")
    socket.emit("tradeSevenYes", me.position)
  })

  $("#tradeSevenNo").on("click", function(evt){
    hide("#tradeSeven")
    socket.emit("tradeSevenNo", me.position)
  })

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

  //draw board
  for(let i=1; i<5; i++){
    var c = new Card("boardCard", i)
    board.push(c)
  }

  socket.on("connect", function(data){
    socket.emit("updatePlayers", {})
  })


  socket.on("playerJoin", function(data){
    socket.emit("updatePlayers", {})
  })

  socket.on("hasBought", function(data){
    console.log(data)
    toggleBought(data)
    if(haveSeven(data.boardCard)){
      // console.log("i have 7")
      show("#tradeSeven")
    } else {
      // console.log(" i no heff 7")
      socket.emit("tradeSevenNo", me.position)
    }
    
  })

  socket.on("startRound", function(data){
    socket.emit("requestCards")
    // hide("#buy")
    // hide("#pass")
  })

  socket.on("joinSuccess", function(data){
    $("#player1").text(data['name'])
    show('#player1')
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
    var pos = getPosition(data.position)
    var showBuy = data.buy
    console.log(" turnnn  ")
    console.log(data)
    toggleTurn(pos, showBuy)
  })

  socket.on("dealer", function(data){
    console.log(data)
    toggleDealer(getPosition(data))
  })

  socket.on("gameStart", function(data){
    socket.emit("requestCards")
    console.log("requesting cards")
    socket.emit("requestScores")
    console.log("requesting scores")
  })

  socket.on("updateScores", function(data){
    show("#scoreTable")
    var team1 = data[0]
    var team2 = data[1]
    var team1Name = team1.players[0].name + "/" + team1.players[1].name
    var team2Name = team2.players[0].name + "/" + team2.players[1].name
    var team1Score = team1.score
    var team2Score = team2.score
    document.getElementById("team1name").innerHTML = team1Name
    document.getElementById("team2name").innerHTML = team2Name
    document.getElementById("team1score").innerHTML = team1Score
    document.getElementById("team2score").innerHTML = team2Score
  })

  socket.on("declarations", function(data){
    console.log("received declarations")
    handleDeclarations(data)
  })
    
  socket.on("getCards", function(data){
    console.log("got cards")
    console.log(data)
    initCards()
    for(d in data){
      let da = data[d]
      me.cards[d].suite = da.suite
      me.cards[d].number = da.number
      me.cards[d].isAtou = da.isAtou
      for(let i=0; i<3; i++){
        if(i == 0){
          updateOthersCards("right", d)
        } else if(i==1){
          updateOthersCards("top", d)
        } else {
          updateOthersCards("left", d)
        }
        
      }
    }
    updateCards()
  })

  socket.on("roundReset", function(data){
    socket.emit("requestCards", me.position)
  })

  socket.on("getBoard", function(data){
    console.log("board data  ",data)
    if(data!=null){
      board[0].loadAnimation(data.number, data.suite)
    } else {
      hide(board[0].sprite)
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
        hide(c.sprite)
      }
    }, 1000)
  })

  socket.on("roundEnd", function(data){
    socket.emit("requestScores")
    socket.emit("requestCards")
  })
});








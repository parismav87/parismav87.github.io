var app = require('express')();
var cors = require('cors');
app.use(cors());
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.set('origins', '*:*');


function Card(number, suite){
	this.suite = suite
	this.number = number
	this.isAtou = false

	this.map = function(){
		str = numbers[this.number] + ' of ' + suites[this.suite]
		return str
	}
}

function Pile(){
	this.cards = []
	this.empty = function(deck){
		if(this.cards.length!=0){
			deck.cards = this.cards 
			this.cards = []
		}
	}
}

function Declaration(cards){
	this.cards = []
	for(c of cards){
		this.cards.push(c)
	}

	this.getType = function(){
		if(this.cards[0].number == this.cards[1].number){
			return "carre"
		} else {
			return "street"
		}
	}

	this.getPoints = function(){
		if(this.getType() == "carre"){
			if(this.cards[0].number == 7 || this.cards[0].number == 8){
				return 0
			} else if(this.cards[0].number == 10 || this.cards[0].number == 12 || this.cards[0].number == 13 || this.cards[0].number == 14){
				return 100
			} else if(this.cards[0].number == 9){
				return 150
			} else {
				return 200
			}
		} else {
			if(this.cards.length == 3){
				return 20
			} else if(this.cards.length == 4){
				return 50
			} else if(this.cards.length == 8){ //5 and 3
				return 120
			} else {
				return 100
			}
		}
	}
	
	this.getHighCard = function(){
		if(this.getType() == "carre"){
			return this.cards[0].number
		} else {
			return this.cards[this.cards.length-1].number
		}
	}
}

function Player(name, position, cards, socketId){
	this.name = name
	this.position = position
	this.cards = cards
	this.hasTurn = false
	this.bought = 0
	this.socketId = socketId
	this.team = 0
	this.firstPass = false
	this.secondPass = false
	this.useSeven = null
	this.declarations = []

	this.removeCard = function(card){
		var ind = this.cards.indexOf(card)
		pile.cards.push(card)
		this.cards.splice(ind,1) 
	}

	this.hasCard = function(n,s){
		for(c of this.cards){
			if(c.number == n && c.suite == s){
				return true
			}
		}
		return false
	}

	this.getDeclarations = function(){
		// console.log("checking player in position ", this.position)
		// console.log(this.cards)
		this.getStreets()
		this.getCarres()
		this.getBourlo()
		// console.log("emit declarations")
		// console.log(this.declarations)
		io.sockets.emit("declarations", {
			"position": this.position,
			"declarations": this.declarations
		})
	}

	this.getStreets = function(){
		// console.log("checking streets")
		for(s in suites){
			let count = 0;
			let declaration = []
			// console.log("count and declaration")
			// console.log(count)
			// console.log(declaration)
			for(n in numbers){
				// console.log(' NUMBER ', n, " SUITE ", s)
				if(this.hasCard(n,s)){
					// console.log("HAVE CARD")
					count += 1 
					declaration.push(new Card(n,s))
					if(n == numbers.length-1 && count>2){ //street to A
						// console.log("found street of ", suites[s], "s")
						// console.log(declaration)
						this.declarations.push(new Declaration(declaration))
					}
				} else {
					// console.log("DONT HAVE CARD")
					if(count > 2){
						// console.log("found street of ", suites[s], "s")
						// console.log(declaration)
						this.declarations.push(new Declaration(declaration))
					}
					for(let i=0; i<count; i++){
						declaration.shift()
					}
					count = 0
				}
			}
			
		}
	}

	this.getCarres = function(){
		// console.log("checking carre")
		for(n in numbers){
			let declaration = []
			let count = 0;
			for(c of this.cards){
				if(c.number == n){
					count +=1
					declaration.push(new Card(c.number,c.suite))
				}
			}
			if(count == 4){
				// console.log("found carre of ", numbers[n], "s")
				// console.log(declaration)
				this.declarations.push(new Declaration(declaration))
			} else {
				declaration = []
			}
		}
	}

	this.getBourlo = function(){
		if(this.hasCard(12,board.atou) && this.hasCard(13,board.atou)){
			// console.log("found bourlo! ")
			var bourlo = []
			bourlo.push(new Card(12, board.atou))
			bourlo.push(new Card(13, board.atou))
			this.declarations.push(new Declaration(bourlo))
			// console.log(this.declarations)
		}
	}

	this.hasSuite = function(suite){
		for(c of this.cards){
			if(c.suite == suite){
				return true
			}
		}
		return false
	}

	this.canRaise = function(board){
		let highestAtouHand = -1
		let highestAtouBoard = -1
		for(c of this.cards){
			if(c.suite == board.atou && valuesAtou.indexOf(c.number)>highestAtouHand){
				highestAtouHand = valuesAtou.indexOf(c.number)
			}
		}
		for(c of board.cards){
			if(c.suite == board.atou && valuesAtou.indexOf(c.number)>highestAtouBoard){
				highestAtouBoard = valuesAtou.indexOf(c.number)
			}
		}
		if(highestAtouHand > highestAtouBoard){
			return true
		} else{
			return false
		}
	}

	this.didRaise = function(board, card){
		for(c of board.cards){
			if(c.suite == board.atou && valuesAtou.indexOf(c.number)>valuesAtou.indexOf(card.number)){
				return false
			}
		}
		return true
	}

	this.printCards = function(){
		console.log('------- ', this.name, ' cards -------')
		for(c of this.cards){
			console.log(c.map())
		}
	}

	this.sortCards = function(){
		// console.log(this.cards)
		let len = this.cards.length;
	    for (let i = 0; i < len-1; i++) {
	        for (let j = 0; j < len-i-1; j++) {
	            if (this.cards[j].suite > this.cards[j + 1].suite) {
	                let tmp = this.cards[j];
	                this.cards[j] = this.cards[j + 1];
	                this.cards[j + 1] = tmp;
	            } else if(this.cards[j].suite == this.cards[j + 1].suite){
	            	if(this.cards[j].suite == board.atou && valuesAtou.indexOf(this.cards[j].number) > valuesAtou.indexOf(this.cards[j+1].number)){
	            		let tmp = this.cards[j];
		                this.cards[j] = this.cards[j + 1];
		                this.cards[j + 1] = tmp;
	            	} else if(this.cards[j].suite != board.atou && valuesNormal.indexOf(this.cards[j].number) > valuesNormal.indexOf(this.cards[j+1].number)){
	            		let tmp = this.cards[j];
		                this.cards[j] = this.cards[j + 1];
		                this.cards[j + 1] = tmp;
		            }
	            }
	        }
	    }
	}

}

function Move(card, player){
	this.card = card
	this.player = player
}

function Board(cards){
	this.cards = cards
	this.atou = 0
	this.moves = []
	this.dealer = 0

	this.isValidMove = function(player, newCard){

		// console.log(suites[board.atou])
		if(player.hasTurn && hasAnyoneBought()){
			if(this.cards.length == 0){
				return true
			} else {
				if(newCard.suite == this.cards[0].suite){ //if played card matches first card suite
					if(newCard.suite == this.atou){ //if atou is asked
						if(player.canRaise(this)){
							if(player.didRaise(this, newCard)){
								return true
							} else {
								return false
							}
						} else {
							return true
						}
						
					} else { //normal asked
						return true
					}
				} else { //played card doesnt match first card
					if(player.hasSuite(this.cards[0].suite)){ //player has correct suite
						return false
					} else { // player doesnt have correct suite		
						if(newCard.suite == this.atou){ //new card is atou
							if(player.canRaise(this)){
								if(player.didRaise(this, newCard)){
									return true
								} else {
									return false
								}
							} else {
								return true
							}
						} else { //new card is not atou
							if(player.hasSuite(this.atou)){ //if player has atou to play
								// player.printCards()
								return false
							} else { //player doesnt have atou, or correct suite
								return true
							}
						}
					}
				}
			}
		} else {
			return false
		}
	}

	this.makeMove = function(player, newCard){


		if(this.isValidMove(player, newCard)){ //move is valid

			this.cards.push(newCard)
			this.moves.push(new Move(newCard, player))
			player.removeCard(newCard)


			if(this.cards.length == 4){
				this.endTrick()
			} else{
				this.passTurn()
			}
			return true

		} else {
			return false
		}


	}

	this.endTrick = function(){
		var asking = this.moves[0].card.suite
		var bestNormal = 0
		var bestAtou = -1
		var trickPoints = 0
		var winningPlayer = this.moves[0].player

		for(m of this.moves){
			if(m.card.suite == this.atou){
				if(scoresAtou[m.card.number]>bestAtou){
					bestAtou = scoresAtou[m.card.number]
					winningPlayer = m.player
					trickPoints += scoresAtou[m.card.number]
				} else {
					trickPoints += scoresAtou[m.card.number]
				}
				
			} else if(m.card.suite == asking && bestAtou == -1){
				if(scoresNormal[m.card.number]>bestNormal){
					bestNormal = scoresNormal[m.card.number]
					winningPlayer = m.player
					trickPoints += scoresNormal[m.card.number]
				} else {
					trickPoints += scoresNormal[m.card.number]
				}
			} else {
				trickPoints+=scoresNormal[m.card.number]
			}
		}
		// console.log("moves")
		// console.log(this.moves)
		// console.log("points: ")
		// console.log(teams[0].points, teams[1].points)

		// console.log(winningPlayer.name, winningPlayer.position)
		// console.log("total trick points ", trickPoints)
		// console.log(trickPoints)

		teams[winningPlayer.team-1].points += trickPoints
		if(winningPlayer.cards.length == 0){ //last trick worth 10
			teams[winningPlayer.team-1].points += 10
		}
		for(p of players){
			if(p != winningPlayer){
				p.hasTurn = false
			} else {
				p.hasTurn = true
			}
		}
		// console.log(winningPlayer, bestAtou, bestNormal)
		this.cards = []
		this.moves = []
	}


	this.passTurn = function(){
		let newTurn = 0
		for(p of players){
			if(p.hasTurn){
				// p.hasTurn = false
				newTurn = p.position + 1
				if(newTurn>4){
					newTurn = 1
				}
			}
		}
		this.setTurn(newTurn)
	}

	this.setTurn = function(pos){
		for(p of players){
			if(p.position == pos){
				p.hasTurn = true
			} else {
				p.hasTurn = false
			}
		}
	}

	this.passDealer = function(){
		let newDealer = 0
		for(p of players){
			if(p.position == this.dealer){
				newDealer = p.position + 1
				if(newDealer>4){
					newDealer = 1
				}
			}
		}
		this.dealer = newDealer
	}
}

function Deck(cards){
	this.cards = cards

	this.shuffle = function() {
	  for (let i = this.cards.length - 1; i > 0; i--) {
	    let j = Math.floor(Math.random() * (i + 1));
	    [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
	  }
	}
}

function Team(teamId){
	this.teamId = teamId
	this.players = []
	this.score = 0
	this.points = 0
	this.hasBought = function(){
		for(p of this.players){
			if(p.bought != 0){
				return true
			}
		}
		return false
	}
}

function deal(deck, players, nrCards){
	console.log("dealing ---- ")
	// console.log(deck)
	// console.log(players)
	// console.log(pile)
	console.log(nrCards)
	
	if(nrCards == 5){
		deck.shuffle()
		for(p of players){
			for(var i = 0; i<5; i++){
				p.cards.push(deck.cards[0])
				deck.cards.shift()
			}
			// console.log("player  cards ", p.position)
			// console.log(p.cards)
			p.sortCards()
		}
		board.cards.push(deck.cards[0])
		deck.cards.shift()
	} else {
		for(p of players){
			if(p.position != board.dealer){
				for(var i = 0; i<3; i++){
					p.cards.push(deck.cards[0])
					deck.cards.shift()
				}
			} else {
				for(var i = 0; i<2; i++){
					p.cards.push(deck.cards[0])
					deck.cards.shift()
				}
				p.cards.push(board.cards[0])
				board.cards.shift()
			}
			p.sortCards()
			p.getDeclarations()
		}
		
	}


	
	if(board.dealer == 0){
		var turn = Math.floor(Math.random() * 4) + 1;
		for(p of players){
			if (p.position == turn){
				p.hasTurn = true
				board.dealer = p.position-1
				if(board.dealer<1){
					board.dealer = 4
				}
			}
		}
	}
	
	
	// console.log(board.cards)
	// console.log(deck.cards)
	
}

function resetRound(){
	// console.log("before reset")
	// console.log("deck")
	// console.log(deck.cards)
	// console.log(" ---- ")
	calculateScores()
	for(p of players){
		// console.log(p.cards)
		p.firstPass = false
		p.secondPass = false
		p.bought = 0
		p.useSeven = null
		p.declarations = []
		for(c of p.cards){
			deck.cards.push(c)
		}
		p.cards = []
	}
	deck.cards.push(board.cards[0])
	board.cards.shift()
	pile.empty(deck)


	board.passTurn()
	board.passDealer()
	// board.passTurn()

	// console.log("after reset")
	// console.log("board")
	// console.log(deck.cards)
		

}

function integrateDeclarations(){
	var highestDeclaration = 0
	var highestPosition = []
	var highestType = ""
	var highestCard = 0
	var highestLength = 0
	for(p of players){
		for(d of p.declarations){
			if(d.cards.length != 2){ //not bourlo
				if(d.getPoints()>highestDeclaration){
					highestDeclaration = d.getPoints()
					if(highestPosition.length == 0){
						highestPosition.push(p.position)
					} else {
						highestPosition = []
						highestPosition.push(p.position)
					}
					highestType = d.getType()
					highestCard = d.getHighCard()
					highestLength = d.cards.length
				} else if(d.getPoints() == highestDeclaration){
					if(d.getType() == highestType){ //if same type
						if(d.getHighCard() == highestCard){ //similar street
							// highestPosition.push(p.position)
							if(d.cards[0].suite == board.atou){
								highestDeclaration = d.getPoints()
								if(highestPosition.length == 0){
									highestPosition.push(p.position)
								} else {
									highestPosition = []
									highestPosition.push(p.position)
								}
								highestType = d.getType()
								highestCard = d.getHighCard()
								highestLengh = d.cards.length
							} else {
								if(d.cards.length > highestLength){
									highestDeclaration = d.getPoints()
									if(highestPosition.length == 0){
										highestPosition.push(p.position)
									} else {
										highestPosition = []
										highestPosition.push(p.position)
									}
									highestType = d.getType()
									highestCard = d.getHighCard()
									highestLengh = d.cards.length
								} else {
									highestPosition.push(p.position)
								}
							}
						} else if(d.getHighCard()>highestCard){
							highestDeclaration = d.getPoints()
							if(highestPosition.length == 0){
								highestPosition.push(p.position)
							} else {
								highestPosition = []
								highestPosition.push(p.position)
							}
							highestType = d.getType()
							highestCard = d.getHighCard()
							highestLengh = d.cards.length
						}
					} else {// not same type
						if(d.getType() == "carre"){ //carre beats street
							highestDeclaration = d.getPoints()
							if(highestPosition.length == 0){
								highestPosition.push(p.position)
							} else {
								highestPosition = []
								highestPosition.push(p.position)
							}
							highestType = d.getType()
							highestCard = d.getHighCard()
							highestLengh = d.cards.length
						}
					}
				}
			} else {
				teams[p.team-1].points += 20 //add 20 for bourlo
			}
		}
	}
	// console.log("highest position ", highestPosition[0])
	// console.log("highestpoint")
	if(highestPosition.length == 1){
		// console.log("highest position ", highestPosition[0])
		// console.log("highestpoints", highestDeclaration)
		var pos = 0
		var team = 0
		for(p of players){
			if(p.position == highestPosition){
				pos = p.position
				team = p.team
			}
		}
		for(p of players){
			if(p.team == team){
				for(d of p.declarations){
					teams[team-1].points += d.getPoints()
				}
			}
		}
	}
}

function calculateScores(){
	console.log("calculating scores ")
	console.log(teams[0].points, teams[1].points)
	// console.log(teams[0].hasBought())
	// console.log(teams[1].hasBought())
	let t1 = teams[0]
	let t2 = teams[1]
	integrateDeclarations()
	if(t1.hasBought() && t1.points < t2.points){
		t1.points = 0
		t2.score += (t2.points + t1.points)
	} else if(t2.hasBought() && t2.points < t1.points){
		t2.points = 0
		t1.score += (t2.points + t1.points)
	} else {
		for (t of teams){
			t.score += t.points
		}
	}
	io.sockets.emit("lastRoundScores", teams)
	t1.points = 0
	t2.points = 0
}

function getSuite(su){
	for(s in suites){
		if(suites[s] == su){
			return s
		}
	}
}

function isRoundEnd(){
	for(p of players){
		if(p.cards.length>0){
			return false
		}
	}
	return true
}

function getTurnPosition(){
	for(p of players){
		if(p.hasTurn){
			return p.position
		}
	}
}

function allPlayersPass(){
	for(p of players){
		if(!p.secondPass){
			return false
		}
	}
	return true
}

function togglePass(position){
	for(p of players){
  		if(p.position == position){
  			if(p.firstPass){
  				p.secondPass = true
  			} else {
  				p.firstPass = true
  			}
  		}
  	}
}

function toggleSeven(player){
	// console.log("toggle seven")
	// console.log(board.cards)
	// console.log(player.cards)
	for(c in player.cards){
		// console.log()
		var cc = player.cards[c]
		// console.log(cc)
		if(cc.suite == board.cards[0].suite && cc.number == 7){
			// console.log(" found kartela ", cc)
			board.cards.push(cc)
			player.cards.splice(c,1)
			player.cards.push(board.cards[0])
			board.cards.shift()
			break;
		}
	}
	// console.log("after")
	// console.log(board.cards)
	// console.log(player.cards)
}

function hasAnyoneBought(){
	for(p of players){
		if(p.bought != 0){
			return true
		}
	}
	return false
}

function allAnsweredSeven(){
  for(p of players){
    if(p.useSeven == null){
    	// console.log(p.position, " has not ans seven")
      return false
    } 
  }
  // console.log("all have ans seven")
  return true
}

cards = []
players = []
teams = []

numbers = {
	7: "7",
	8: "8",
	9: "9",
	10: "10",
	11: "J",
	12: "Q",
	13: "K",
	14: "A",
}
suites ={
	1: "H",
	2: "D",
	3: "C",
	4: "S"
}

valuesNormal = [7,8,9,11,12,13,10,14]
valuesAtou = [7,8,12,13,10,14,9,11]

scoresNormal = {
	7: 0,
	8: 0,
	9: 0,
	10: 10,
	11: 2,
	12: 3,
	13: 4,
	14: 11,
}
scoresAtou = {
	7: 0,
	8: 0,
	9: 14,
	10: 10,
	11: 20,
	12: 3,
	13: 4,
	14: 11,
}

for(n in numbers){
	for(s in suites){
		var c = new Card(Number(n), s)
		cards.push(c)
	}
}

var deck = new Deck(cards)
var board = new Board([])
var pile = new Pile()

// var p1 = new Player("player 1", 1, [])
// var p2 = new Player("player 2", 2, [])
// var p3 = new Player("player 3", 3, [])
// var p4 = new Player("player 4", 4, [])
// players.push(p1,p2,p3,p4)

// deal(deck, players)

// console.log("atou is ", suites[board.atou])





io.on('connection', function(socket){
  // console.log(socket.id)

  socket.on("newPlayer", function(data){
  	// console.log(data)
  	var playerName = data['name']
  	var position = players.length+1
  	var p = new Player(playerName, position, [], socket.id)
  	players.push(p)
  	if(players.length == 1 || players.length == 3){
  		p.team = 1
  	} else {
  		p.team = 2
  	}
  	socket.broadcast.emit("playerJoin", p)
  	socket.emit("joinSuccess", p)

  	if(players.length == 4){

  		deal(deck, players, 5)

  		

  		var t1 = new Team(1)
  		t1.players.push(players[0])
  		t1.players.push(players[2])
  		teams.push(t1)
  		var t2 = new Team(2)
  		t2.players.push(players[1])
  		t2.players.push(players[3])
  		teams.push(t2)

  		socket.broadcast.emit("turn", {
  			"position": getTurnPosition(),
  			"buy": !hasAnyoneBought()
  		})
  		socket.emit("turn", {
  			"position": getTurnPosition(),
  			"buy": !hasAnyoneBought()
  		})
  		
  		// socket.broadcast.emit("showBuy", getTurnPosition())
  		// socket.emit("showBuy", getTurnPosition())

  		socket.broadcast.emit("dealer", board.dealer)
  		socket.emit("dealer", board.dealer)

  		socket.broadcast.emit("gameStart")
  		socket.emit("gameStart")

  		// console.log("turn", getTurnPosition())
  		// socket.broadcast.emit("turn", getTurnPosition())
  		// socket.emit("turn", getTurnPosition())
  		// console.log(teams)
  	}
  })

  socket.on("updatePlayers", function(data){
  	socket.emit("updatePlayers", players)
  })

  socket.on("requestCards", function(data){
  	for (p of players){
  		if (p.socketId == socket.id){
  			socket.emit("getCards", p.cards)
  		}
  	}
  	socket.emit("getBoard", board.cards[0])
  })

  socket.on("makeMove", function(data){
  	// console.log("move requested")
  	// console.log(data)
  	var position = data.position
  	var number = data.number
  	var suite = data.suite
  	let player, card;
  	for(p of players){
  		if(p.position == position){
  			for(c of p.cards){
  				if(c.number == number && c.suite == suite){
  					success = board.makeMove(p,c)
  					if(success){
  						socket.emit("moveSuccess", {
  							'number': number,
  							'suite': suite,
  							'position': position
  						})
  						socket.broadcast.emit("moveSuccess", {
  							'number': number,
  							'suite': suite,
  							'position': position
  						})
  						// console.log("turn", getTurnPosition())
  						socket.emit("turn", {
				  			"position": getTurnPosition(),
				  			"buy": !hasAnyoneBought()
				  		})
  						socket.broadcast.emit("turn", {
				  			"position": getTurnPosition(),
				  			"buy": !hasAnyoneBought()
				  		})
  						if(board.cards.length == 0){ //trick has ended
  							socket.broadcast.emit("trickEnd")
  							socket.emit("trickEnd")
  						} 
  						if(isRoundEnd()){
  							// console.log("round end")
  							setTimeout(function(e){
  								resetRound()
  								deal(deck, players, 5)
								io.sockets.emit("dealer", board.dealer)
	  							io.sockets.emit("roundEnd")
	  							io.sockets.emit("turn", {
						  			"position": getTurnPosition(),
						  			"buy": !hasAnyoneBought()
						  		})
  								
  							}, 2000)
  							
  						}
  					} else {
  						socket.emit("moveFail")
  					}
  				}
  			}
  		}
  	}

  })

	socket.on("tradeSevenNo", function(data){
		// console.log("trade no", data)
		for(p of players){
			if (p.position == data){
				p.useSeven = false
			}
		}
		if(allAnsweredSeven()){
			deal(deck, players, 8)
			socket.emit("startRound")
			socket.broadcast.emit("startRound")
		}
	})

	socket.on("tradeSevenYes", function(data){
		// console.log("trade yes", data)
		for(p of players){
			if (p.position == data){
				p.useSeven = true
				toggleSeven(p)
			}
		}
		if(allAnsweredSeven()){
			deal(deck, players, 8)
			socket.emit("startRound")
			socket.broadcast.emit("startRound")
		}
	})

  socket.on("requestScores", function(data){
  	// console.log("scores req")
  	socket.emit("updateScores", teams)
  })
  

  socket.on("buySuite", function(data){
  	let position = data.position
  	let suiteStr = data.suite
  	let player;
  	let suite;
  	var firstToPlay = board.dealer+1
  	if(firstToPlay>4){
  		firstToPlay = 1
  	}
  	if(getTurnPosition() == position){
  		for(let s in suites){
	  		if(suites[s] == suiteStr){
	  			suite = s
	  		}
	  	}
	  	for(p of players){
	  		if(p.position == position){
	  			player = p
	  		}
	  	}
	  	if(!player.firstPass){
	  		if(suite == board.cards[0].suite){
	  			player.bought = suite
	  			board.setTurn(firstToPlay)
				board.atou = suite
			  	
			  	socket.emit("turn", {
		  			"position": getTurnPosition(),
		  			"buy": !hasAnyoneBought()
		  		})
				socket.broadcast.emit("turn", {
		  			"position": getTurnPosition(),
		  			"buy": !hasAnyoneBought()
		  		})
			  	io.sockets.emit("hasBought", {
			  		"position": position,
			  		"suite": suiteStr,
			  		"boardCard": board.cards[0],
			  		"seven": true
			  	})
	  		} else {
	  			console.log("suite doesnt match board, 1st buy round")
	  		}
	  	} else {
	  		if(suite != board.cards[0].suite){
	  			player.bought = suite
	  			board.setTurn(firstToPlay)
				board.atou = suite
			  	socket.emit("turn", {
		  			"position": getTurnPosition(),
		  			"buy": !hasAnyoneBought()
		  		})
				socket.broadcast.emit("turn", {
		  			"position": getTurnPosition(),
		  			"buy": !hasAnyoneBought()
		  		})
			  	io.sockets.emit("hasBought", {
			  		"position": position,
			  		"suite": suiteStr,
			  		"boardCard": board.cards[0],
			  		"seven": false
			  	})
			  } else {
			  	console.log("trying to buy first pass stuff")
			  }
	  	}
  	}
  	
  })

  socket.on("pass", function(data){
  	let position = data

  	togglePass(position)

  	if(allPlayersPass()){
  		board.passTurn()
  		board.passDealer()

  		resetRound()
  		deal(deck, players, 5)

  		// console.log(players[0].cards)

  		io.sockets.emit("turn", {
  			"position": getTurnPosition(),
  			"buy": !hasAnyoneBought()
  		})
  		io.sockets.emit("dealer", board.dealer)
  		io.sockets.emit("roundReset")
  	} else {
  		board.passTurn()
  		// board.passDealer()
  		socket.emit("turn", {
  			"position": getTurnPosition(),
  			"buy": !hasAnyoneBought()
  		})
		socket.broadcast.emit("turn", {
  			"position": getTurnPosition(),
  			"buy": !hasAnyoneBought()
  		})

	  	
  	}
	
  })

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});



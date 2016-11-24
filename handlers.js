$(document).ready(function(){

	$(".gameboard-number-own").on("click", function(ev){
		// console.log("asdas")
		if($(this).hasClass("selected")){
			$(this).removeClass("selected");
			selectedBlock = null;
		} else if(!$(this).hasClass("disabled")){
			if(selectedBlock != null){
				
				var prevIndex = $(selectedBlock).data("position");
				var nextIndex = $(this).data("position");
				
				var element1 = '.gameboard-number-own-'+prevIndex;
				var element2 = '.gameboard-number-own-'+nextIndex;
				animateSwap(element1, element2, true);
				$(selectedBlock).removeClass("selected");
				selectedBlock = null;
			} else {
				$(this).addClass("selected");
				selectedBlock = this;
			}
			
		}
	})

	$(".gameboard-number-opponent").on("click", function(ev){
		var opponentPosition = $(this).data("position");
		if(selectedBlock != null && $(selectedBlock).data("position") == opponentPosition){
			$(selectedBlock).removeClass("selected");
			var prevIndex = $(selectedBlock).data("position");
			var nextIndex = opponentPosition;
			
			animateTop(selectedBlock, opponentPosition, true);
			opponentBlock = ".gameboard-number-opponent-"+ opponentPosition;
			animateBottom(opponentBlock, opponentPosition, false);
			selectedBlock = null;
		}
	})

	$(".btn-connect").on('click', function(ev){
		if($.trim($(".input-nickname").val()) != ""){
			socket.emit("login", $.trim($(".input-nickname").val()));
			$(".login-box").hide();
			$(".waiting-for-player").removeClass("hidden");
		} else {
			alert("Please enter a nickname before connecting.");
		}
	})

	socket.on("startGame", function(opponentName){
		$(".opponent-name").removeClass("hidden");
		$(".opponent-name").html(opponentName);
		$(".own-name").html($(".input-nickname").val());
		$(".waiting-for-player").addClass("hidden");
	})

	socket.on("broadcast", function(message){
		console.log(message);
	})

	socket.on("board", function(board){
		console.log("board!")
		console.log(board);
		var len = board.length;
		for(i=0; i<len; i++){
			var classname = ".gameboard-number-own-"+i;
			$(classname).html(board[i]);
		}
		socket.emit("ready", "r");
	})

	socket.on("turnend", function(data){
		$.each($(".gameboard-number-own"), function(k,v){
			$(v).html(data[k]);
			$(v).addClass("disabled");
		});
		$(".player-turn").html("opponent's turn");
	})

	socket.on("turnstart", function(data){
		console.log(data);
		if(data != ""){
			if(data.move == "trade"){
				var myBlock = ".gameboard-number-own-"+data.index;
				var hisBlock = ".gameboard-number-opponent-"+data.index;
				animateTop(myBlock, data.index, false);
				animateBottom(hisBlock, data.index, data);

			}
			
		}
		
		$(".player-turn").html("your turn");
	})

	socket.on("wongame", function(data){
		alert(data);
	})


	
})



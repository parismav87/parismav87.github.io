var socket = io();
mouseUpTarget = null;
mouseDownTarget = null;
selectedBlock = null;
myBlockCoords = [];




function getBoardRect(){
	$.each($(".gameboard-number-own"), function(k,v){
		var rect = v.getBoundingClientRect();
		var object = {
			top: rect.top,
			left: rect.left,
			bottom: rect.bottom,
			right: rect.right,
			width: rect.width
		}		
		myBlockCoords[k] = object;

	})
	// console.log(myBlockCoords);
}

function animateTop(selectedBlock, opponentPosition, serverCall){
	var newElement = $(selectedBlock).eq(0).clone();
	var position = $(selectedBlock).offset();
	console.log(position);
	console.log("----");
	var margin = Number($(selectedBlock).css("marginTop").replace('px', ''));
	position.top -= margin;
	position.left -= margin;
	$(newElement).css({
		"position": "absolute"
	})
	$(newElement).css(position);
	$(newElement).appendTo("body");

	var opponentElementClassName = ".gameboard-number-opponent-"+ opponentPosition;
	var position2 = $(opponentElementClassName).offset();
	position2.top -= margin;
	position2.left -= margin;

	$(newElement).animate({
		left: position2.left,
		top: position2.top
	}, 1000, function(){
		//callback on animation end
		$(newElement).remove();
		if(serverCall == true){
			socket.emit("trademove", {
				previous: $(selectedBlock).data("position"),
				next: $(selectedBlock).data("position")
			})
		}
	})	
}


function animateBottom(selectedBlock, myPosition, serverData){
	var newElement = $(selectedBlock).eq(0).clone();
	var position = $(selectedBlock).offset();

	var margin = Number($(selectedBlock).css("marginTop").replace('px', ''));
	position.top -= margin;
	position.left -= margin;
	$(newElement).css({
		"position": "absolute"
	})
	$(newElement).css(position);
	$(newElement).appendTo("body");

	var opponentElementClassName = ".gameboard-number-own-"+ myPosition;
	var position2 = $(opponentElementClassName).offset();
	position2.top -= margin;
	position2.left -= margin;

	$(newElement).animate({
		left: position2.left,
		top: position2.top
	}, 1000, function(){
		//callback on animation end
		$(newElement).remove();
		if(serverData){
			$.each($(".gameboard-number-own"), function(k,v){
				$(v).removeClass("disabled");
				$(v).html(serverData["blocks"][k]);
			});
		}
	})	
}

function animateSwap(element1, element2, serverCall){
	var newElement = $(element1).eq(0).clone();
	var position = $(element1).offset();
	var newElement2 = $(element2).eq(0).clone();
	var position2 = $(element2).offset();



	var margin = Number($(element1).css("marginTop").replace('px', ''));
	position.top -= margin;
	position.left -= margin;
	position2.top -= margin;
	position2.left -= margin;
	$(newElement).css({
		"position": "absolute"
	})
	$(newElement).css(position);
	$(newElement).appendTo("body");

	$(newElement2).css({
		"position": "absolute"
	})
	$(newElement2).css(position2);
	$(newElement2).appendTo("body");

	var number1 = $(element1).html();
	var number2 = $(element2).html();

	$(newElement).animate({
		left: position2.left,
		top: position2.top
	}, 1000, function(){
		//callback on animation end
		$(element2).html(number1);
		$(newElement).remove();
	})	

	$(newElement2).animate({
		left: position.left,
		top: position.top
	}, 1000, function(){
		//callback on animation end
		$(element1).html(number2);
		$(newElement2).remove();
		if(serverCall == true){
			socket.emit("swapmove", {
				previous: $(element1).data("position"),
				next: $(element2).data("position")
			})
		}
		
	})	

}

















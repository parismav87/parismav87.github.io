$(document).ready(function(){
	generateCharts()
	generateBars()
	getUsers()

	$(".startbutton").on("click", function(evt){
		if(!$(this).hasClass("startbutton-active")){
			$(this).addClass("startbutton-active")
			$(".stopbutton").removeClass("stopbutton-active")
			startStream()
		}
	})

	$(".btn-send-message").on("click", function(evt){
		sendMessage($(".custommessage").val())
	})

	$("body").on("click", ".dropdown-item-users", function(evt){
		var fullName = $(this).text()
		$(".select-user-name").text(fullName)
		$.each($(".dropdown-item-users"), function(k,v){
			$(v).removeClass("dropdown-item-users-selected")
		})
		$(this).addClass("dropdown-item-users-selected")
		participantID = $(this).data("id")
		// console.log(participantID)
		var imageURL = $(this).data("image")
		// console.log(imageURL)
		if(imageURL!="undefined"){
			$(".avatar").attr("src", imageURL)
		} else {
			$(".avatar").attr("src", "avatar.png")
		}
	})

	$(".resetbutton").on("click", function(evt){
		if(!$(".startbutton").hasClass("startbutton-active")){
			resetSession()
		}
	})
	
	$(".stopbutton").on("click", function(evt){
		if(!$(this).hasClass("stopbutton-active")){
			$(this).addClass("stopbutton-active")
			var d = new Date();
			sessionEnd = d.getTime();
			clearInterval(serverCallsInterval);
			$(".startbutton").removeClass("startbutton-active")
		} 
	})

	$(".savebutton").on("click", function(evt){
		if(participantID != null){
			saveSession(sessionStart, sessionEnd, participantID)
		} else {
			alert("Please select a user.")
		}
		
	})

	$(".btn-slow").on("click", function(evt){
		changeGameSpeed(0)
	})

	$(".btn-normal").on("click", function(evt){
		changeGameSpeed(50)
	})

	$(".btn-rapid").on("click", function(evt){
		changeGameSpeed(100)
	})

	$(".btn-light").on("click", function(evt){
		changeInfoLoad(0)
	})

	$(".btn-medium").on("click", function(evt){
		changeInfoLoad(50)
	})

	$(".btn-heavy").on("click", function(evt){
		changeInfoLoad(100)
	})

	$(".btn-purple").on("click", function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$(this).addClass('btn-purple-active').siblings().removeClass('btn-purple-active');
	})

	$(".modal-save").on("click", function(evt){
		filter = $(".measurements-per-minute").val()
		chartRange = $(".chart-range").val() * 60000 // millis
		// serverInterval = $(".server-interval").val() * 1000 //millis
		// participantID = $(".participant-id").val()
		// if($(".startbutton").hasClass("startbutton-active")){
		// 	startStream()
		// }
		// console.log(filter, chartRange, serverInterval)
	})

})
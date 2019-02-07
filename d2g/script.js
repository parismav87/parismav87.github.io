$(document).ready(function(){
	generateCharts()
	generateBars()

	$(".startbutton").on("click", function(evt){
		if(!$(this).hasClass("startbutton-active")){
			$(this).addClass("startbutton-active")
			$(".stopbutton").removeClass("stopbutton-active")
			startStream()
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
			clearInterval(serverCallsInterval);
			$(".startbutton").removeClass("startbutton-active")
		} 
	})

	$(".savebutton").on("click", function(evt){
		if(participantID != null){
			var d = new Date();
			sessionEnd = d.getTime(); //save session startTime
			saveSession(sessionStart, sessionEnd, participantID)
		} else {
			alert("Please specify participant ID in the settings page before saving.")
		}
		
	})

	$(".btn-purple").on("click", function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$(this).addClass('btn-purple-active').siblings().removeClass('btn-purple-active');
	})

	$(".modal-save").on("click", function(evt){
		filter = $(".measurements-per-minute").val()
		chartRange = $(".chart-range").val() * 60000 // millis
		serverInterval = $(".server-interval").val() * 1000 //millis
		participantID = $(".participant-id").val()
		if($(".startbutton").hasClass("startbutton-active")){
			startStream()
		}
		// console.log(filter, chartRange, serverInterval)
	})

})
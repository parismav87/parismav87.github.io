$(document).ready(function(){
	var server = "NA1"
	var summoner = ""

	$("#sortable").sortable({
		helper: true,
		tolerance: "pointer"
	})

	$("#button-search").on("click", function(evt){
		evt.preventDefault();
		summoner = $("#page-1-name-input").val();
		if(summoner!=""){
			$("#page1").addClass("invisible").removeClass("visible");
			$("#page2").addClass("visible").removeClass("invisible");
			magic(summoner, server)
		}
	})

	$("#page2-button-back").on("click", function(evt){
		$("#page2").addClass("invisible").removeClass("visible");
		$("#page1").addClass("visible").removeClass("invisible");
		$("#bottom-analyze").removeClass("invisible")
	})

	$("#page-1-server-select").on("change", function(evt){
		server = $(this).val();
	})

	$("#page-1-name-input").on("keypress", function(evt){
		var code = evt.keyCode || e.which
		if (code==13){
			$("#button-search").trigger("click")
		}
	})

	$("#button-analyze").on("click", function(evt){
		$(".summoner").each(function(el){
			var summonerID = $(this).data("summonerid")
			console.log(summonerID)
			getPlayerAccountId(server, summonerID)
		})
		$("#bottom-analyze").addClass("invisible")
	})










































})
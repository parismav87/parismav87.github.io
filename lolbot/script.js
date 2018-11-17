$(document).ready(function(){
	var server = "NA1"
	var summoner = ""
	var apiKey = "RGAPI-a70a758c-984b-4b09-bda0-990b65633475"

	$("#button-search").on("click", function(evt){
		evt.preventDefault();
		summoner = $("#page-1-name-input").val();
		if(summoner!=""){
			$("#page1").addClass("invisible").removeClass("visible");
			$("#page2").addClass("visible").removeClass("invisible");
			magic(summoner, server, apiKey)
		}
	})

	$("#page2-button-back").on("click", function(evt){
		$("#page2").addClass("invisible").removeClass("visible");
		$("#page1").addClass("visible").removeClass("invisible");
	})

	$("#page-1-server-select").on("change", function(evt){
		server = $(this).val();
	})












































})
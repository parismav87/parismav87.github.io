function magic(summoner, server, apiKey){
	var url = "https://"+server+".api.riotgames.com/lol/summoner/v3/summoners/by-name/summoner?api_key="+apiKey
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data);
		}
	})
}
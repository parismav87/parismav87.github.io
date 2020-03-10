var gameLimit = 1

var summonerSpells = {

}

function magic(summoner, server){
	var url = "http://localhost:3000/mpe?https://"+server+".api.riotgames.com/lol/summoner/v3/summoners/by-name/"+summoner
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data);
			var summonerID = data["body"]["id"]
			getActiveGame(server, summonerID)
		}
	})
}



function getActiveGame(server, summonerID){
	var url = "http://localhost:3000/mpe?https://"+server+".api.riotgames.com/lol/spectator/v3/active-games/by-summoner/"+summonerID
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data);
			var matchID = data["body"]["gameId"]
			// getMatch(server, matchID)
			var opponents = getPlayerOpponents(data, summonerID)
			console.log(opponents)
			perPlayerData(server, opponents)
		}
	})
}

function getPlayerOpponents(data, summonerID){
	var teamId = -1
	var opponents = []
	var participants = data["body"]["participants"]
	for (part in participants){
		if(participants[part]["summonerId"] == summonerID){
			teamId = participants[part]["teamId"]
		}
	}

	for (part in participants){
		if (participants[part]["teamId"] != teamId){
			opponents.push(participants[part])
		}
	}
	return opponents
}



function perPlayerData(server, opponents){
	for(op in opponents){
		var summonerID = opponents[op]["summonerId"]
		// console.log(summonerID)
		// getPlayerAccountId(server, summonerID)
		fillPlayerName(op, opponents)
		fillPlayerChampionName(op, opponents)
		fillSummonerSpells(op, opponents)
		fillSummonerID(op, opponents, summonerID)
	}
}

function fillPlayerName(op, opponents){
	var k = parseInt(op)+1
	$(".summoner-"+k+"-player-name").html(opponents[op]["summonerName"])
}

function fillPlayerChampionName(op, opponents){
	var championId = opponents[op]["championId"]
	var url = "http://localhost:3000/champion?championId="+championId

	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data["body"]["championName"])
			var k = parseInt(op)+1
			$(".summoner-"+k+"-hero-name").html(data["body"]["championName"])
			$("#summoner-"+k+"-champion-img").attr("src", "http://ddragon.leagueoflegends.com/cdn/8.23.1/img/champion/"+data["body"]["championName"]+".png")
		}
	})
}

function fillSummonerSpells(op, opponents){
	var spell1 = opponents[op]["spell1Id"]
	var spell2 = opponents[op]["spell2Id"]
	var url = "http://localhost:3000/summoner?spell1Id="+spell1+"&spell2Id="+spell2

	$.ajax({
		type: "GET",
		url: url,
		data: {
			"masteries": opponents[op]['perks']['perkIds']
		},
		success: function(data){
			console.log(data["body"])
			var k = parseInt(op)+1
			$("#summoner-"+k+"-spell-1").attr("src", data["body"]["summoner1Icon"])
			$("#summoner-"+k+"-spell-2").attr("src", data["body"]["summoner2Icon"])
			$("#summoner-"+k+"-spell-key").attr("src", data["body"]["keystone"])
			// $("#summoner-"+k+"-champion-img").attr("src", "http://ddragon.leagueoflegends.com/cdn/8.23.1/img/champion/"+data["body"]["championName"]+".png")
		}
	})
}

function fillSummonerID(op, opponents, summonerID){
	var k = parseInt(op)+1
	$("#summoner-"+k).data("summonerid", summonerID)
}

function getPlayerAccountId(server, summonerID){
	var url = "http://localhost:3000/mpe?https://"+server+".api.riotgames.com/lol/summoner/v3/summoners/"+summonerID
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data);
			var accountID = data["body"]["accountId"]
			// console.log(accountID)
			getMatchList(server, accountID)
		}
	})
}

function getMatchList(server, accountID){
	var url = "http://localhost:3000/mpe?https://"+server+".api.riotgames.com/lol/match/v3/matchlists/by-account/"+accountID
	// console.log(url)
	$.ajax({
		type: "GET",
		url: url,
		data: {
			"endIndex": gameLimit,
			"queue": 420
		},
		success: function(data){
			console.log(data);
			perMatchData(server, data["body"])
			// var accountID = data["body"]["accountId"]
			// console.log(accountID)
			// getMatchList(server, accountID)
		}
	})
}

function perMatchData(server, data){
	var matches = data["matches"]
	for(m in matches){
		matchID = matches[m]["gameId"]
		getMatch(server, matchID)
	}
}

function getMatch(server, matchID){
	var url = "http://localhost:3000/mpe?https://"+server+".api.riotgames.com/lol/match/v3/matches/"+matchID
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			console.log(data);
		}
	})
}

	
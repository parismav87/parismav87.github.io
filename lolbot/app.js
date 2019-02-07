const express = require('express')
const https = require('https')
const request = require('request');
const fs = require('fs');
const app = express()
const port = 3000
const apiKey = "RGAPI-d85831f7-e454-4a29-b7a0-883624428a61"
const querystring = require('querystring');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var champions = JSON.parse(fs.readFileSync('champion.json', 'utf8'));
var summoners = JSON.parse(fs.readFileSync('summoner.json', 'utf8'));
var runes = JSON.parse(fs.readFileSync('runesReforged.json', 'utf8'));


var keystones = []
keystones = keystones.concat(runes[0]["slots"][0]["runes"][0]["id"])
for(r in runes){
	for(rr in runes[r]["slots"][0]["runes"]){
			keystones.push({
				"id" : runes[r]["slots"][0]["runes"][rr]["id"],
				"icon": runes[r]["slots"][0]["runes"][rr]["icon"]
		})
	}
}
// console.log(keystones)

app.get('/champion', function(req, res){
	var url = req.url
	// console.log(url)
	var code = url.split("=")[1]
	for(c in champions["data"]){
		if (champions["data"][c]["key"] == code){
			rez = {
				"body": {
					"championCode": code,
					"championName": c
				},
				"statusCode": 200
			}
			res.send(rez)
		}
	}
})

app.get('/summoner', function(req, res){
	var url = req.url
	// console.log(url)
	// console.log(req.url)
	var spells = querystring.parse(url.split("?")[1])
	// console.log(spells)
	var link1 = ""
	var link2 = ""
	var keystone = ""
	var keystoneLink = ""

	// console.log(spells)
	for(s in summoners["data"]){
		if (summoners["data"][s]["key"] == spells["spell1Id"]){
			link1 = "http://ddragon.leagueoflegends.com/cdn/8.23.1/img/spell/"+summoners["data"][s]["image"]["full"]
		} else if (summoners["data"][s]["key"] == spells["spell2Id"]){
			link2 = "http://ddragon.leagueoflegends.com/cdn/8.23.1/img/spell/"+summoners["data"][s]["image"]["full"]
		}
	}
	var kss = spells["masteries[]"]
	var ksCode = ""
	// console.log(kss)
	// console.log(keystones)
	for (k in kss){
		for(kk in keystones){
			if (kss[k] == keystones[kk]["id"]){
				keystone = keystones[kk]["id"]
				keystoneLink = "https://ddragon.leagueoflegends.com/cdn/img/" + keystones[kk]["icon"]
			}
		}			
	}
	

	rez = {
		"body": {
			"summonerCodes": spells,
			"summoner1Icon": link1,
			"summoner2Icon": link2,
			"keystone": keystoneLink
		},
		"statusCode": 200
	}
	res.send(rez)
})



app.get('/mpe', function (req, res) {
	var url = req.url;
	var separator = "?"
	var riotUrl = url.split("?")[1]
	// console.log("---", riotUrl)
	if(riotUrl.includes("&")){
		riotUrl = riotUrl.replace("&", "?")
		separator = "&"
	}
	var finalUrl = riotUrl + separator +"api_key="+apiKey
	console.log(finalUrl);
	// var options = new URL(riotUrl)
   	// res.send(riotUrl);
   	request.get(
	    finalUrl,
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	        	rez = {
	        		"body": JSON.parse(body),
	        		"statusCode": response.statusCode
	        	}
	        	// console.log(rez)
	            res.send(rez)
	        } else {
	        	rez = {
	        		"body": JSON.parse(body),
	        		"statusCode": response.statusCode 
	        	}
	        	res.send(rez)
	        }
	    }
	);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
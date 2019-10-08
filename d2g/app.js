const express = require('express');
const fs = require('fs');
const app = express()
const port = 3000
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const csv = require("fast-csv");
const stomp = require('stompjs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// client2 = stomp.overWS('ws://localhost:61623');
// client2.connect('admin', 'password', function(succ){

// })

var client = stomp.overWS('ws://localhost:61623');
client.connect('admin', 'password', function(succ){
	console.log("Connected to Scorm.")
	var adviceSubscription = client.subscribe("/topic/advice", function(msg){
		if(msg.body){
			parseAdviceMessage(msg.body)
		} else {
			console.log("received empty message")
		}
	})

	var dilemmaSubscription = client.subscribe("/topic/dilemmas", function(msg){
		if(msg.body){
			parseDilemmaMessage(msg.body)
		} else {
			console.log("received empty message")
		} 
	})

	var gameSubscription = client.subscribe("/topic/game", function(msg){
		if(msg.body){
			parseGameMessage(msg.body)
		} else {
			console.log("received empty message")
		}
	})

	var infoSubscription = client.subscribe("/topic/infos", function(msg){
		if(msg.body){
			parseInfoMessage(msg.body)
		} else {
			console.log("received empty message")
		}
	})
});


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/data2gameDB", {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Conntected To Mongo Database');
});

var sessionSchema = new mongoose.Schema({
  	startTime: Number,
  	endTime: Number,
  	participantID: String,
  	sensorData: {
  		heartRate: [{timestamp: Number, value: Number}],
  		skinConductance: [{timestamp: Number, value: Number}]
  	},
  	gameData: [{timestamp: Number, value: Number, gameDataType: String, payload: String}],
  	adaptations: [{timestamp: Number, value: String, adaptationType: String}]
});

var Session = mongoose.model("Session", sessionSchema, "sessions");

var userSchema = new mongoose.Schema({
  	firstName: String,
  	middleName: String,
  	lastName: String,
  	participantID: String,
  	age: Number,
  	gender: String,
  	imageURL: String
});

var User = mongoose.model("User", userSchema, "users");

demo = true
heartRate = []
skinConductance = []
messageCounter = 2
adaptations = []
gameLogs = []
gameData = {}

fs.readFile('dilemmas.json', 'utf8', function (err, data) {
  if (err) throw err;
  gameData = JSON.parse(data)
  // console.log(dilemmas)
});


if(demo){
	var count = 0
	var now = new Date().getTime()
	csv.fromPath("sample.csv")
		.on("data", function(data){
			if(count >2){
				count+=1
				d = data[0].split("\t");
				// console.log(d)
		   		var s = d[4]
		   		var h = d[5]
		   		sc = {
		   			"timestamp": now,
		   			"value": (parseFloat(s)/1000) + parseFloat(Math.random()*10)
		   		}
		   		hr = {
		   			"timestamp": now,
		   			"value": parseFloat(h)
		   		}
		   		skinConductance.push(sc)
		   		heartRate.push(hr)
		   		now+=20	
		} else {
				count+=1
				// console.log(data[0].split("\t"))
			}
	 	})
	 	.on("end", function(){
	     	console.log("done loading demo data");
 	});
}


app.post('/sendMessage', function(req,res){
	response = {}
	var msg = req.body.message
	console.log(msg)
	client.send('/topic/ddm', {}, JSON.stringify({"busMessageType": "changeMessageText", "messageRef": "MESSAGE_tutor_0", "text": msg,  "operator": "set"}))
	client.send('/topic/ddm', {}, JSON.stringify({"busMessageType": "changeIndicatorValue", "indicatorRef": "INDICATOR_tutorMessage", "value": messageCounter, "operator": "set"}))
	response['statusCode'] = 200
	response['success'] = true
	messageCounter+=1
	var now = new Date().getTime()
	adaptations.push({
		"timestamp": now,
		"value": msg,
		"adaptationType": "CUSTOM_MESSAGE"
	})
	res.send(response)
})

app.post('/changeGameSpeed', function(req,res){
	response = {}
	var speed = parseInt(req.body.gameSpeed)
	client.send('/topic/ddm', {}, JSON.stringify({"busMessageType": "changeIndicatorValue", "indicatorRef": "INDICATOR_gameSpeed", "value": speed, "operator": "set"}))
	response['statusCode'] = 200
	response['success'] = true
	var now = new Date().getTime()
	adaptations.push({
		"timestamp": now,
		"value": speed,
		"adaptationType": "GAME_SPEED"
	})
	res.send(response)
})

app.post('/changeInfoLoad', function(req,res){
	response = {}
	var infoLoad = parseInt(req.body.infoLoad)
	client.send('/topic/ddm', {}, JSON.stringify({"busMessageType": "changeIndicatorValue", "indicatorRef": "INDICATOR_infoLoad", "value": infoLoad, "operator": "set"}))
	response['statusCode'] = 200
	response['success'] = true
	var now = new Date().getTime()
	adaptations.push({
		"timestamp": now,
		"value": infoLoad,
		"adaptationType": "INFO_LOAD"
	})
	res.send(response)
})


app.post('/newUser', function(req, res){
	var response = {}
	if(typeof(req.body.participantID)=="undefined"){
		response.statusCode = 400
		response.success = false
		res.send(response)
		return
	} else {
		// console.log(req.body.data)
		var fname = req.body.firstName
		var mname = req.body.middleName
		var lname = req.body.lastName
		var age = req.body.age
		var gender = req.body.gender
		var participantID = req.body.participantID
		var imageURL = req.body.imageURL

		var user = {
			"firstName": fname,
			"middleName" : mname,
			"lastName" : lname,
			"age": age,
			"gender": gender,
			"participantID": participantID,
			"imageURL": imageURL
		}

		// console.log(session)

		var u = new User(user);
	 	u.save()
		    .then(item => {
		      	response.statusCode = 200
				response.success = true
				res.send(response)
		    })
		    .catch(err => {
		      	response.statusCode = 400
				response.success = false
				res.send(response)
		    });
	}
	

})

app.get('/getUsers', function(req, res){
	// console.log("trying to get users")
	response = {}
	var query = {}

	User.find(query, function(err, data){
        // console.log(data); 
        response["statusCode"] = 200
        response["success"] = true
        response["data"] = data
        res.send(response)
    })
})

app.get('/getSC', function(req, res){

	var response = {
		'data': []
	}
	if((typeof(req.header('startTime'))!="undefined" && isNaN(parseInt(req.header('startTime')))) || (typeof(req.header('endTime'))!="undefined" && isNaN(parseInt(req.header('endTime'))))){
		response.statusCode = 400
		response.success = false
		res.send(response)
		return
	}

	var startTime = parseInt(req.header('startTime'))
	var endTime = parseInt(req.header('endTime'))
	var filter = parseInt(req.header('filter'))
	

	if(!startTime){
		startTime = 0
	}
	if(!endTime){
		endTime = 9999999999999999
	}

	previousTimestamp = 0
	millisBetweenMeasurements = 0
	temp = []
	if(typeof(filter)!="undefined" && !isNaN(filter)){
		// console.log("applying filter")
		millisBetweenMeasurements = 60000/filter
	}

	for(let sc of skinConductance){
		// console.log(sc['timestamp'])
		// console.log(previousTimestamp)
		if(sc['timestamp']>=startTime && sc['timestamp']<=endTime && sc['timestamp']<previousTimestamp+millisBetweenMeasurements){			
			// response.data.push(sc)
			// previousTimestamp = sc['timestamp']
			temp.push(sc['value'])
			// console.log("pushing: ", sc['value'])
		} else if(sc['timestamp']>=startTime && sc['timestamp']<=endTime && sc['timestamp']>=previousTimestamp+millisBetweenMeasurements){
			if(previousTimestamp == 0){
				previousTimestamp = sc['timestamp']
				temp.push(sc['value'])
				// console.log("pushing: ", sc['value'])
			} else {
				response.data.push({
					timestamp: sc['timestamp'],
					value: mean(temp)
				})
				// console.log("average: ", mean(temp))
				previousTimestamp = sc['timestamp']
				temp = []
				temp.push(sc['value']) //push the first value of the new set
			}
		}
	}
	response.statusCode = 200
	response.success = 'true'
	res.send(response)
})

app.get('/getHR', function(req, res){

	if((typeof(req.header('startTime'))!="undefined" && isNaN(parseInt(req.header('startTime')))) || (typeof(req.header('endTime'))!="undefined" && isNaN(parseInt(req.header('endTime'))))){
		response.statusCode = 400
		response.success = false
		res.send(response)
		return
	}
	var response = {
		'data': []
	}
	// console.log(req.header('startTime'))	
	// console.log(skinConductance)
	var startTime = parseInt(req.header('startTime'))
	var endTime = parseInt(req.header('endTime'))
	var filter = parseInt(req.header('filter'))
	

	
	if(!startTime){
		startTime = 0
	}
	if(!endTime){
		endTime = 9999999999999999
	}

	previousTimestamp = 0
	millisBetweenMeasurements = 0
	temp = []
	if(typeof(filter)!="undefined" && !isNaN(filter)){
		// console.log("applying filter")
		millisBetweenMeasurements = 60000/filter
	}

	for(let hr of heartRate){
		// console.log(sc['timestamp'])
		// console.log(previousTimestamp)
		if(hr['timestamp']>=startTime && hr['timestamp']<=endTime && hr['timestamp']<previousTimestamp+millisBetweenMeasurements){			
			// response.data.push(sc)
			// previousTimestamp = sc['timestamp']
			temp.push(hr['value'])
			// console.log("pushing: ", sc['value'])
		} else if(hr['timestamp']>=startTime && hr['timestamp']<=endTime && hr['timestamp']>=previousTimestamp+millisBetweenMeasurements){
			if(previousTimestamp == 0){
				previousTimestamp = hr['timestamp']
				temp.push(hr['value'])
				// console.log("pushing: ", sc['value'])
			} else {
				response.data.push({
					timestamp: hr['timestamp'],
					value: mean(temp)
				})
				// console.log("average: ", mean(temp))
				previousTimestamp = hr['timestamp']
				temp = []
				temp.push(hr['value']) //push the first value of the new set
			}
		}
	}
	response.statusCode = 200
	response.success = 'true'
	res.send(response)
})

app.get('/gameData', function(req, res){
	var response = {
		'data': gameData,
		'statusCode': 200,
		'success': true
	}
	res.send(response)
})

app.get('/resetSession', function(req, res){
	resetSession()
	response = {}
	response.statusCode = 200
	response.success = true
	res.send(response)
})

app.get('/baseline', function(req, res){
	response = {}
	data = {}
	temphr = []
	tempsc = []
	if(heartRate.length == 0 || skinConductance.length == 0){
		response.statusCode = 400
		response.success = false
		response.data = data
		res.send(response)
		return
	}

	for(let hr of heartRate){
		temphr.push(hr["value"])
	}

	for(let sc of skinConductance){
		tempsc.push(sc["value"])
	}

	data["hrbaseline"] = mean(temphr)
	data["scbaseline"] = mean(tempsc)

	// resetSession()

	response.statusCode = 200
	response.success = true
	response.data = data
	res.send(response)

})

app.get('/saveSession', function(req, res){
	var response = {}
	if(typeof(req.header('startTime'))=="undefined" || isNaN(parseInt(req.header('startTime'))) || typeof(req.header('endTime'))=="undefined" || isNaN(parseInt(req.header('endTime'))) || typeof(req.header('participantID'))=="undefined"){
		response.statusCode = 400
		response.success = false
		res.send(response)
		return
	}

	var startTime = parseInt(req.header('startTime'))
	var endTime = parseInt(req.header('endTime'))
	var participantID = req.header('participantID')

	var session = {
		"startTime": startTime,
		"endTime" : endTime,
		"participantID" : participantID,
		"sensorData": {
			"heartRate": heartRate,
			"skinConductance": skinConductance
		},
		"gameData": gameLogs,
		"adaptations": adaptations
	}

	// console.log(session)
	var now = new Date().getTime()
	var sessionName = 'session-' + now + '.json'
	fs.writeFile(sessionName, JSON.stringify(session),'utf8', function(err){
		if (err) throw err;
	    console.log('saved session log');
	})

	var s = new Session(session);
 	s.save()
	    .then(item => {
	    	resetSession()

	      	response.statusCode = 200
			response.success = true
			res.send(response)
	    })
	    .catch(err => {
	    	// console.log(err)
	      	response.statusCode = 400
			response.success = false
			res.send(response)
	    });
})


app.get('/getSessions', function(req, res){
	response = {}
	if((typeof(req.header('startTime'))!="undefined" && isNaN(parseInt(req.header('startTime')))) || (typeof(req.header('endTime'))!="undefined" && isNaN(parseInt(req.header('endTime')))) || (typeof(req.header("participantID")) == "undefined" && typeof(req.header("sessionID")) == "undefined" )){
		response.statusCode = 400
		response.success = false
		res.send(response)
		return
	}

	var startTime = parseInt(req.header('startTime'))
	var endTime = parseInt(req.header('endTime'))
	var participantID = req.header('participantID')
	var query = {}
	query["participantID"] = participantID


	if(typeof(req.header("sessionID"))!= "undefined"){
		Session.findById(req.header("sessionID"), function(err, data){
            // console.log(data); 
            response["statusCode"] = 200
            response["success"] = true
            response["data"] = data
            res.send(response)
	    });
	} else {
		if(typeof(req.header("startTime")) != "undefined"){
			query["startTime"] = {$gte: startTime}
		}

		if(typeof(req.header("endTime")) != "undefined"){
			query["endTime"] = {$lte: endTime}
		}

		console.log(query)
		Session.find(query, function(err, data){
            // console.log(data); 
            response["statusCode"] = 200
            response["success"] = true
            response["data"] = data
            res.send(response)
	    });
	}
})


app.post('/postSC', function(req, res){
	var response = {}
	// console.log(req.body)
	for(let sc of req.body.data){
		if(typeof sc.timestamp == "undefined" || typeof sc.value == "undefined" || isNaN(sc.timestamp) || isNaN(sc.value)){
			response.statusCode = 400
			response.success = 'false'
			res.send(response)
			return
		} else {
			skinConductance.push({
				"timestamp": sc.timestamp,
				"value": sc.value
			})
		}		
	}
	response.statusCode = 200
	response.success = 'true'
	res.send(response)
})

app.post('/postHR', function(req, res){
	var response = {}
	for(let hr of req.body.data){
		if(typeof hr.timestamp == "undefined" || typeof hr.value == "undefined" || isNaN(hr.timestamp) || isNaN(hr.value)){ 
			response.statusCode = 400
			response.success = 'false'
			res.send(response)
			return
		} else {
			heartRate.push({
				"timestamp": hr.timestamp,
				"value": hr.value
			})
		}
	}
	response.statusCode = 200
	response.success = 'true'
	res.send(response)
})

app.listen(port, () => console.log(`Data2Game backend listening on port ${port}!`))



function mean(table){
	sum = 0.0
	l = table.length
	for(let t of table){
		sum+= t
	}
	return sum/l
}

function resetSession(){
	heartRate = []
	skinConductance = []
	messageCounter = 2
	adaptations = []
}

function parseAdviceMessage(msg){
	console.log(msg)
	var now = new Date().getTime()
	var obj = {
		"timestamp": now,
		"value": parseInt(msg),
		"gameDataType": "ADVICE_REQUESTED",
		"payload": null
	}
	gameLogs.push(obj)

	for(var d in gameData.dilemmas){
		// console.log(d)
		if(gameData.dilemmas[d].dilemmaId == parseInt(msg)){
			// console.log(dilemmas[d].title)
			gameData.dilemmas[d].timesAdviceRequested +=1
			gameData.dilemmas[d].adviceRequested = true
		}
	}
}

function parseDilemmaMessage(msg){
	// console.log(msg)
	var now = new Date().getTime()
	console.log(msg + "--" + now)
	if(msg.includes("ANSWER")){ // example: ANSWER_1_YES
		var dilemmaid = msg.split("_")[1]
		var answer = msg.split("_")[2]
		var obj = {
			"timestamp": now,
			"value": parseInt(dilemmaid),
			"gameDataType": "DILEMMA_ANSWERED",
			"payload": answer
		}
		gameLogs.push(obj)
		for(var d in gameData.dilemmas){
			// console.log(d)
			if(gameData.dilemmas[d].dilemmaId == parseInt(dilemmaid)){
				// console.log(dilemmas[d].title)
				gameData.dilemmas[d].answer = answer
				gameData.dilemmas[d].answered =  true
				gameData.dilemmas[d].duration = (now - gameData.dilemmas[d].start) /1000 //millis to seconds
			}
		}
		// console.log(gameData.dilemmas)
	} else if(msg.includes("START")){ //example: START_1
		var dilemmaid = msg.split("_")[1]
		var obj = {
			"timestamp": now,
			"value": parseInt(dilemmaid),
			"gameDataType": "DILEMMA_START",
			"payload": null
		}
		gameLogs.push(obj)
		for(var d in gameData.dilemmas){
			// console.log(d)
			if(gameData.dilemmas[d].dilemmaId == parseInt(dilemmaid)){
				// console.log(dilemmas[d].title)
				gameData.dilemmas[d].started = true
				gameData.dilemmas[d].start= now
			}
		}
		// console.log(gameData.dilemmas)
	}
}

function parseGameMessage(msg){
	// console.log(msg)
	var now = new Date().getTime()
	console.log(msg + "--" + now)
	if(msg.includes("START")){
		var obj = {
			"timestamp": now,
			"value": 0,
			"gameDataType": "GAME_START",
			"payload": null
		}
		gameLogs.push(obj)
		gameData.gameStart = now
	} else { //game end
		var obj = {
			"timestamp": now,
			"value": 0,
			"gameDataType": "GAME_END",
			"payload": null
		}
		gameLogs.push(obj)
		gameData.gameEnd = now
		console.log(gameData)
	}

}

function parseInfoMessage(msg){
	console.log(msg)
	var now = new Date().getTime()
	var msgArr = msg.split("_") // example: READ_1_1
	var dilemmaId = parseInt(msgArr[1])
	var infoId = parseInt(msgArr[2])

	for(var d in gameData.dilemmas){
		if(gameData.dilemmas[d].dilemmaId == dilemmaId){
			// console.log(dilemmas[d].title)
			var dil = gameData.dilemmas[d]
			for(var i in dil.infos){
				if(dil.infos[i].infoId == infoId){
					var obj = {
						"timestamp": now,
						"value": infoId,
						"gameDataType": "INFO_READ",
						"payload": null
					}
					gameLogs.push(obj)
					dil.infos[i].read = true
					dil.infos[i].timesRead +=1
				}
			}
		}
	}

}
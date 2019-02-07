const express = require('express')
const fs = require('fs');
const app = express()
const port = 3000
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const csv = require("fast-csv");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/data2gameDB", {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Conntected To Mongo Database');
});

var schema = new mongoose.Schema({
  	startTime: Number,
  	endTime: Number,
  	participantID: String,
  	sensorData: {
  		heartRate: [{timestamp: Number, value: Number}],
  		skinConductance: [{timestamp: Number, value: Number}]
  	},
  	gameData: [{timestamp: Number, value: Number}],
  	adaptations: [{timestamp: Number, value: Number}]
});

var Session = mongoose.model("Session", schema, "sessions");

demo = true
heartRate = []
skinConductance = []

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
		   			"value": parseFloat(s)/1000
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

app.get('/resetSession', function(req, res){
	resetSession()
	response = {}
	response.statusCode = 200
	response.success = true
	res.send(response)
})

app.get('/saveSession', function(req, res){
	// console.log(req.header('startTime'))	
	// console.log(skinConductance)
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
		"gameData": heartRate,
		"adaptations": heartRate
	}

	// console.log(session)

	var s = new Session(session);
 	s.save()
	    .then(item => {
	    	resetSession()

	      	response.statusCode = 200
			response.success = true
			res.send(response)
	    })
	    .catch(err => {
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
			// scBuffer.push(sc)
			// if(scBuffer.length==40){
			// 	var sum = 0
			// 	var time = 0
			// 	for(let t of scBuffer){
			// 		sum+=t.value
			// 		time+=t.timestamp
			// 	}
			// 	skinConductance.push({
			// 		"timestamp": time/40.0,
			// 		"value": sum/40.0
			// 	})
			// 	scBuffer = []
			// }
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
			// hrBuffer.push(hr)
			// if(hrBuffer.length==40){ //average every 2 sec
			// 	var sum = 0
			// 	var time = 0
			// 	for(let t of hrBuffer){
			// 		sum+=t.value
			// 		time+=t.timestamp
			// 	}
			// 	heartRate.push({
			// 		"timestamp": time/40.0,
			// 		"value": sum/40.0
			// 	})
			// 	hrBuffer = []
			// }
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
}
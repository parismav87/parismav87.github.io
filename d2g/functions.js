// skinConductance = [
// 	{
// 	"timestamp": 1548065591000,
// 	"value": 5
// 	},
// 	{
// 	"timestamp": 1548065618000, 
// 	"value": 4
// 	},
// 	{
// 	"timestamp": 1548065768000,
// 	"value": 6
// 	},
// 	{
// 	"timestamp": 1548065868000,
// 	"value": 5
// 	},
// 	{
// 	"timestamp": 1548065968000,
// 	"value": 10
// 	}
// ]

dilemmaAnswers = [
	{
		"dilemmaTitle": "Save the Queen",
		"time": 60,
		"answer": "YES"
	},
	{
		"dilemmaTitle": "Nuke Them",
		"time": 40,
		"answer": "NO"
	},
	{
		"dilemmaTitle": "Play Tennis",
		"time": 30,
		"answer": "NO"
	},
	{
		"dilemmaTitle": "Cats or Dogs",
		"time": 70,
		"answer": "YES"
	},
	{
		"dilemmaTitle": "Playstation or Xbox",
		"time": 60,
		"answer": "NO"
	}
]

heartRate = []
skinConductance = []
heartRateVariability = []

filter = 10 //measurements per minute
chartRange = 120000 //milliseconds of charts x axis range 
serverInterval = 1000 //milliseconds between server calls
chartSC = null
chartHR = null
chartHRV = null
chartDilemmas = null
sessionStart = null
sessionEnd = null
participantID = null
serverCallsInterval = null

function getSkinConductance(start, end){
	var url = "http://localhost:3000/getSC"
	var headers = {
		"startTime": start,
		"endTime": end,
		filter: filter
	}
	$.ajax({
		type: "GET",
		url: url,
		headers: headers,
		success: function(data){
			// console.log(data);
			skinConductance = data['data']
			// for(let sc of data.data){
			// 	skinConductance.push(sc)
			// }
			// console.log(skinConductance)
			updateChart(skinConductance, chartSC)
			updateNumber(skinConductance, ".current-sc")
		}
	})
	
}

function getHeartRate(start, end){
	var url = "http://localhost:3000/getHR"
	var headers = {
		"startTime": start,
		"endTime": end,
		filter: filter
	}
	$.ajax({
		type: "GET",
		url: url,
		headers: headers,
		success: function(data){
			console.log(data);
			heartRate = data['data']
			// for(let hr of data.data){
			// 	heartRate.push(hr)
			// }
			// console.log(skinConductance)
			updateChart(heartRate, chartHR)
			updateNumber(heartRate, ".current-hr")
		}
	})
	
}

function saveSession(start, end, id){
	var url = "http://localhost:3000/saveSession"
	var headers = {
		"startTime": start,
		"endTime": end,
		"participantID": id
	}
	console.log(headers)
	$.ajax({
		type: "GET",
		url: url,
		headers: headers,
		success: function(data){
			console.log("saveSession", data)
		}
	})
}


function updateNumber(newData, c){
	if(newData.length>0){
		$(c).text(newData[newData.length-1]['value'].toFixed(1))
	} else{
		$(c).text("-")
	}
	
}

function updateChart(newData, chart){
	// console.log(newData)
	chart.load({
		json: newData,
		keys: {
			x: 'timestamp',
			value: ['value']
		}
	})
	// if(newData.length>0){ //update minimum
	// 	lastPoint = newData[newData.length-1].timestamp
	// 	tenSec = lastPoint - 10000
	// 	chart.axis.min({
	// 		x: tenSec
	// 	})
	// }
}

function resetSession(){
	var url = "http://localhost:3000/resetSession"
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			// console.log("resetSession", data)
			skinConductance = []
			heartRate = []
			updateChart(heartRate, chartHR)
			updateNumber(heartRate, ".current-hr")
			updateChart(skinConductance, chartSC)
			updateNumber(skinConductance, ".current-sc")
		}
	})
}

function addNewUser(user){
	var url = "http://localhost:3000/newUser"
	$.ajax({
		type: "POST",
		url: url,
		data: {
			"firstName" : user.firstName,
			"middleName" : user.middleName,
			"lastName" : user.lastName,
			"age" : user.age,
			"gender" : user.gender,
			"participantID" : user.participantID,
			"imageURL": user.imageURL
		},
		success: function(data){
			console.log("newUser", data)
		}
	})
}

function sendMessage(msg){
	var url = "http://localhost:3000/sendMessage"
	$.ajax({
		type: "POST",
		url: url,
		data: {
			"message": msg
		},
		success: function(data){
			console.log(data)
		}
	})
}

function getUsers(){
	var url = "http://localhost:3000/getUsers"
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			$.each(data.data, function(k,v){
				console.log(v)
				var element = '<span class="dropdown-item dropdown-item-users" data-id="'+v.participantID+'" data-image="'+v.imageURL+'" data-age="'+v.age+'" data-gender="'+v.gender+'" >'+v.firstName+' '+v.middleName+' '+ v.lastName+'</span>'
				$(element).appendTo($(".dropdown-users"))
			})
		}
	})
}

function startStream(){
	clearInterval(serverCallsInterval);
	sessionStart = new Date().getTime();
	serverCallsInterval = setInterval(function(){
		var d = new Date();
		var end = d.getTime();
		var start = end - chartRange
	 	getSkinConductance(start, end) 
	 	getHeartRate(start, end)
	}, serverInterval);
}

function generateCharts(){
	chartSC = c3.generate({
	    bindto: '#chartSC',
	    legend: {
	    	hide: true
	    },	
	    size: {
	    	// width: 1024,
	    	// height: 640
	    },
	    padding: {
	    	bottom: 0
	    },
	    data: {
	      json: skinConductance,
	      keys: {
	      	x: 'timestamp',
	      	value: ['value']
	      }
	    },
	    color: {
	    	pattern: ['#ffb142']
	    },
	    axis: {
	    	x: {
	    		label: {
	    			text: 'Time',
	    		},
	    		localtime: true,
	    		padding:{
	    			right: 5000, //20 seconds
	    			left: 4000 
	    		},
	    		type: 'timeseries',
	    		tick:{
	    			format: function(d){
	    				// console.log(d)
	    				return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) // timestamp has to be 13 digits
	    			},
	    			rotate: 40
	    		}
	    	}, 
	    	y: {
	    		label: {
	    			text: 'Skin conductance (mS)',
	    			position: 'outer-top'
	    		},
	    		min: 0,
	    		max: 21,
	    		tick: {
	    			values: [0, 3, 6, 9, 12, 15, 18, 21]
	    		}
	    	}
	    },
	    tooltip: {
	    	format: {
	    		name: function(d){
	    			return "Skin Conductance"
	    		}
	    	}
		}
	});

	chartHR = c3.generate({
	    bindto: '#chartHR',
	    legend: {
	    	hide: true
	    },
	    data: {
	      json: heartRate,
	      keys: {
	      	x: 'timestamp',
	      	value: ['value']
	      }
	    },
	    color: {
	    	pattern: ['#ffb142']
	    },
	    axis: {
	    	x: {
	    		label: 'Time',
	    		localtime: true,
	    		padding:{
	    			right: 5000, 
	    			left: 4000 
	    		},
	    		type: 'timeseries',
	    		tick:{
	    			format: function(d){
	    				// console.log(d)
	    				return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) // timestamp has to be 13 digits
	    			},
	    			rotate: 40
	    		}
	    	}, 
	    	y: {
	    		label: {
	    			text: 'Heartrate (bpm)',
	    			position: 'outer-top'
	    		},
	    		min: 40,
	    		max: 160,
	    		tick: {
	    			values: [40, 60, 80, 100, 120, 140, 160]
	    		}
	    	}
	    }
	});

	// chartHRV = c3.generate({
	//     bindto: '#chartHRV',
	//     legend: {
	//     	hide: true
	//     },	
	//     size: {
	//     	// width: 1024,
	//     	// height: 640
	//     },
	//     padding: {

	//     },
	//     data: {
	//       json: heartRateVariability,
	//       keys: {
	//       	x: 'timestamp',
	//       	value: ['value']
	//       }
	//     },
	//     color: {
	//     	pattern: ['#ffb142']
	//     },
	//     axis: {
	//     	x: {
	//     		label: 'Time (ms)',
	//     		localtime: true,
	//     		padding:{
	//     			right: 20000, //20 seconds
	//     			left: 20000 
	//     		},
	//     		type: 'timeseries',
	//     		tick:{
	//     			format: function(d){
	//     				// console.log(d)
	//     				return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) // timestamp has to be 13 digits
	//     			}
	//     		}
	//     	}, 
	//     	y: {
	//     		label: {
	//     			text: 'Heartrate variability (ms)',
	//     			position: 'outer-top'
	//     		}
	//     	}
	//     }
	// });

	chartDilemmas = c3.generate({
	    bindto: '#chartDilemmas',
	    legend: {
	    	hide: true
	    },	
	    size: {
	    	// width: 1024,
	    	// height: 640
	    },
	    padding: {

	    },
	    data: {
	    	labels: false,
	    	json: dilemmaAnswers,
	    	keys: {
		      	x: 'dilemmaTitle',
		      	value: ['time']
		    },
		    type: 'line',
		    color: function(color, d){
		    	// console.log(dilemmaAnswers[d.index])
		    	var ans = dilemmaAnswers[d.index]
		    	// console.log(ans)
		    	if(typeof ans != "undefined" && ans.answer == "YES"){
		    		return '#1bc115'
		    	} else if(typeof ans != "undefined" && ans.answer == "NO"){
		    		return '#ff3030'
		    	} else {
		    		return '#ffb142'
		    	}
		    }
	    },
	    point:{
	    	r: 2.5
	    },
	    axis: {
	    	x: {
	    		label: false,
	    		padding:{
	    			right: 1
	    		},
	    		type: 'category'
	    	}, 
	    	y: {
	    		show: true,
	    		label: {
	    			position: 'outer-top',
	    			text: 'Time to answer (s)'
	    		},
	    		tick: {
	    			// values: [20, 40, 60 ,80 ,100, 120]
	    			count: 5
	    		}
	    	}
	    }
	});

}


function generateBars(){
	var dilemmaBar = new ProgressBar.Circle("#dilemmaBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	dilemmaBar.animate(0.8);

	var infoBar = new ProgressBar.Circle("#infoBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	infoBar.animate(0.6);

	var timeBar = new ProgressBar.Circle("#timeBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	timeBar.animate(0.5);

}



dilemmaAnswers = []
gameStart = null
gameEnd = null
heartRate = []
skinConductance = []
heartRateVariability = []
appended = [false,false,false,false,false,false,false,false]

filter = 60 //measurements per minute
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
timelineRight = 20
baseURL = "http://localhost:3000/"
// baseURL = "http://8dc4d160.ngrok.io/"


function getSkinConductance(start, end){
	var url = baseURL + "getSC"
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
	var url =  baseURL + "getHR"
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
	var url = baseURL+ "saveSession"
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
	var url = baseURL + "resetSession"
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
	var url = baseURL + "newUser"
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
	var url = baseURL + "sendMessage"
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
	var url = baseURL + "getUsers"
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			$.each(data.data, function(k,v){
				// console.log(v)
				var element = '<span class="dropdown-item dropdown-item-users" data-id="'+v.participantID+'" data-image="'+v.imageURL+'" data-age="'+v.age+'" data-gender="'+v.gender+'" >'+v.firstName+' '+v.middleName+' '+ v.lastName+'</span>'
				$(element).appendTo($(".dropdown-users"))
			})
		}
	})
}

function changeGameSpeed(speed){
	var url = baseURL + "changeGameSpeed"
	var data = {
		gameSpeed: speed
	}
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(data){
			console.log(data)
		}
	})
}

function changeInfoLoad(infoLoad){
	var url = baseURL + "changeInfoLoad"
	var data = {
		infoLoad: infoLoad
	}
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(data){
			console.log(data)
		}
	})
}

function getBaselineMeasurements(){
	var url = baseURL + "baseline"
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			// console.log(data)
			chartHR.ygrids.add({value: data.data.hrbaseline})
			chartSC.ygrids.add({value: data.data.scbaseline})
		}
	})
}

function getGameData(){
	var url = baseURL + "gameData"
	$.ajax({
		type: "GET",
		url: url,
		success: function(data){
			dilemmaAnswers = data.data.dilemmas
			gameStart = data.data.gameStart
			gameEnd = data.data.gameEnd
			$.each(dilemmaAnswers, function(k,v){
				if(v.answered == true && appended[k] == false){
					appended[k] = true
					appendDilemmaToTimeline(v)
				}
			})
			updateProgressBars(data)
		}
	})
}

function updateProgressBars(data){
	var numberDilemmas = 0
	var numberInfos = 0
	var totalInfos = 0
	var numberAdvice = 0
	var totalAdvice = 0
	var totalDilemmas = data.data.dilemmas.length

	for(var d in data.data.dilemmas){
		var dil = data.data.dilemmas[d]
		if(dil.answered == true){
			numberDilemmas+=1
		}
		if(dil.started == true){
			totalInfos += dil.infos.length
			totalAdvice += 1
			for(var i in dil.infos){
				var inf = dil.infos[i]
				if(inf.read == true){
					numberInfos +=1
				}
			}
			if(dil.adviceRequested==true){
				numberAdvice+=1
			}
		}
	}
	$(".progressbar-numberofdilemmas").text(numberDilemmas)
	$(".progressbar-numberofinfos").text(numberInfos)
	$(".progressbar-numberofadvice").text(numberAdvice)
	$(".progressbar-totaldilemmas").text(totalDilemmas)
	$(".progressbar-totaladvice").text(totalAdvice)
	$(".progressbar-totalinfos").text(totalInfos)
	dilemmaBar.animate(numberDilemmas/totalDilemmas)
	infoBar.animate(numberInfos/totalInfos)
	adviceBar.animate(numberAdvice/totalAdvice)
}


function startStream(){
	getBaselineMeasurements()
	clearInterval(serverCallsInterval);
	sessionStart = new Date().getTime();
	serverCallsInterval = setInterval(function(){
		var d = new Date();
		var end = d.getTime();
		var start = end - chartRange
	 	getSkinConductance(start, end) 
	 	getHeartRate(start, end)
	 	getGameData()
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

	// chartDilemmas = c3.generate({
	//     bindto: '#chartDilemmas',
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
	//     	labels: false,
	//     	json: dilemmaAnswers,
	//     	keys: {
	// 	      	x: 'dilemmaTitle',
	// 	      	value: ['time']
	// 	    },
	// 	    type: 'line',
	// 	    color: function(color, d){
	// 	    	// console.log(dilemmaAnswers[d.index])
	// 	    	var ans = dilemmaAnswers[d.index]
	// 	    	// console.log(ans)
	// 	    	if(typeof ans != "undefined" && ans.answer == "YES"){
	// 	    		return '#1bc115'
	// 	    	} else if(typeof ans != "undefined" && ans.answer == "NO"){
	// 	    		return '#ff3030'
	// 	    	} else {
	// 	    		return '#ffb142'
	// 	    	}
	// 	    }
	//     },
	//     point:{
	//     	r: 2.5
	//     },
	//     axis: {
	//     	x: {
	//     		label: false,
	//     		padding:{
	//     			right: 1
	//     		},
	//     		type: 'category'
	//     	}, 
	//     	y: {
	//     		show: true,
	//     		label: {
	//     			position: 'outer-top',
	//     			text: 'Time to answer (s)'
	//     		},
	//     		tick: {
	//     			// values: [20, 40, 60 ,80 ,100, 120]
	//     			count: 5
	//     		}
	//     	}
	//     }
	// });
	
	var width = $("#chartDilemmasSVG").parent().width()
	var height = $("#chartDilemmasSVG").parent().height()

	d3.select("#chartDilemmasSVG").append("circle").attr("cy", height/2).attr("cx", timelineRight).attr("r", 3).style("stroke", "black").style("fill", "black");
	// timelineRight += width*20/100+20
}

function handleMouseOver(d,i){
	populateTooltip(d3.select(this))
	d3.select(this).style("fill", "#ffb142")
	var offsetHeight = $(".tooltip-custom").height()
	var offsetWidth = $(".tooltip-custom").width()
	var top = d3.event.target.getBoundingClientRect().top-offsetHeight-30
	var left = d3.event.target.getBoundingClientRect().left-offsetWidth/2
	if(left<=0){
		left = 10
	}
	$(".tooltip-custom").css({
		visibility: 'visible',
		top: top,
		left: left
	})
}

function handleMouseOut(d,i){
	d3.select(this).style("fill", "white")
	$(".tooltip-custom").css({
		visibility: 'hidden'
	})
}

function appendDilemmaToTimeline(data){
	console.log(data)
	var time = Math.floor((data.start+(data.duration*1000) - gameStart)/1000)
	console.log(time)
	var width = $("#chartDilemmasSVG").parent().width()
	var height = $("#chartDilemmasSVG").parent().height()
	var timePercentage = width*(time/900) //15 mins total time
	d3.select("#chartDilemmasSVG").append("line").attr("x1", timelineRight).attr("y1", height/2).attr("x2", timePercentage-10).attr("y2", height/2).attr("stroke-width", 1).attr("stroke", "white").transition().duration(2000).style("stroke", "black");
	d3.select("#chartDilemmasSVG").append("circle").attr("cy", height/2).attr("data-index", data.dilemmaId).attr("cx", timePercentage).attr("r", 10).style("stroke", "white").style("fill", "white").on("mouseover", handleMouseOver).on("mouseout", handleMouseOut).transition().duration(2000).style("stroke", "black");
	timelineRight = timePercentage+10
}

function populateTooltip(circle){
	var ind = parseInt(circle.attr("data-index"))-1
	var dilemma = dilemmaAnswers[ind]
	var completionTime = Math.floor((dilemma.start+(dilemma.duration*1000) - gameStart)/1000)
	$(".tooltip-title").text(dilemma.title)
	$(".tooltip-content-answer").text(dilemma.answer)
	$(".tooltip-content-completiontime").text(getTimeString(completionTime))
	$(".tooltip-content-timerequired").text(getTimeString(Math.floor(dilemma.duration)))
	if(dilemma.adviceRequested == true){
		$(".tooltip-content-advice").text("YES")
	} else {
		$(".tooltip-content-advice").text("NO")
	}
	var infosRead = 0
	for(var i in dilemma.infos){
		if(dilemma.infos[i].read == true){
			infosRead+=1
		}
	}
	$(".tooltip-content-infosread").text(infosRead)
}

function getTimeString(t){
	var mins = Math.floor(t/60)
	var secs = t % 60
	if(secs<10){
		return mins+":"+("0"+secs).substring(0,2)
	}
	return mins+":"+secs
}

function generateBars(){
	dilemmaBar = new ProgressBar.Circle("#dilemmaBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	// dilemmaBar.animate(0.8);

	infoBar = new ProgressBar.Circle("#infoBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	// infoBar.animate(0.6);

	adviceBar = new ProgressBar.Circle("#adviceBar", {
	  strokeWidth: 6,
	  easing: 'easeInOut',
	  duration: 1400,
	  color: '#ffb142',
	  trailColor: '#eee',
	  trailWidth: 1,
	  svgStyle: null
	});
	// adviceBar.animate(0.5);

}


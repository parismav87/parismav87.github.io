$(document).ready(function(){

	$(".create-user").on("click", function(evt){
		evt.stopPropagation()
		evt.preventDefault()

		var fname = $(".new-user-fname").val()
		var mname = $(".new-user-mname").val()
		var lname = $(".new-user-lname").val()
		var age = $(".new-user-age").val()
		var gender = $(".new-user-gender").val()
		var participantID = $(".new-user-participantID").val()
		var imageURL = $(".new-user-image").val()

		user = {
			"firstName" : fname,
			"middleName" : mname,
			"lastName" : lname,
			"age" : age,
			"gender" : gender,
			"participantID" : participantID,
			"imageURL": imageURL
		}

		addNewUser(user)

	})




})
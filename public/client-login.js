/*
This function gathers the username/password and validates it.
*/
function login(){
	let user = {};
	user.username = document.getElementById('username').value;
	user.password = document.getElementById('password').value;

	if(user.username == "" && user.password == ""){
		alert("Invalid username and password.");
		return;
	}else if(user.username == ""){
		alert("Invalid username.");
		return;
	}else if (user.password == ""){
		alert("Invalid password.");
		return;
	}

	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	let data = JSON.parse(this.responseText);
	    	if(data.success){
	    		window.location.href = "/users/"+data.result._id;
	    	}else{
	    		alert("Invalid username/password. Unauthorized user.");
	    	}
	    }
	}
	req.open('POST', '/login');
	req.setRequestHeader("Content-Type","application/json");
	req.send(JSON.stringify(user));
}
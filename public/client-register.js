/*
This function allows a new user to be created
*/
function register(){
	let user = {};
	user.username = document.getElementById("username").value;
	user.password = document.getElementById("password").value;

	
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
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			let response = JSON.parse(this.responseText);
			if(response.success){
				window.location.href = "/users/"+response.id;
			}else{
				alert("This username is already taken.");
				document.getElementById("username").value = "";
				document.getElementById("password").value = "";
			}
		}
	}
	req.open("POST", "/register");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(user));
}
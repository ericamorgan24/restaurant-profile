//This function searches for users that match string in the search box in a case insensitive manner
function search(){
	let search = {name: document.getElementById("search").value};
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			let results = document.getElementById("results");
			results.innerHTML = "";
			let allUsers = JSON.parse(this.responseText);
			allUsers.forEach(function(user){
				let a = document.createElement("a");
				let br = document.createElement("br");
				let text = document.createTextNode(user.username);
				a.appendChild(text);
				a.href = "/users/"+user._id;
				results.appendChild(a);
				results.appendChild(br);
			});
		}
	}
	req.open("POST", "/users");
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(search));
}
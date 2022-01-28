//This functino saves the privacy settings of the user
function save(){
	let privacy = {};
	privacy.value = document.getElementById("private").checked;
	console.log(privacy);
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4) {
	    	alert(this.responseText);
	    }
	}
	req.open('PUT', window.location.href);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(privacy));
}
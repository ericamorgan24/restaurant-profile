//client variables
let choice; 	//the chosen restaurant
let myOrder = [];	//array of items ordered

function init(){
	let select = document.getElementById('select');
	select.onchange = youSure;
}
/*
This function sends a request to the server for the data of the 
restaurant that was chosen from the select menu
*/
function goToRestaurant(){
	let rest = {};
	rest.name = document.getElementById('select').value;
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	choice = JSON.parse(this.responseText);
	    	display();
	    }
	}
	req.open('POST', '/order');
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(rest));
}

/*
This function calls the functino to display the menu, 
clears any current orders in the array of orders, 
and calls the function the display the order summary
*/
function display(){
	displayMenu();
	myOrder = []; 
	displayOrder();
}

/*
This function displays the name of restaurant, minimum order, 
categories of the different menu items with links to jump to different sections, 
and dispays each individual menu item with its description and price 
*/
function displayMenu(){
	document.getElementById('show').style.visibility = 'visible';
	//clear whatever is already in categories and menu
	let categories = document.getElementById("categories");
	let food = document.getElementById("food");
	categories.innerHTML = "";
	food.innerHTML = "";
	//display name, minimum order and delivery fee of restaurant
	let name = document.getElementById("name");
	name.innerHTML = choice.name;
	let min = document.getElementById("min");
	min.innerHTML = "Minimum order: $" + choice.min_order.toFixed(2);
	let fee = document.getElementById("fee");
	fee.innerHTML = "Delivery fee: $" + choice.delivery_fee.toFixed(2);
	//display categories header
	let div = document.createElement("div");
	let subhead = document.createTextNode("Categories");
	div.appendChild(subhead);
	div.className = "heading";
	categories.appendChild(div);
	//display menu categories
	let ul = document.createElement("ul");
	for(let key in choice.menu){
		let li = document.createElement("li");
		let a = document.createElement("a");
		a.href = ("#"+key);
		let text = document.createTextNode(key);
		a.appendChild(text);
		li.appendChild(a);
		ul.appendChild(li)
	}
	categories.appendChild(ul);
	//display menu items
	for(let key in choice.menu){
		//create menu category
		let br = document.createElement("br");
		let div = document.createElement("div");
		div.id = key;
		let div0 = document.createElement("div");
		div0.className = "menuHeading";
		let text = document.createTextNode(key);
		div0.appendChild(text);
		div.appendChild(div0);
		food.appendChild(div);
		food.appendChild(br);

		for(let subkey in choice.menu[key]){
			//create add button
			let img = document.createElement("img");
			img.src = "add.jpg";
			img.alt = "add";
			img.className = "imgClass";
			img.addEventListener("click", function(){
				adjustQuantity(choice.menu[key][subkey].name, choice.menu[key][subkey].price, 1);
			});	
			//create specific menu item with description and price
			let br = document.createElement("br");
			let name = document.createTextNode(choice.menu[key][subkey].name);
			let description = document.createTextNode(choice.menu[key][subkey].description);
			let price = document.createTextNode("$"+choice.menu[key][subkey].price.toFixed(2));
			let div1 = document.createElement("div");
			div1.className = "nameClass";
			let div2 = document.createElement("div");
			div2.className = "descriptionClass";
			let div3 = document.createElement("div");
			div3.className = "priceClass";
			div1.appendChild(name);
			div1.appendChild(img);
			div2.appendChild(description);
			div3.appendChild(price);
			div.appendChild(div1);
			div.appendChild(div2);
			div.appendChild(div3);
			div.appendChild(br);
		}
	}
	
}
/*
This function displays the summary of items that have been added to the order,
the subtotal, delivery fee, tax and total,
along with a cancel and submit button
*/
function displayOrder(){
	//clear current summary
	let title = document.getElementById("title");
	let table = document.getElementById("table");
	let subtotal = document.getElementById("subtotal");
	title.innerHTML = "";
	table.innerHTML = "";
	subtotal.innerHTML = "";
	//create title
	let summary = document.createTextNode("Summary");
	title.className = "heading";
	title.appendChild(summary);

	//create order summary table
	if(myOrder.length>0){

		subtotal.appendChild(document.createElement("br"));
		//create headers
		let tr = document.createElement("tr");
		let th1 = document.createElement("th");
		let th2 = document.createElement("th");
		let th3 = document.createElement("th");
		let name = document.createTextNode("Name");
		let quan = document.createTextNode("Quantity");
		let tot = document.createTextNode("Total");
		th1.appendChild(name);
		th2.appendChild(quan);
		th3.appendChild(tot);
		tr.appendChild(th1);
		tr.appendChild(th2);
		tr.appendChild(th3);
		table.appendChild(tr);
		//create table of items
		for(let i=0; i<myOrder.length; i++){
			let tr = document.createElement("tr");
			let td1 = document.createElement("td");
			let td2 = document.createElement("td");
			let td3 = document.createElement("td");
			let name = document.createTextNode(myOrder[i].name);
			let quan = document.createTextNode(myOrder[i].quantity);
			let tot = document.createTextNode("$" + (myOrder[i].quantity*myOrder[i].price).toFixed(2));
			//add and remove images
			let img1 = document.createElement("img");
			img1.src = "add.jpg";
			img1.alt = "add";
			img1.className="imgClass";
			img1.addEventListener("click", function(){
					adjustQuantity(myOrder[i].name, myOrder[i].price, 1);
				});	
			let img2 = document.createElement("img");
			img2.src = "remove.jpg";
			img2.alt = "remove";
			img2.className="imgClass";
			img2.addEventListener("click", function(){
					adjustQuantity(myOrder[i].name, myOrder[i].price, -1);
				});	
			//add elements to table
			td1.appendChild(name);
			td2.appendChild(img2);
			td2.appendChild(quan);
			td2.appendChild(img1);
			td3.appendChild(tot);
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			table.appendChild(tr);

		}
	}
	
	//create price summary table
	//subtotal
	let div01 = document.createElement("div");
	let text01 = document.createTextNode("Subtotal: $" + subTotal());
	div01.appendChild(text01);
	subtotal.appendChild(div01);
	//delivery fee
	let div02 = document.createElement("div");
	let text02 = document.createTextNode("Delivery fee: $" + choice.delivery_fee.toFixed(2));
	div02.appendChild(text02);
	subtotal.appendChild(div02);
	//tax
	let div03 = document.createElement("div");
	let text03 = document.createTextNode("Tax: $" + (subTotal()*0.1).toFixed(2));
	div03.appendChild(text03);
	subtotal.appendChild(div03);
	//total
	let div04 = document.createElement("div");
	let text04 = document.createTextNode("Total: $" + (subTotal()*1.1+choice.delivery_fee).toFixed(2));
	div04.appendChild(text04);
	subtotal.appendChild(div04);

	//cancel button
	let cancel = document.createElement("input");
	cancel.type = "submit";
	cancel.value = "Cancel";
	cancel.onclick = display;
	subtotal.appendChild(cancel);

	//create submit button or display message
	if(subTotal() >= choice.min_order){
		let submit = document.createElement("input");
		submit.type = "submit";
		submit.value = "Submit";
		submit.onclick = submitOrder;
		subtotal.appendChild(submit);
	}else{
		let div = document.createElement("div");
		let text = document.createTextNode("You must add $" + (choice.min_order - subTotal()).toFixed(2) + " more to your order before submitting.");
		div.appendChild(text);
		subtotal.appendChild(div);
	}
}

/*
This function adds new order to the myOrder array
and adjusts the quantity of an order based on when the "-" or "+"
image has been clicked, then displays an updated summary table 
by calling displayOrder()
*/
function adjustQuantity(n, p, q){
	if(myOrder.length ==0){
		myOrder.push({name: n, price: p, quantity: q});
		displayOrder();
		return;
	}
	for(let i=0; i<myOrder.length; i++){
		if(myOrder[i].name == n){
			if(q==1){
				myOrder[i].quantity += 1;
				displayOrder();
				return;
			}else if(q==-1){
				myOrder[i].quantity -= 1;
				if(myOrder[i].quantity == 0) clear(myOrder[i].name);
				displayOrder();
				return;
			}
			
		}
	}
	myOrder.push({name: n, price: p, quantity: q});
	displayOrder();
	return;
}
/*
This function calculates and returns the subtotal based on the 
prices and quantities in the myOrder array
*/
function subTotal(){
	let sum = 0;
	for(let i=0; i<myOrder.length; i++){
		sum += myOrder[i].price*myOrder[i].quantity;
	}
	return sum.toFixed(2);
}
/*
This function alerts the user that their order has been submitted 
and resets the page
*/
function submitOrder(){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	alert("Your order has been submitted!");
	    	window.location.href = '/';
	    }
	};
	let stats = {};
	stats.restaurantID = choice.id;
	stats.restaurantName = choice.name;
	stats.subtotal = subTotal();
	stats.total = (subTotal()*1.1+choice.delivery_fee).toFixed(2);
	stats.fee = choice.delivery_fee.toFixed(2);
	stats.tax = (subTotal()*0.1).toFixed(2);
	stats.items = myOrder;
	req.open('POST', '/orders');
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(stats));
}
/*
This function is called if the user tries to select a new restaurant while they
have items in their order. It cancels order is they hit ok, or remains unchanged if they hit cancel.
*/
function youSure(){
	if((myOrder.length>0)){
		let c = confirm("Are you sure?");
		if(c==true){
			goToRestaurant();
		}else{
			document.getElementById("select").value = choice.name; //so that select value isn't changed
		}
	}else if(document.getElementById("select").value == "Choose"){
		document.getElementById("select").value = choice.name;
	}else{
		goToRestaurant();
	}
}
/*
This function clears an item from the myOrder array if its quantity has dropped to 0, 
so that it is no longer displayed in the summary table.
*/
function clear(n){
	for(let i=myOrder.length-1; i>=0; i--){
		if(myOrder[i].name == n){
			myOrder.splice(i,1);
		}
	}
}
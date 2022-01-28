//require modules and data
const express = require('express');
const app = express();
const pug = require('pug');
const fs = require("fs");
const mongoose = require("mongoose");
let User = require("./userModel");
let Order = require("./orderModel");

//session initialization
const session = require('express-session');
const MongoDBRest = require('connect-mongodb-session')(session);
const rest = new MongoDBRest({
  uri: 'mongodb://localhost:27017/a4',
  collection: 'sessions'
});
app.use(session({secret:'top secret', store: rest}));


//set template engine
app.set("view engine", "pug");

//static server
app.use(express.static("public"));

//body parser
app.use(express.urlencoded({extended: true}));
app.use(express.json());


//holds restaurant data
let restaurants = [];


//request handlers
app.use("/", function(req, res, next){
	//sets a user as either being loggedin or not when they try to access any of the pages
	if(req.session.loggedIn){
		next();
	}else{
		req.session.loggedIn = false;
		next();
	}
})
app.get("/", function(req, res, next){
	//determines which header will be included
	if(req.session.loggedIn){
		res.render("pages/home", {loggedIn: req.session.loggedIn, id: req.session.userid});
	}else{
		res.render("pages/home", {loggedIn: req.session.loggedIn});
	}
});
app.get('/users', function(req,res,next){
	//query parameters
	if(req.query.name){
		User.find()
		.where("username").regex(new RegExp(req.query.name, 'i'))
		.where("privacy").equals(false)
		.exec(function(err, results){
			if(err) throw err;
			if(req.session.loggedIn){
				res.render("pages/users", {loggedIn: req.session.loggedIn, id: req.session.userid, users: results});
			}else{
				res.render("pages/users", {loggedIn: req.session.loggedIn, users: results});
			}
		});
	}else{
		//if not query parameters
		if(req.session.loggedIn){
			res.render("pages/users", {loggedIn: req.session.loggedIn, id: req.session.userid});
		}else{
			res.render("pages/users", {loggedIn: req.session.loggedIn});
		}
	}
	
});
app.post('/users', function(req,res,next){
	User.find()
	.where("username").regex(new RegExp(req.body.name, 'i'))
	.where("privacy").equals(false)
	.exec(function(err, results){
		if(err) throw err;
		res.status(200).send(results);
	});
});
app.get('/users/:userID', function(req,res,next){
	User.findOne({_id: req.params.userID}, function(err, result){
		if(result == null){
			res.status(404).send("Resource not found.");
		}else if(result.privacy == true && !result._id.equals(req.session.userid)){
			res.status(403).send("This user is private.");
		}else{
			res.render("pages/user", {loggedIn: req.session.loggedIn, result:result, id: req.session.userid});
		}
	});
});
app.put('/users/:userID', function(req,res,next){
	if(!req.session.loggedIn){
		res.status(401).send("You are unauthorized.");
		return;
	}
	User.findOne({_id: req.params.userID}, function(err, result){
		if(err){
			throw err;
			return;
		} 
		if(result == null){
			res.status(404).send("Resource not found.");
		}else if(result.privacy == true && !result._id.equals(req.session.userid)){
			res.status(403).send("This user is private.");
		}else{
			result.privacy = req.body.value;
			result.save(function(err, result){
				if(err){
					throw err;
					return;
				} 
				res.status(200).send("Information has been saved.");
			})
		}
	});
});
app.get("/register", function(req, res, next){
	res.render("pages/register");
});
app.post("/register", function(req, res, next){
	User.findOne({username: req.body.username}, function(err, result){
		if(result == null){
			//create new user only if one doesn't isn't
			let newUser = new User({username: req.body.username, password: req.body.password, privacy: false, orders: []});
			newUser.save(function(err, result){
				if(err){
					console.log(err.message);
					return;
				}
				req.session.loggedIn = true;
				req.session.name = result.username;
				req.session.userid = result._id;
				res.status(200).send({success: true, id: newUser._id});
				return;
		  	});
		}else{
			res.status(200).send({success: false});
		}
	});

});
app.get("/login", function(req, res, next){
	res.render("pages/login");
});
app.post("/login", function(req, res, next){
	if(req.session.loggedIn){
		res.status(200).send({success: true, result:result});
		return;
	}
	User.findOne({username: req.body.username}, function(err, result){
		if(err) throw err;
		if(result){
			if(result.password == req.body.password){
				req.session.loggedIn = true;
				req.session.name = result.username;
				req.session.userid = result._id;
				res.status(200).send({success: true, result:result});
			}else{
				res.status(200).send({success: false});
			}
		}else{
			res.status(200).send({success: false});
			return;
		}
	});
});
app.get("/logout", function(req, res, next){
	if(!req.session.loggedIn){
		res.status(401).send("You are not logged in.");
		return;
	}
	//reset req.session properties 
	req.session.loggedIn = false;
	req.session.name = "";
	req.session.userid = "";
	res.redirect("/");
});
app.get("/order", function(req, res, next){
	if(!req.session.loggedIn){
		res.status(401).send("You are unauthorized.");
		return;
	}
	res.render("pages/order", {loggedIn:req.session.loggedIn, restaurants, id: req.session.userid});
});
app.post("/order", function(req, res, next){
	if(!req.session.loggedIn){
		res.status(401).send("You are unauthorized.");
		return;
	}
	let rest = restaurants.find( elem => elem.name == req.body.name);
	res.status(200).send(rest);
});
app.post("/orders", function(req, res, next){
	if(!req.session.loggedIn){
		res.status(401).send("You are unauthorized.");
		return;
	}
	let newOrder = new Order(req.body);
	newOrder.username = req.session.name;
	newOrder.save(function(err){
		if(err) throw err;
		User.findOne({username: req.session.name}, function(err, result){
			if(err) throw err;
			result.orders.push(newOrder._id);
			result.save(function(err){
				if(err){
					console.log("Unable to save order.");
					return;
				} 
				res.status(200).end();
			});
		});
	});
});
app.get('/orders/:orderID', function(req,res,next){
	if(!req.session.loggedIn){
		res.status(401).send("You are unauthorized.");
		return;
	}
	Order.findOne({_id: req.params.orderID}, function(err, result){
		if(err) throw err;

		if(result == null){
			res.status(404).send("Resource not found.");
		}else{
			User.findOne({username: result.username}, function(err, resultu){
				if(err) throw err;
				if(resultu.privacy == true && req.session.name != resultu.username){
					res.status(403).send("Not authorized");
				}else{
					res.render("pages/orderid", {loggedIn: req.session.loggedIn, name: req.session.name, result, id: req.session.userid});
				}
			});
			
		}
	});
});





//database initialization
mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting:'));
db.once('open', function() {
	//add restaurants to server
	fs.readdir('./restaurants', function(err, files){
		if(err){
			throw err;
			return;
		}
		files.forEach(function(file) {
			let myFile = require('./restaurants/'+file);
			restaurants.push(myFile);
		});
	});
	//initialize server
	app.listen(3000);
	console.log("Server listening at http://localhost:3000");
});






















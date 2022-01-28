const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
	restaurantID : Number,
	restaurantName : String,
	subtotal : Number,
	total : Number,
	fee : Number,
	tax : Number,
	items : [{
			name: String,
			price: Number,
			quantity: Number
	}],
	username: String
});


module.exports = mongoose.model("Order", orderSchema);
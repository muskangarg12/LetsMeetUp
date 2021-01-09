// Require Mongoose
const mongoose = require("mongoose");

// Create Schema for IP adress
const ipSchema = mongoose.Schema({
	ip: String
});

// Create and export IP model
module.exports = mongoose.model("ip", ipSchema);

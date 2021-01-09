// Require Mongoose
const mongoose = require("mongoose");

// Create Schema for User
const userSchema = mongoose.Schema({
	username: String,
	password: String,
	name: String,
	email: String,
	rooms: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "room"
	}]
});

// Define findByUsername for User
userSchema.statics.findByUsername = function (username) {
	return this.findOne({ username });
};

// Create and export User model
module.exports = mongoose.model("user", userSchema);

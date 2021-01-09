// Require Mongoose
const mongoose = require("mongoose");

// Create Schema for Chat
const chatSchema = mongoose.Schema({
    messages: [{
        sender: String,
        body: String,
        for: [String]  		  // Array of usernames whom to deliver this message
    }],
	boardData: String
});

// Create and export Chat model
module.exports = mongoose.model("chat", chatSchema);

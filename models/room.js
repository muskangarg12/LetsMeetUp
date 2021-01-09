// Require Mongoose
const mongoose = require("mongoose");

// Create Schema for Room
const roomSchema = mongoose.Schema({
    name: String,
    members: [{
        username: String,
        unreadMessages: Number
    }],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat"
    }
});

// Define findByName for Group
roomSchema.statics.findByName = function (name) {
    return this.findOne({ name });
};

// Create and export Group model
module.exports = mongoose.model("room", roomSchema);

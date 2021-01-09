// Mongoose
const mongoose = require("mongoose");

// Connect to MongoDB Database
mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.mwya5.mongodb.net/letsmeetup?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(() => {
        console.log("Database Ready for use!");
    })
    .catch(err => {
        console.error("Error connecting to Database!!");
        console.error(err.stack);
        process.exit(1);
    });

// Export the mongoose connection
module.exports = mongoose;

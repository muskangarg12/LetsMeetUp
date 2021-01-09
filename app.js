// Path (to handle and transform files paths)
const path = require("path");

// Express
const express = require("express");

// Sockets
const socketio = require("socket.io");
const http = require("http");

// Passport: Cookie Parser, Express-Session
//required for passport.socketio
const cp = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
// Access passport.js user information from a socket.io connection
const passportSocketIo = require("passport.socketio");


// Connect Flash ( middleware for displaying messages during redirecting )
const flash = require("connect-flash");

// Passport ( for authentication during login )
const Passport = require("./passport.js");
// Connect to Database 
const mongoose = require("./db");


// --------------------
//    INITIALIZATION
// --------------------

// Create the Express App
const app = express();
// Extract Server from app (create a server object using http)
const server = http.Server(app);
// Initialize io
const io = socketio(server);

// Set EJS as View Engine
app.set("view engine", "ejs");

//====================
//    MIDDLEWARES
//====================

// Parse Request's Body
app.use(express.urlencoded({ extended: true }));            // bodyparser
app.use(express.json());

// Initialize Express-session
app.use(cp(process.env.COOKIE_SECRET));

// Session Store
const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
app.use(session({
    secret:  process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// Initialize Passport
app.use(Passport.initialize());
app.use(Passport.session());

// Initialize Flash
app.use(flash());


// MOUNTING STATIC FILES (path.join() joins the dirname with "public" using delimiter "/")
app.use("/", express.static(path.join(__dirname, "public")));


// Add user to response's locals ( creating our own middleware )
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});


// USING ROUTERS
app.use("/", require("./routes")(io));

// ====================
//      Sockets
// ====================

// Authentication
const authenticator = passportSocketIo.authorize({
    cookieParser: cp,
    secret:  process.env.SESSION_SECRET,
    store: sessionStore,
});

// Use Authenticator to authenticate users on all Namespaces
io.of("/chats").use(authenticator);
io.of("/rooms").use(authenticator);

// Add Event Listeners to all Namespaces
require("./socket/rooms")(io);


// Listen at PORT specified in CONFIG
server.listen( process.env.PORT || 3000 )

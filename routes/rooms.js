const route = require("express").Router();

// Databases
const { Room, Chat } = require("../models");

// Utilities
const { checkLoggedIn } = require("../utils/auth");


//====================
//       ROUTES
//====================

// Get Request for New Room Page
route.get("/new", checkLoggedIn, (req, res) => {
    // Render newGroup with Current User's Details
    res.render("room/new", {
        success: req.flash("success"),
        error: req.flash("error")
    });
});

// Post Request for Creating New Room
route.post("/", checkLoggedIn, async (req, res) => {
    try {
        // Check if Room Name is Already present
        const room = await Room.findByName(req.body.roomName);

        // If Room is already present
        if (room !== null) {
            req.flash("error", `Room ${req.body.roomName} already present!`);
            return res.redirect("/rooms/new");
        }

        // If Room is not Present
        // Create Chat for new Room
        const chat = await Chat.create({ messages: [], boardData: "Start the meeting!"});
        
        // Create the New Room
        const newRoom = await Room.create({
            name: req.body.roomName,
            members: [{
                username: req.user.username,
                unreadMessages: 0
            }],
            chat: chat
        });

        // Add new room to Current User's Rooms
        req.user.rooms.push(newRoom);
        await req.user.save();

        // Redirect User to New Chat Page
        res.redirect(`/rooms/${newRoom.id}/chat`);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// Get Request for Join Room Page
route.get("/join", checkLoggedIn, (req, res) => {
    // Render newChat with Current User's Details
    res.render("room/join", {
        success: req.flash("success"),
        error: req.flash("error")
    });
});

// Post Request for Joining Room
route.post("/join", checkLoggedIn, async (req, res) => {
    try {
        // Find room with entered Room Name
        const room = await Room.findByName(req.body.roomName);

        // If Room not found
        if (room === null) {
            req.flash("error", `Room ${req.body.roomName} not found!`);
            return res.redirect("/rooms/join");
        }

        // Else, Room present
        const promises = [];
        
        // Add User to Room's Members if not already present
        if (room.members.findIndex(member => member.username === req.user.username) === -1) {
            room.members.push({
                username: req.user.username,
                unreadMessages: 0
            });
            promises.push(room.save());
        }

        // Add Room to User's Groups if not already present
        if (req.user.rooms.filter(rm => rm.equals(room.id)).length === 0) {
            req.user.rooms.push(room);
            promises.push(req.user.save());
        }

        await Promise.all(promises);

        res.redirect(`/rooms/${room.id}/chat`);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// GET Route for Room Chat page
route.get("/:roomId/chat", checkLoggedIn, async (req, res, next) => {
    try {
        // Find the room
        const room = await Room.findById(req.params.roomId);
        // If Room not found, go to next middleware(404 Route)
        if (room === null)
            return next();

        // Check if current user is not a member of room
        if (room.members.findIndex(member => member.username === req.user.username) === -1) {
            req.flash("error", "Join the Room to Chat there!");
            return res.redirect("/chats");
        }

        // If User is a member of Room
        res.render("room", { title: room.name, roomId: room.id });

    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// GET Route for Room Details page
route.get("/:roomId", checkLoggedIn, async (req, res, next) => {
    try {
        // Find the Room
        const room = await Room.findById(req.params.roomId);
        // If room not found, go to next middleware(404 Route)
        if (room === null)
            return next();
        
        // Check if current user is a member of room
        if (room.members.findIndex(member => member.username === req.user.username) === -1) {
            req.flash("error", "Join the room to know its Details!");
            return res.redirect("/chats");
        }

        const chat = await Chat.findById(room.chat);
    
        // User is a member of room
        res.render("details", {
            title: room.name,
            roomId: room.id,
            members: room.members.map(member => member.username),
        });

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// DELETE Route for Removing a member from Room
route.post("/:roomId/leave", checkLoggedIn, async (req, res) => {
    try {
        // Find the Room
        const room = await Room.findById(req.params.roomId);

        if (room === null) {
            req.flash("error", "Room not found!");
            return res.redirect("/chats");
        }

        // Check if user is a member of room
        const index = room.members.findIndex(member => member.username === req.user.username);
        if (index === -1) {
            req.flash("error", "User not in the Room!!");
            return res.redirect("/chats");
        }
        
        const promises = [];

        // Remove user from room's members
        room.members.splice(index, 1);
        // If user was last member, remove the room
        if (room.members.length === 0) {
            // Remove Room's Chat
            promises.push(Chat.findByIdAndRemove(room.chat));
            promises.push(room.remove());
        }
        else
            promises.push(room.save());

        // Remove Room from user's rooms
        req.user.rooms = req.user.rooms.filter(rm => !rm.equals(room.id));
        promises.push(req.user.save());

        await Promise.all(promises);

        req.flash("success", `Successfully left the room ${room.name}!`);
        res.redirect("/chats");

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

// Export current Route
module.exports = route;

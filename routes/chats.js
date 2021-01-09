// Databases
const { User, Chat } = require("../models");

// Utilities
const { checkLoggedIn } = require("../utils/auth");


//====================
//       ROUTES
//====================

module.exports = (io) => {
    const route = require("express").Router();

    // Get Request for the Profile Page, showing all Chats
    route.get("/", checkLoggedIn, async (req, res) => {
        try {

            const user = await req.user.populate("rooms").execPopulate();

            // Get all rooms of User: URL, Name and unreadMessages
            const roomChats = user.rooms.map(room => ({
                name: room.name,
                link: `/rooms/${room.id}/chat`,
                unreadMessages: room.members.find(member => member.username === user.username).unreadMessages
            }));

            // Stores all Chat Names, Redirect URLs and Unread Messages
            const chats = [...roomChats];

            // Don't Cache this page to reload chats!
            res.set("Cache-Control", "no-store");

            // Render chats.ejs with chats
            res.render("chats", {
                chats,
                success: req.flash("success"),
                error: req.flash("error")
            });

        } catch (err) {
            console.error(err.stack);
            res.sendStatus(500);
        }
    });

    return route;
};

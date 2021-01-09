const { Chat, Room } = require("../models");
const { sanitizeMessage } = require("../utils/sanitize");

module.exports = io => {
    const nsp = io.of("/rooms");
    nsp.on("connection", socket => {
        
        socket.on("data", async ({ url, username }) => {
            // Store the username in socket
            socket.username = username;

            // Extract chat ID from url
            socket.roomId = url.split("/")[2];

            // Add Socket to Room with name same as Room ID
            // Creates new Room if not exists
            socket.join(socket.roomId);

            // Send old Messages to User
            try {
                // Find the room's Chats
                const room = await Room.findById(socket.roomId).populate("chat").exec();

                // Emit old messages & board data to User
                socket.emit("old messages", room.chat.messages);
                socket.emit("get board data", room.chat.boardData);

                console.log(username);
                // Remove unreadMessages of current user
                room.members.find(
                    ({ username }) => username === socket.username
                ).unreadMessages = 0;

                await room.save();

            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });


        // On receiving New message from User
        socket.on("new message", async text => {
            // Sanitize and trim the Message Text
            text = sanitizeMessage(text);

            // Don't add Empty Messages
            if (text === "")
                return;

            const message = {
                sender: socket.username,
                body: text,   
                for: []
            };

            try {
                const room = await Room.findById(socket.roomId);
            
                // Push the new message in chat's messages
                await Chat.update(
                    { _id: room.chat },
                    { $push: { messages: message } }
                );

                // Emit the new chat to everyone in the room
                nsp.to(socket.roomId).emit("new message display", message);

                // Update unread messages of all other members in room
                const socketIds = Object.keys(nsp.in(socket.roomId).sockets);
                const sockets = socketIds.map(
                    id => nsp.in(socket.roomId).sockets[id].username
                );

                // Increment unreadMessages of each offline member
                room.members.forEach(member => {
                    if (sockets.indexOf(member.username) === -1) {
                        ++member.unreadMessages;
                    }
                });
                await room.save();

            } catch (err) {
                console.error(err.stack);
                throw err;
            }

        });

        // On recieving updated board data from the user
        //  to update the database
        socket.on("set board data", async data => {
            try{
                const room = await Room.findById(socket.roomId);
                await Chat.update(
                    { _id: room.chat },
                    { $set: {boardData: data.data}} 
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });

        // To update the board data 
        socket.on("update", data => {
            socket.to(socket.roomId).broadcast.emit("update board data", data);
        });

        // When User typed in Chat Box
        socket.on("typed", username => {
            // Emit username is typing message to others in room except socket
            socket.to(socket.roomId).broadcast.emit("typing", username);
        });
    });
};

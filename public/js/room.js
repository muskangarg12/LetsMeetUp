$(() => {
    const $list = $("#messages-list"); 
    const $sendButton = $("#send-button");
    const $clearButton = $("#clear-button");
    const $input = $("#message-input");
    const $messagesContainer = $("#messages-container");
    
    let timeoutId = null; 

    const username = $("#username").data("username");    
    
    //Namespase
    const socket = io("/rooms");

    // on creating connection
    socket.on("connect", () => {
        socket.emit("data", {
            url: window.location.pathname,
            username
        });
    });
    
    // when old messages are recieved
    socket.on("old messages", (chats) => {
        $list.html("");
        //display all the messages
        chats.forEach(chat => {
            appendMessage($list, chat);
        });
        //scroll to the bottom
        updateScroll($messagesContainer);
    });

    //when new message is recieved
    socket.on("new message display", (chat) => {
        clearTypingMessage(timeoutId);
        appendMessage($list, chat);
        updateScroll($messagesContainer);
    });

    //when initial board data is updated
    socket.on("get board data", (data) => {
        $('#codebox').val(data);
    });

    // notify when a member is typing in the input box of the chatting screen 
    socket.on("typing", (username) => {
        clearTypingMessage(timeoutId);
        $list.append(`
            <li id="typing" class="left" style="margin-bottom: 10px; width: 100%; text-align: center" >
                <div style="padding-left: 10px; padding-right: 10px; color: black; background-color: #ffffffba; border-radius: 4px;"><b>${username} is typing.....</b></div>
            </li>
        `);
        updateScroll($messagesContainer);
        timeoutId = setTimeout(() => {
            $("#typing").remove();
        }, 500);
    });

    // update the board data whenever a change is made by any member
    socket.on("update board data", data =>{
        $('#codebox').val(data.data);
    });

    // --------------------
    //   EVENT LISTENERS
    // --------------------

    // event occurs whenever any key is released
    $( "#codebox" ).keyup(function() {
      var data = $('#codebox').val();
      // update the database   
      socket.emit("set board data", {data: data});
      // update the board data for all other members  
      socket.emit("update", {data: data});
    });

    // send new message in the chatting box
    $sendButton.click(() => {
        socket.emit("new message", $input.val());
        $input.val("");
    });

    $clearButton.click(() => {
        $('#codebox').val("");
        $( "#codebox" ).keyup();
    })

    // notify members when user is typing a message int chatting window
    $input.on("keypress", (event) => {
        if (event.keyCode === 13)
            $sendButton.click();
        else {
            socket.emit("typed", username);
        }
    });

});


// --------------------
//   HELPER FUNCTIONS
// --------------------

// To add a message to the message list in the chatting window
const appendMessage = ($list, message) => {
    var username = $("#username").data("username");
    if(message.sender === username){
        $list.append(`
        <li class="right message-sender">
            <div class="teal lighten-4  message-bubble">${message.body/*.replace(/\n/g, "<br />").replace(/\t/g, "&emsp;&emsp;")*/}</div>`+           
        `</li>
    `);
    }else{
        $list.append(`
        <li class="left message-sender">
            <b style="color: white;">${message.sender}:</b> 
            <div class="orange lighten-4 message-bubble">${message.body/*.replace(/\n/g, "<br />").replace(/\t/g, "&emsp;&emsp;")*/}</div>` +
        `</li>
    `);
    }
};

// to update the scroll so that the latest message is visible
const updateScroll = ($messagesContainer) => {
    // set the scroll to the very bottom
    $messagesContainer.scrollTop($messagesContainer.prop("scrollHeight"));
};

// clear the typing message
const clearTypingMessage = (timeoutId) => {
    $("#typing").remove();
    clearTimeout(timeoutId);
    timeoutId = null;
};

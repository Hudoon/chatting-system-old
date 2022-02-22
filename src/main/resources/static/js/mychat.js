'use strict';


var stompClient = null;
var usernamePage = document.querySelector('#userJoin');
var chatPage = document.querySelector('#chatPage');
var room = $('#room');
var name = $("#name").val().trim();
var waiting = document.querySelector('.waiting');
var roomIdDisplay = document.querySelector('#room-id-display');
var stompClient = null;
var currentSubscription;
var topic = null;
var username;
var chatUsersCount = document.querySelector("#chatUsersCount");
let chatUsersCtr = document.querySelector("#users");

let users = [];

function connect(event) {
    var name1 = $("#name").val().trim();
    Cookies.set('name', name1);
    usernamePage.classList.add('d-none');
    chatPage.classList.remove('d-none');
    var socket = new SockJS('/sock');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
    event.preventDefault();

}
function disconnect(event) {
    //stompClient.disconnect({}, onDisconnect,onError())
    onDisconnect();
    console.log("Disconnected");

}

function onConnected() {
    enterRoom(room.val());
    waiting.classList.add('d-none');

}

function onDisconnect() {
    exitRoom(room.val());
    waiting.classList.add('d-none');

}

function exitRoom(newRoomId)
{
    var roomId = newRoomId;

    Cookies.set('roomId', room);

    roomIdDisplay.textContent = roomId;
    topic = `/chat-app/chat/${newRoomId}`;

    currentSubscription = stompClient.subscribe(`/chat-room/${roomId}`, onMessageReceived);
    var username = $("#name").val().trim();
    stompClient.send(`${topic}/leaveUser`,
        {},
        JSON.stringify({sender: username, type: 'LEAVE'})
    );
    console.log('leave user');
    stompClient.disconnect();

}
function onError(error) {
    waiting.textContent = 'uh oh! service unavailable';
}

function enterRoom(newRoomId) {
    var roomId = newRoomId;

    Cookies.set('roomId', room);

    roomIdDisplay.textContent = roomId;
    topic = `/chat-app/chat/${newRoomId}`;

    currentSubscription = stompClient.subscribe(`/chat-room/${roomId}`, onMessageReceived);
    var username = $("#name").val().trim();
    stompClient.send(`${topic}/addUser`,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
    console.log('adduser');

    // console.log('hiiiiiiiiiiiiiiiiiii');
    // stompClient.subscribe('/chat-room/users', function(response) {
    //     console.log(response);
    //     console.log(JSON.parse(response.body));
    // });
    // topic = `/chat-app/chat`;
    // stompClient.send(`${topic}/user/${username}`, {}, JSON.stringify({}))

}



function sendMessage(event) {
    var messageContent = $("#message").val().trim();
    var username = $("#name").val().trim();
    var newRoomId = $('#room').val().trim();
    topic = `/chat-app/chat/${newRoomId}`;
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };

        stompClient.send(`${topic}/sendMessage`, {}, JSON.stringify(chatMessage));
        document.querySelector('#message').value = '';
    }
    event.preventDefault();
}


// Join user to chat
function userJoin( username) {
    const user ={ username};
    chatUsersCount= chatUsersCount+1;
    users.push(user);
    chatUsersCtr.innerHTML = '';
    console.log("all users"+users.length);
    users.forEach((u) => {
        console.log("all users"+u.username);

        const userEl = document.createElement("div");
        userEl.className = "chat-user";
        userEl.innerHTML = u.username;
        chatUsersCtr.appendChild(userEl);
    });


}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    console.log(payload.body);
    console.log("Message received ");


    var messageElement = document.createElement('li');
    var divCard = document.createElement('div');
    divCard.className = 'card';

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
        console.log("/////////////////////type join "+message.content);
        userJoin(message.sender);

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
        console.log(message.sender + ' left!');
        console.log("/////////////////////type leave"+message.content);
        disconnect();
    }
    else {
        messageElement.classList.add('chat-message');
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);

    }
    var divCardBody = document.createElement('div');
    divCardBody.className = 'card-body';
    divCardBody.appendChild(messageElement);
    divCard.appendChild(divCardBody);
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    var messageArea = document.querySelector('#messageArea');
    messageArea.appendChild(divCard);
    messageArea.scrollTop = messageArea.scrollHeight


}

$(document).ready(function() {
    userJoinForm.addEventListener('submit', connect, true);
    messagebox.addEventListener('submit', sendMessage, true);
    userLeaveForm.addEventListener('submit', disconnect, true);
});
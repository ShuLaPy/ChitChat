const messageForm = document.getElementById("message-form");
const chatBox = document.querySelector('.chat-box');
const roomName = document.getElementById("room-name");
let typing = false;
let user;
let timeout = undefined;

const socket = io();

//Get username and room from url
const {username, room, gender} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


//add typing functionality
$('#msg').keyup((e)=>{
    if(e.which!=13){
      typing=true
      socket.emit('typing', {user:username, typing:true})
      clearTimeout(timeout)
      timeout=setTimeout(typingTimeout, 3000);
    }else{
      clearTimeout(timeout)
      typingTimeout()
      //sendMessage() function will be called once the user hits enter
    }
})

function typingTimeout(){ 
    typing=false
    socket.emit('typing', {user:username, typing:false});
}

socket.on('display', ({data, user})=>{
    if(data.typing==true){
      $('#typing').attr('style', 'color: #4AC959 !important')
      $('#typing').text(`${user.username} is typing...`)
    } else {
        outputUsers(user);
    }
})


//Join Chatroom
socket.emit('joinRoom', {username, room, gender});

//get rooms and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on('message', message => {
    console.log(message);
    writeMessage(message);

    //scroll down
    chatBox.scrollTop = chatBox.scrollHeight;
})

//Message submit

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //take message from message box
    const msg = e.target.elements.msg.value;
    
    //now emmit message to server
    socket.emit('newMessage', msg);

    //clear Input message 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


//write message to dom

function writeMessage(message) {
    let userImage;
    if (message.gender === "male") {
        userImage = "man.svg"
    } else if (message.gender === "female") {
        userImage = "girl.svg"
    } else {
        userImage = "bot.svg"
    }

    const div = document.createElement('div');

    if(message.username === username){
        const cls = ["media", "mw-75", "w-md-50", "ml-auto", "mb-1", "align-right"];
        div.classList.add(...cls);

        div.innerHTML = `
            <div class="media-body">
                <span class="small user-name text-muted">You</span>
                <div>
                <div class="bg-primary chat-trim rounded py-2 px-3 mb-2">
                    <p class="text-small mb-0 text-white">${message.msg}</p>
                </div>
                </div>
                <p class="small text-muted">${message.time} | Aug 13</p>
            </div>
        `

    } else {
        const cls = ["media", "mw-90", "w-md-50", "mb-3"];
        div.classList.add(...cls);

        div.innerHTML = `<img src="./images/icons/${userImage}" alt="user" width="50" class="rounded-circle">
        <div class="media-body ml-3">
        <span class="small user-name text-muted">${message.username}</span>
        <div>
            <div class="bg-light chat-trim rounded py-2 px-3 mb-2">
            <p class="text-small mb-0 text-muted">${message.msg}</p>
            </div>
        </div>
        <p class="small text-muted">${message.time} | Aug 13</p>
        </div>  
    `;
    }

    document.querySelector('.chat-box').appendChild(div);
}

// add room name
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to DOM
function outputUsers(users) {
    let userNames = users.map(user => user.username).join(", ");
    $('#typing').attr('style', 'color: #6c757d !important');
    $('#typing').text(userNames.slice(0,30).concat("..."));
}
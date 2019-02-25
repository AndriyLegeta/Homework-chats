let socket = io();

/*
socket.on('welcome',(data)=>{
    console.log(data);

});*/
socket.on('message',(message)=>{
    showMessage(message);
});

socket.on('init', function({messages}){ // берем всі messages робим по ним цикл і відображаємо
    for(const message of messages){
        showMessage(message);
    }
});

let messageBtn = document.getElementById('message-btn');
let messagesDiv = document.getElementById('messages');

messageBtn.onclick = function () {
   let messageInput =  document.getElementById('message-input');
   let messageValue = messageInput.value;
    messageInput.value = '';
    socket.emit('message',{message:messageValue})  // створюєм повідомлення зі змістом інпуту

};

function showMessage(message) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerText = `${message.date}${message.author}${message.text}`
    messagesDiv.appendChild(messageDiv);
}
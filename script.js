const socket = io("https://chat-application-backend-n0hp.onrender.com");

let username = '';
let currentRoom = 'general';

const joinScreen = document.getElementById('joinScreen');
const chatScreen = document.getElementById('chatScreen');
const messagesDiv = document.getElementById('messages');
const currentRoomEl = document.getElementById('currentRoom');


socket.on('message', (data) => {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = `[${data.time}] ${data.username}: ${data.text}`;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('joined', (user) => {
  addSystemMsg(`${user} joined!`);
});

socket.on('rooms', (roomList) => {
  // Auto-populate if needed
});

function addSystemMsg(text) {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.style.color = '#4CAF50';
  msg.textContent = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function joinChat() {
  username = document.getElementById('username').value.trim();
  currentRoom = document.getElementById('roomInput').value.trim() || 'general';
  
  if (!username) return alert('Enter username!');
  
  socket.emit('join', { username, room: currentRoom });
  currentRoomEl.textContent = currentRoom;
  
  joinScreen.style.display = 'none';
  chatScreen.style.display = 'flex';
}

function createRoom() {
  const roomName = document.getElementById('newRoom').value.trim();
  if (roomName) {
    socket.emit('create-room', roomName);
    document.getElementById('newRoom').value = '';
  }
}

function sendMessage() {
  const text = document.getElementById('messageInput').value.trim();
  if (text) {
    socket.emit('message', { room: currentRoom, text, username });
    document.getElementById('messageInput').value = '';
  }
}

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

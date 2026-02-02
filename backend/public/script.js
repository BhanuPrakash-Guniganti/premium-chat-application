const socket = io();

// DOM elements
const loginOverlay = document.getElementById("login-overlay");
const usernameInput = document.getElementById("username-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const roomListEl = document.getElementById("room-list");
const newRoomInput = document.getElementById("new-room-input");
const createRoomBtn = document.getElementById("create-room-btn");
const roomError = document.getElementById("room-error");

const currentRoomNameEl = document.getElementById("current-room-name");
const currentUsernameEl = document.getElementById("current-username");

const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const messageError = document.getElementById("message-error");

// State
let currentUsername = null;
let currentRoom = null;

// Helpers
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Basic text formatting: **bold**, *italic*, links
function formatMessageText(text) {
  // Escape HTML
  let safe = text.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;");

  // bold: **text**
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // italic: *text*
  safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // links: http(s)://...
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  safe = safe.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

  return safe;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderRoomList(rooms) {
  roomListEl.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.className = "room-item" + (room === currentRoom ? " active" : "");
    li.dataset.room = room;

    const nameSpan = document.createElement("span");
    nameSpan.textContent = room;

    li.appendChild(nameSpan);
    li.addEventListener("click", () => joinRoom(room));

    roomListEl.appendChild(li);
  });
}

// Message rendering
function addSystemMessage(text, timestamp) {
  const p = document.createElement("p");
  p.className = "system-message";
  p.textContent = `[${formatTime(timestamp)}] ${text}`;
  messagesEl.appendChild(p);
  scrollToBottom();
}

function addChatMessage({ username, text, timestamp }) {
  const row = document.createElement("div");
  const isSelf = username === currentUsername;
  row.className = "message-row " + (isSelf ? "self" : "other");

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = `${username} • ${formatTime(timestamp)}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = formatMessageText(text);

  row.appendChild(meta);
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  scrollToBottom();
}

// Actions
function attemptLogin() {
  const username = usernameInput.value.trim();
  loginError.textContent = "";

  socket.emit("login", { username }, (response) => {
    if (!response.success) {
      loginError.textContent = response.message || "Login failed.";
      return;
    }
    currentUsername = response.username;
    currentUsernameEl.textContent = "You: " + currentUsername;
    loginOverlay.style.display = "none";
  });
}

function createRoom() {
  const roomName = newRoomInput.value.trim();
  roomError.textContent = "";
  if (!roomName) {
    roomError.textContent = "Room name cannot be empty.";
    return;
  }
  socket.emit("createRoom", { roomName }, (res) => {
    if (!res.success) {
      roomError.textContent = res.message || "Could not create room.";
      return;
    }
    newRoomInput.value = "";
    joinRoom(res.roomName);
  });
}

function joinRoom(roomName) {
  if (!currentUsername) {
    roomError.textContent = "Login first.";
    return;
  }
  socket.emit("joinRoom", { roomName }, (res) => {
    if (!res.success) {
      roomError.textContent = res.message || "Could not join room.";
      return;
    }
    currentRoom = res.roomName;
    currentRoomNameEl.textContent = "Room: " + currentRoom;
    messageError.textContent = "";
    messagesEl.innerHTML = ""; // clear old room messages

    // update active class
    const items = document.querySelectorAll(".room-item");
    items.forEach((el) => {
      el.classList.toggle("active", el.dataset.room === currentRoom);
    });
  });
}

function sendMessage() {
  const text = messageInput.value.trim();
  messageError.textContent = "";

  if (!currentUsername) {
    messageError.textContent = "Login first.";
    return;
  }
  if (!currentRoom) {
    messageError.textContent = "Join a room first.";
    return;
  }
  if (!text) {
    messageError.textContent = "Message cannot be empty.";
    return;
  }

  socket.emit("chatMessage", { text }, (res) => {
    if (!res.success) {
      messageError.textContent = res.message || "Could not send message.";
      return;
    }
    messageInput.value = "";
  });
}

// Event listeners (DOM)
loginBtn.addEventListener("click", attemptLogin);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

createRoomBtn.addEventListener("click", createRoom);
newRoomInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") createRoom();
});

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Socket events
socket.on("roomList", (rooms) => {
  renderRoomList(rooms);
});

socket.on("systemMessage", ({ text, timestamp }) => {
  if (!currentRoomNameEl.textContent.includes("Room:")) return;
  addSystemMessage(text, timestamp);
});

socket.on("chatMessage", (msg) => {
  addChatMessage(msg);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// Load index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------------- In-memory state ----------------
const users = new Map();               // socket.id -> { username, room }
const usernames = new Set();          // active usernames
const rooms = new Set(["General"]);   // default room
// ------------------------------------------------

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("roomList", Array.from(rooms));

  socket.on("login", ({ username }, callback) => {
    username = (username || "").trim();

    if (!username)
      return callback({ success: false, message: "Username cannot be empty." });

    if (usernames.has(username))
      return callback({ success: false, message: "Username already taken." });

    usernames.add(username);
    users.set(socket.id, { username, room: null });

    callback({ success: true, username });
  });

  socket.on("createRoom", ({ roomName }, callback) => {
    roomName = (roomName || "").trim();

    if (!roomName)
      return callback({ success: false, message: "Room name cannot be empty." });

    if (rooms.has(roomName))
      return callback({ success: false, message: "Room already exists." });

    rooms.add(roomName);
    io.emit("roomList", Array.from(rooms));

    callback({ success: true, roomName });
  });

  socket.on("joinRoom", ({ roomName }, callback) => {
    const user = users.get(socket.id);

    if (!user)
      return callback({ success: false, message: "User not logged in." });

    if (!rooms.has(roomName))
      return callback({ success: false, message: "Room does not exist." });

    if (user.room) {
      socket.leave(user.room);
      io.to(user.room).emit("systemMessage", {
        text: `${user.username} left the room.`,
        timestamp: new Date().toISOString()
      });
    }

    user.room = roomName;
    socket.join(roomName);

    io.to(roomName).emit("systemMessage", {
      text: `${user.username} joined the room.`,
      timestamp: new Date().toISOString()
    });

    callback({ success: true, roomName });
  });

  socket.on("chatMessage", ({ text }, callback) => {
    const user = users.get(socket.id);

    if (!user || !user.room)
      return callback({ success: false, message: "Join a room first." });

    text = (text || "").trim();
    if (!text)
      return callback({ success: false, message: "Message cannot be empty." });

    io.to(user.room).emit("chatMessage", {
      username: user.username,
      text,
      timestamp: new Date().toISOString()
    });

    callback({ success: true });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (!user) return;

    if (user.room) {
      io.to(user.room).emit("systemMessage", {
        text: `${user.username} disconnected.`,
        timestamp: new Date().toISOString()
      });
    }

    usernames.delete(user.username);
    users.delete(socket.id);

    console.log("User disconnected:", socket.id);
  });
});

// IMPORTANT FOR HOSTING
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

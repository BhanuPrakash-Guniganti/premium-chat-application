const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());

// Serve frontend from backend/public
app.use(express.static(path.join(__dirname, "public")));

// Explicit root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Simple in-memory state
const rooms = new Set(["general"]);
const users = new Map();

// Socket handlers
io.on("connection", (socket) => {
  console.log("✅ CONNECTED:", socket.id);

  socket.on("join", ({ username, room }) => {
    if (!username) return;

    if (users.has(username)) {
      socket.emit("error", "Username already taken");
      return;
    }

    users.set(username, socket.id);
    socket.join(room);

    socket.emit("rooms", Array.from(rooms));
    socket.to(room).emit("joined", username);

    console.log(`👤 ${username} joined ${room}`);
  });

  socket.on("message", ({ room, text, username }) => {
    if (!text) return;

    io.to(room).emit("message", {
      username,
      text,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("create-room", (roomName) => {
    if (!roomName) return;

    rooms.add(roomName);
    io.emit("rooms", Array.from(rooms));
  });

  socket.on("disconnect", () => {
    console.log("❌ DISCONNECTED:", socket.id);
  });
});

// Render dynamic port
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

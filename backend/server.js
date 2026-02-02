const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

const rooms = new Set(['general']);
const users = new Map();

io.on('connection', (socket) => {
  console.log('✅ CONNECTED:', socket.id);
  
  socket.on('join', ({username, room}) => {
    if (users.has(username)) return socket.emit('error', 'Name taken');
    users.set(username, socket.id);
    socket.join(room);
    socket.emit('rooms', Array.from(rooms));
    socket.to(room).emit('joined', username);
    console.log(`👤 ${username} joined ${room}`);
  });
  
  socket.on('message', ({room, text, username}) => {
    io.to(room).emit('message', {
      username, 
      text, 
      time: new Date().toLocaleTimeString()
    });
  });
  
  socket.on('create-room', (roomName) => {
    rooms.add(roomName);
    io.emit('rooms', Array.from(rooms));
  });
  
  socket.on('disconnect', () => {
    console.log('❌ DISCONNECTED:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


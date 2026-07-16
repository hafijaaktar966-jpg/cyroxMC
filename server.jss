const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io সেটআপ (CORS হ্যান্ডলিং সহ)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 10000;

// public ফোল্ডার থেকে স্ট্যাটিক ফাইল ও ক্লায়েন্ট সার্ভ করা
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io রিয়েল-টাইম কানেকশন হ্যান্ডলিং
io.on('connection', (socket) => {
  console.log('A user connected to Andromeda Chat:', socket.id);

  // ইউজারের মেসেজ রিসিভ করা এবং সবাইকে ব্রডকাস্ট করা
  socket.on('chatMessage', (msg) => {
    // মেসেজটি চ্যাটে থাকা সবার কাছে চলে যাবে
    io.emit('chatMessage', { sender: 'You', text: msg });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Andromeda Chat is running smoothly on port ${PORT}`);
});

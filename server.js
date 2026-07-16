const express = require('express');
const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true 
});

const PORT = process.env.PORT || 3000;

// public ফোল্ডারের ভেতরের HTML, CSS ফাইল সার্ভ করার জন্য
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('CyroxMC Chat & Live Map Server is Running!');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ১. চ্যাট মেসেজ রিসিভ এবং বাকিদের কাছে পাঠানো
  socket.on('chat message', (data) => {
    socket.broadcast.emit('chat message', data);
  });

  // ২. লাইভ লোকেশন ডাটা রিসিভ এবং সবার ম্যাপে ব্রডকাস্ট করা
  socket.on('update location', (data) => {
    // এটি io.emit করা হয়েছে যাতে নিজের ও অন্য সবার ম্যাপে রিয়েল-টাইমে মার্কার আপডেট হয়
    io.emit('user location', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
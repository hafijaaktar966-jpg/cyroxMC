const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Socket.io কনফিগারেশন (CORS এবং WebSocket অন করা)
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

// আপনার HTML, CSS, JS ফাইলগুলো 'public' ফোল্ডারে থাকলে তা লোড করার জন্য
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('CyroxMC Chat Server is Running!');
});

// Socket.io লাইভ কানেকশন
io.on('connection', (socket) => {
  console.log('একজন ইউজার যুক্ত হয়েছেন। ID:', socket.id);

  // HTML ফাইলের 'chat message' ইভেন্টের সাথে ম্যাচ করা হলো
  socket.on('chat message', (msg) => {
    console.log('নতুন মেসেজ:', msg);
    // এই মেসেজটি সাথে সাথে সবার ফোনে ও ব্রাউজারে পাঠিয়ে দেবে
    socket.broadcast.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('ইউজার ডিসকানেক্ট হয়েছেন।');
  });
});

// সার্ভার পোর্ট লিসেনিং
http.listen(PORT, () => {
  console.log(`সার্ভার চলছে পোর্ট: ${PORT}`);
});
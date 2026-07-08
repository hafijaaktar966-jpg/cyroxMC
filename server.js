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

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('CyroxMC Chat & Voice Server is Running!');
});

// লাইভ কল ডেটা স্টোর করার অবজেক্ট
let activeCall = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (data) => {
    socket.broadcast.emit('chat message', data);
  });

  // কল শুরু হলে
  socket.on('start call', (data) => {
    console.log(`Call started by: ${data.from}`);
    activeCall = { ...data, signal: null };
    socket.broadcast.emit('incoming call', activeCall);
  });

  // কল দাতার সিগন্যাল স্টোর ও ট্রান্সফার করা
  socket.on('sending signal', (data) => {
    if (activeCall) {
      activeCall.signal = data.signal;
      socket.broadcast.emit('incoming call', activeCall);
    }
  });

  // কল গ্রহীতার সিগন্যাল ফেরত পাঠানো
  socket.on('returning signal', (data) => {
    socket.broadcast.emit('receive signal', data);
  });

  // কল কেটে দিলে
  socket.on('stop call', () => {
    console.log('Call ended');
    activeCall = null;
    socket.broadcast.emit('end call');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected.');
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
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
  res.send('CyroxMC Chat & Live Map Server is Running!');
});

// 🗺️ সব ইউজারের লাইভ লোকেশন সেভ রাখার অবজেক্ট
let activeLocations = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // চ্যাটে ঢোকার সাথে সাথে ডাটাবেজ বা মেমোরি থেকে পুরাতন সবার লোকেশন নতুন ইউজারকে পাঠানো
  socket.emit('initial locations', activeLocations);

  // চ্যাট মেসেজ
  socket.on('chat message', (data) => {
    socket.broadcast.emit('chat message', data);
  });

  // লাইভ লোকেশন আপডেট এবং মেমোরিতে সেভ
  socket.on('update location', (data) => {
    if (data.id && data.lat && data.lng) {
      activeLocations[data.id] = data; // মেমোরিতে সেভ রাখা হলো
      io.emit('user location', data); // সবাইকে পাঠানো হলো
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

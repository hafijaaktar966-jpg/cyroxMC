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

// 🗺️ ডাটা স্টোরেজ অ্যারে এবং অবজেক্ট
let activeLocations = {};
let chatHistory = []; // মেসেজ হিস্ট্রি সেভ রাখার জন্য

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // চ্যাটে ঢোকার সাথে সাথে নতুন ইউজারকে ম্যাপের লোকেশন এবং সব পুরোনো মেসেজ পাঠানো
  socket.emit('initial locations', activeLocations);
  socket.emit('chat history', chatHistory); // হিস্ট্রি পাঠানো হলো

  // চ্যাট মেসেজ রিসিভ, হিস্ট্রিতে সেভ এবং বাকিদের পাঠানো
  socket.on('chat message', (data) => {
    chatHistory.push(data); // সার্ভার মেমোরিতে মেসেজ সেভ করা হলো
    
    // মেসেজ লিমিট করার জন্য (সর্বশেষ ১০০টি মেসেজ সেভ থাকবে যাতে সার্ভার স্লো না হয়)
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }
    
    socket.broadcast.emit('chat message', data);
  });

  // লাইভ লোকেশন আপডেট
  socket.on('update location', (data) => {
    if (data.id && data.lat && data.lng) {
      activeLocations[data.id] = data;
      io.emit('user location', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
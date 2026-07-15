const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);

// Socket.io সেটআপ (CORS পলিসি হ্যান্ডেল করা সহ)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 10000;

// জেমিনি এআই কনফিগারেশন
const apiKey = process.env.GEMINI_API_KEY;
let aiActive = false;
let model;

if (apiKey) {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // লেটেস্ট ও স্টেবল জেমিনি মডেল ব্যবহার
    model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    aiActive = true;
    console.log("Andromeda API: Gemini AI initialized successfully.");
  } catch (err) {
    console.error("Andromeda API: Gemini initialization failed.", err);
  }
} else {
  console.log("Andromeda API: GEMINI_API_KEY is missing. AI features will be disabled.");
}

// স্ট্যাটিক ফাইল ও ক্লায়েন্ট সার্ভ করা
app.use(express.static(path.join(__dirname, 'public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public 'index.html'));
});

// Socket.io রিয়েল-টাইম কানেকশন হ্যান্ডলিং
io.on('connection', (socket) => {
  console.log('A explorer connected to Andromeda:', socket.id);

  socket.on('chatMessage', async (msg) => {
    // ইউজারের মেসেজ ব্রডকাস্ট করা
    io.emit('chatMessage', { sender: 'You', text: msg });

    if (!aiActive || !model) {
      socket.emit('chatMessage', { sender: 'AI', text: 'দুঃখিত, অ্যান্ড্রোমিডা সার্ভারে Gemini API Key সেটআপ করা নেই।' });
      return;
    }

    try {
      // জেমিনি থেকে রেসপন্স জেনারেট করা
      const result = await model.generateContent(msg);
      const aiResponse = result.response.text();
      io.emit('chatMessage', { sender: 'AI', text: aiResponse });
    } catch (error) {
      console.error("Gemini Error:", error);
      socket.emit('chatMessage', { sender: 'AI', text: 'দুঃখিত, এআই প্রসেস করার সময় একটি ক্রুটি ঘটেছে।' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Explorer disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Andromeda is shining bright on port ${PORT}`);
});

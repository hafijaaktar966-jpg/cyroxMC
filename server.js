const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// 🔑 এনভায়রনমেন্ট ভেরিয়েবল থেকে নিরাপদভাবে API Key রিড করা
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('CyroxMC Super Chat & AI Map Server is Running!');
});

let activeLocations = {};
let chatHistory = []; 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.emit('initial locations', activeLocations);
  socket.emit('chat history', chatHistory); 

  socket.on('chat message', (data) => {
    chatHistory.push(data); 
    if (chatHistory.length > 100) chatHistory.shift();
    socket.broadcast.emit('chat message', data);
  });

  socket.on('update location', (data) => {
    if (data.id && data.lat && data.lng) {
      activeLocations[data.id] = data;
      io.emit('user location', data);
    }
  });

  // 🤖 আসল AI Hub রেসপন্স সিস্টেম
  socket.on('ai prompt', async (data) => {
    console.log(`AI request received [Type: ${data.type}]: ${data.prompt}`);
    
    if (data.type === 'chat') {
      try {
        if (!GEMINI_API_KEY) {
          socket.emit('ai response', { type: 'chat', text: "API Key সেটআপ করা হয়নি। দয়া করে Render ড্যাশবোর্ডে আপনার Gemini API Key যুক্ত করুন।" });
          return;
        }

        // Gemini AI মডেল কল করা
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(data.prompt);
        const responseText = result.response.text();

        // শুধুমাত্র যে ইউজার প্রম্পট পাঠিয়েছে তাকেই উত্তর ব্যাক করা
        socket.emit('ai response', { type: 'chat', text: responseText });

      } catch (error) {
        console.error("Gemini AI Error:", error);
        socket.emit('ai response', { type: 'chat', text: "দুঃখিত, এআই প্রসেস করার সময় একটি ত্রুটি ঘটেছে।" });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// সার্ভার লিসেনিং (ভুল ও ডুপ্লিকেট অংশ রিমুভ করা হয়েছে)
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
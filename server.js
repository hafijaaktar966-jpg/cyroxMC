const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('একজন ইউজার যুক্ত হয়েছেন! ID:', socket.id);

    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('ইউজার চলে গেছেন।');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`সার্ভার সচল হয়েছে: http://localhost:${PORT}`);
});

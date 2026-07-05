const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const chatBox = document.getElementById('chat-box');

// ফর্ম সাবমিট হলে সার্ভারে মেসেজ পাঠানো
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() !== '') {
        socket.emit('chatMessage', input.value);
        input.value = '';
    }
});

// সার্ভার থেকে আসা মেসেজ পর্দায় দেখানো
socket.on('chatMessage', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    
    // অটো স্ক্রোল ডাউন
    chatBox.scrollTop = chatBox.scrollHeight;
});

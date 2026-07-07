// আপনার Render সার্ভারের সাথে সরাসরি এবং ফাস্ট কানেকশন
const socket = io("https://cyroxmc-hpsr.onrender.com", {
    transports: ['websocket'],
    upgrade: false
});

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const chatBox = document.getElementById('chat-box');

// ফর্ম সাবমিট বা সেন্ড বাটনে ক্লিক করলে সার্ভারে মেসেজ যাবে
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() !== '') {
        socket.emit('chatMessage', input.value);
        input.value = ''; // মেসেজ পাঠানোর পর ইনপুট বক্স খালি হবে
    }
});

// সার্ভার থেকে নতুন কোনো মেসেজ আসলে তা পেজ রিফ্রেশ ছাড়াই স্ক্রিনে দেখাবে
socket.on('chatMessage', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    
    // নতুন মেসেজ আসলে চ্যাট বক্স অটোমেটিক নিচে স্ক্রোল হবে
    chatBox.scrollTop = chatBox.scrollHeight;
});
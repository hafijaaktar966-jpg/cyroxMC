// রেন্ডার সার্ভারের সাথে Socket.io কানেক্ট করা
const socket = io();

// ডম এলিমেন্টগুলো সিলেক্ট করা
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const tabButtons = document.querySelectorAll('.tab-btn');

// ট্যাব সুইচিং লজিক (ডিজাইন অনুযায়ী ট্যাব বদলানোর জন্য)
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // এখানে চাইলে অন্য ট্যাবের কন্টেন্ট শো/হাইড করার কোড লিখতে পারো
        const targetTab = button.getAttribute('data-tab');
        console.log(`Switched to: ${targetTab}`);
    });
});

// সার্ভারে মেসেজ পাঠানো
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message) {
        // 'chatMessage' ইভেন্টের মাধ্যমে সার্ভারে পাঠানো হচ্ছে
        socket.emit('chatMessage', message);
        messageInput.value = '';
        messageInput.focus();
    }
});

// সার্ভার থেকে মেসেজ রিসিভ করা এবং স্ক্রিনে দেখানো
socket.on('chatMessage', (data) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (data.sender === 'You') {
        messageDiv.classList.add('user-message');
        messageDiv.innerHTML = `<span class="sender">You:</span> <span class="text">${data.text}</span>`;
    } else {
        messageDiv.classList.add('ai-message');
        messageDiv.innerHTML = `<span class="sender">AI:</span> <span class="text">${data.text}</span>`;
    }

    // চ্যাট বক্সে নতুন মেসেজ যুক্ত করা
    chatMessages.appendChild(messageDiv);
    
    // নতুন মেসেজ আসলে অটোমেটিক নিচে স্ক্রোল হবে
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// সার্ভার কানেকশন চেক (টেস্টিংয়ের জন্য কনসোলে দেখাবে)
socket.on('connect', () => {
    console.log('Successfully connected to Andromeda Server!');
});

socket.on('disconnect', () => {
    console.log('Disconnected from Andromeda Server.');
});

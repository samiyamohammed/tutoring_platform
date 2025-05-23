document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const loginForm = document.getElementById('loginForm');
    const roomsList = document.getElementById('roomsList');
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const currentRoomName = document.getElementById('currentRoomName');
    const typingIndicator = document.getElementById('typingIndicator');
    const logoutButton = document.getElementById('logoutButton');

    // Global variables
    let socket;
    let currentUser;
    let currentRoomId = null;
    let rooms = [];
    let typingTimeout;
    let authToken = localStorage.getItem('chatToken');

    // Initialize the application
    initApp();

    function initApp() {
        // Check if already logged in
        if (authToken) {
            validateTokenAndConnect();
        } else {
            loginModal.show();
        }

        // Setup event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Login form submission
        loginForm.addEventListener('submit', handleLogin);

        // Logout button
        logoutButton.addEventListener('click', handleLogout);

        // Send message button
        sendButton.addEventListener('click', sendMessage);

        // Send message on Enter key
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Typing indicators
        messageInput.addEventListener('input', function () {
            if (currentRoomId) {
                socket.emit('typing', currentRoomId);
            }
        });

        messageInput.addEventListener('blur', function () {
            if (currentRoomId) {
                socket.emit('stopTyping', currentRoomId);
            }
        });
    }

    async function validateTokenAndConnect() {
        try {
            // Verify token by making a simple request
            const response = await fetchWithAuth('http://localhost:5000/api/auth/verify');

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            const userData = await response.json();
            currentUser = userData.user;

            // Initialize socket connection
            initializeSocket(authToken);

            // Load chat rooms
            loadChatRooms();

            // Show logout button
            logoutButton.style.display = 'block';

        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('chatToken');
            loginModal.show();
        }
    }

    async function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const { token, user } = await response.json();

            // Store token and user data
            localStorage.setItem('chatToken', token);
            authToken = token;
            currentUser = user;

            // Initialize socket connection with the new token
            initializeSocket(token);

            // Load chat rooms
            loadChatRooms();

            // Hide login modal and show logout button
            loginModal.hide();
            logoutButton.style.display = 'block';

        } catch (error) {
            alert(error.message);
            console.error('Login error:', error);
        }
    }

    function handleLogout() {
        // Disconnect socket
        if (socket) {
            socket.disconnect();
        }

        // Clear stored data
        localStorage.removeItem('chatToken');
        authToken = null;
        currentUser = null;
        currentRoomId = null;
        rooms = [];

        // Reset UI
        roomsList.innerHTML = '';
        messagesContainer.innerHTML = '<div class="text-center text-muted">Select a chat to start messaging</div>';
        currentRoomName.textContent = 'Select a chat';
        messageInput.disabled = true;
        sendButton.disabled = true;
        logoutButton.style.display = 'none';

        // Show login modal
        loginModal.show();
    }

    function initializeSocket(token) {
        // Close previous socket connection if exists
        if (socket) {
            socket.disconnect();
        }

        socket = io('http://localhost:5000', {
            auth: {
                Authorization: `Bearer ${token}`,
            },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        // Socket event listeners
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            if (error.message === 'Authentication error') {
                handleLogout();
                alert('Session expired. Please login again.');
            }
        });

        // Handle new message - updated to match backend event name
        socket.on('receive-message', (message) => {
            if (message.room === currentRoomId || message.roomId === currentRoomId) {
                // Check if this is our own message (optimistic update)
                const isSent = message.sender._id === currentUser.id;

                // For our own messages, we've already shown them via optimistic update
                if (isSent) {
                    // Just update the temporary message with the real ID and any server additions
                    const tempMessageElement = document.querySelector(`[data-temp-id="temp-${message._id}"]`);
                    if (tempMessageElement) {
                        tempMessageElement.id = `message-${message._id}`;
                        tempMessageElement.removeAttribute('data-temp-id');

                        // Update any other fields that might have come from server
                        const contentElement = tempMessageElement.querySelector('.message-content');
                        if (contentElement && message.content !== contentElement.textContent) {
                            contentElement.textContent = message.content;
                        }
                    }
                } else {
                    // For others' messages, add normally if not already present
                    const existingMessage = document.getElementById(`message-${message._id}`);
                    if (!existingMessage) {
                        addMessageToChat(message, false);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }
            } else {
                updateRoomUnreadCount(message.room || message.roomId);
            }
        });

        // Handle message updates
        socket.on('messageUpdated', (message) => {
            if (message.room === currentRoomId) {
                updateMessageInChat(message);
            }
        });

        // Handle message deletion
        socket.on('messageDeleted', (messageId) => {
            const messageElement = document.getElementById(`message-${messageId}`);
            if (messageElement) {
                messageElement.querySelector('.message-content').textContent = 'This message has been deleted';
                messageElement.querySelector('.message-content').classList.add('text-muted', 'fst-italic');
            }
        });

        // Handle reaction added
        socket.on('reactionAdded', (data) => {
            if (data.roomId === currentRoomId) {
                updateMessageReactions(data.messageId, data.reactions);
            }
        });

        // Handle typing indicators
        socket.on('userTyping', (data) => {
            if (data.roomId === currentRoomId) {
                typingIndicator.textContent = `${data.name} is typing...`;
                typingIndicator.style.display = 'block';

                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    typingIndicator.style.display = 'none';
                }, 3000);
            }
        });

        socket.on('userStoppedTyping', (data) => {
            if (data.roomId === currentRoomId) {
                typingIndicator.style.display = 'none';
            }
        });
    }

    async function loadChatRooms() {
        try {
            const response = await fetchWithAuth('http://localhost:5000/api/chat');

            if (!response.ok) {
                throw new Error('Failed to load chat rooms');
            }

            rooms = await response.json();
            renderChatRooms();

            // Join all rooms on socket
            if (socket) {
                socket.emit('joinRooms');
            }

        } catch (error) {
            console.error('Error loading chat rooms:', error);
            alert(error.message);
        }
    }

    function renderChatRooms() {
        roomsList.innerHTML = '';

        if (rooms.length === 0) {
            roomsList.innerHTML = '<div class="text-center text-muted p-3">No chat rooms available</div>';
            return;
        }

        rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item list-group-item d-flex align-items-center';
            if (room._id === currentRoomId) {
                roomElement.classList.add('active');
            }

            // Determine room name (for private chats, show other participant's name)
            let roomName;
            let avatarText = '';

            if (room.isGroupChat) {
                roomName = room.name;
                avatarText = roomName.charAt(0).toUpperCase();
            } else {
                const otherParticipant = room.members.find(member => member._id !== currentUser.id);
                roomName = otherParticipant ? otherParticipant.name : 'Private Chat';
                avatarText = roomName.charAt(0).toUpperCase();
            }

            roomElement.innerHTML = `
                <div class="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                     style="width: 40px; height: 40px;">${avatarText}</div>
                <div class="room-info flex-grow-1">
                  <div class="room-name fw-bold">${roomName}</div>
                  <div class="last-message text-muted small text-truncate" style="max-width: 150px;">
                    ${room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                  </div>
                </div>
                ${room.unreadCounts && room.unreadCounts[currentUser.id] > 0 ?
                    `<span class="unread-count">${room.unreadCounts[currentUser.id]}</span>` : ''}
            `;

            roomElement.addEventListener('click', () => {
                selectChatRoom(room._id);
            });

            roomsList.appendChild(roomElement);
        });
    }

    async function selectChatRoom(roomId) {
        currentRoomId = roomId;
        renderChatRooms();

        // Enable message input
        messageInput.disabled = false;
        sendButton.disabled = false;

        // Load room details
        const room = rooms.find(r => r._id === roomId);
        if (room) {
            // Set room name
            if (room.isGroupChat) {
                currentRoomName.textContent = room.name;
            } else {
                const otherParticipant = room.members.find(member => member._id !== currentUser.id);
                currentRoomName.textContent = otherParticipant ? otherParticipant.name : 'Private Chat';
            }

            // Load messages
            await loadMessages(roomId);

            // Mark messages as read
            markMessagesAsRead(roomId);
        }
    }

    async function loadMessages(roomId) {
        try {
            const response = await fetchWithAuth(`http://localhost:5000/api/chat/${roomId}/messages`);
            const messages = await response.json();
            renderMessages(messages);

        } catch (error) {
            console.error('Error loading messages:', error);
            alert(error.message);
        }
    }

    function renderMessages(messages) {
        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<div class="text-center text-muted">No messages yet</div>';
            return;
        }

        // Reverse the array to show newest at bottom
        messages.reverse().forEach(message => {
            addMessageToChat(message, message.sender._id === currentUser.id);
        });

        // Scroll to bottom after rendering
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 0);
    }

    function addMessageToChat(message, isSent) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
        messageElement.id = `message-${message._id}`;

        // Add data attribute for temporary messages
        if (message._id.startsWith('temp-')) {
            messageElement.setAttribute('data-temp-id', message._id);
        }

        // Format time
        const time = new Date(message.createdAt || new Date()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="sender-name fw-bold">${isSent ? 'You' : message.sender.name}</span>
            <span class="message-time small text-muted">${time}</span>
        </div>
        <div class="message-content">${message.content}</div>
        ${message.reactions && message.reactions.length > 0 ?
                `<div class="reactions mt-1">${renderReactions(message.reactions)}</div>` : ''}
        ${message.edited ? '<small class="text-muted">edited</small>' : ''}
    `;

        // Append new messages to the end
        messagesContainer.appendChild(messageElement);
    }

    function updateMessageInChat(message) {
        const messageElement = document.getElementById(`message-${message._id}`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            contentElement.textContent = message.content;

            const reactionsElement = messageElement.querySelector('.reactions');
            if (reactionsElement) {
                reactionsElement.innerHTML = renderReactions(message.reactions);
            } else if (message.reactions && message.reactions.length > 0) {
                messageElement.innerHTML += `<div class="reactions mt-1">${renderReactions(message.reactions)}</div>`;
            }

            if (message.edited) {
                const editedElement = messageElement.querySelector('.edited-text');
                if (!editedElement) {
                    messageElement.innerHTML += '<small class="text-muted">edited</small>';
                }
            }
        }
    }

    function renderReactions(reactions) {
        const reactionCounts = {};
        reactions.forEach(reaction => {
            reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
        });

        return Object.entries(reactionCounts)
            .map(([emoji, count]) => `<span class="reaction">${emoji} ${count}</span>`)
            .join(' ');
    }

    function updateMessageReactions(messageId, reactions) {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            const reactionsElement = messageElement.querySelector('.reactions');
            if (reactionsElement) {
                reactionsElement.innerHTML = renderReactions(reactions);
            } else if (reactions && reactions.length > 0) {
                messageElement.innerHTML += `<div class="reactions mt-1">${renderReactions(reactions)}</div>`;
            }
        }
    }

    function updateRoomUnreadCount(roomId) {
        const roomIndex = rooms.findIndex(r => r._id === roomId);
        if (roomIndex !== -1) {
            if (!rooms[roomIndex].unreadCounts) {
                rooms[roomIndex].unreadCounts = {};
            }
            rooms[roomIndex].unreadCounts[currentUser.id] =
                (rooms[roomIndex].unreadCounts[currentUser.id] || 0) + 1;
            renderChatRooms();
        }
    }

    async function markMessagesAsRead(roomId) {
        try {
            // Get all unread message IDs in this room
            const unreadMessageIds = Array.from(document.querySelectorAll('.message:not(.sent)'))
                .map(el => el.id.replace('message-', ''))
                .filter(id => id);

            if (unreadMessageIds.length > 0) {
                await fetchWithAuth(`http://localhost:5000/api/chat/${roomId}/messages/read`, {
                    method: 'POST',
                    body: JSON.stringify({ messageIds: unreadMessageIds })
                });

                // Update local room data
                const roomIndex = rooms.findIndex(r => r._id === roomId);
                if (roomIndex !== -1) {
                    if (rooms[roomIndex].unreadCounts) {
                        rooms[roomIndex].unreadCounts[currentUser.id] = 0;
                    }
                    renderChatRooms();
                }
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    async function sendMessage() {
        const content = messageInput.value.trim();
        if (content && currentRoomId) {
            try {
                // Generate a temporary ID that we can match later
                const tempId = 'temp-' + Date.now();

                // Optimistic update - add message immediately
                const tempMessage = {
                    _id: tempId,
                    content,
                    sender: {
                        _id: currentUser.id,
                        name: currentUser.name,
                        avatar: currentUser.avatar
                    },
                    createdAt: new Date(),
                    room: currentRoomId
                };

                addMessageToChat(tempMessage, true);
                messageInput.value = '';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Send to server via socket.io
                socket.emit('send-message', {
                    roomId: currentRoomId,
                    content: content,
                    tempId: tempId  // Include the temp ID so server can echo it back
                });

            } catch (error) {
                console.error('Error sending message:', error);
                alert(error.message);

                // Remove the optimistic update if it failed
                const tempMessageElement = document.querySelector(`[data-temp-id="${tempId}"]`);
                if (tempMessageElement) {
                    tempMessageElement.remove();
                }
            }
        }
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('chatToken');
        if (!token) {
            throw new Error('No authentication token');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            handleLogout();
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Request failed');
        }

        return response;
    }
});
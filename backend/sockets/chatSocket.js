const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

const chatSocket = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const anonymousId = `User_${Math.floor(Math.random() * 9000) + 1000}`;
    onlineUsers.set(socket.id, anonymousId);

    socket.join('general');
    socket.emit('assigned-id', anonymousId);

    // Send last 50 messages
    ChatMessage.find({ room: 'general' }).sort({ createdAt: -1 }).limit(50)
      .then(msgs => socket.emit('chat-history', msgs.reverse()))
      .catch(console.error);

    io.to('general').emit('user-joined', { message: `${anonymousId} joined the room`, count: onlineUsers.size });

    socket.on('send-message', async ({ message }) => {
      try {
        const chatMsg = await ChatMessage.create({ message, anonymousId, room: 'general' });
        io.to('general').emit('new-message', {
          _id: chatMsg._id, message, anonymousId, createdAt: chatMsg.createdAt
        });
      } catch (err) { console.error('Chat error:', err); }
    });

    socket.on('disconnect', () => {
      const id = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      io.to('general').emit('user-left', { message: `${id} left the room`, count: onlineUsers.size });
    });
  });
};

module.exports = chatSocket;
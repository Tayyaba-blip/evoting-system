import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

const useSocket = () => {
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [myId, setMyId] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(window.location.origin.replace('5173', '5000'), {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('assigned-id', (id) => setMyId(id));
    socket.on('chat-history', (msgs) => setMessages(msgs));
    socket.on('new-message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('user-joined', ({ message, count }) => {
      setOnlineCount(count);
      setMessages((prev) => [...prev, { _id: Date.now(), message, anonymousId: 'System', isSystem: true, createdAt: new Date() }]);
    });
    socket.on('user-left', ({ message, count }) => {
      setOnlineCount(count);
      setMessages((prev) => [...prev, { _id: Date.now() + 1, message, anonymousId: 'System', isSystem: true, createdAt: new Date() }]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('assigned-id');
      socket.off('chat-history');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, []);

  const sendMessage = (message) => {
    if (socketInstance && message.trim()) {
      socketInstance.emit('send-message', { message });
    }
  };

  return { messages, onlineCount, myId, connected, sendMessage };
};

export default useSocket;
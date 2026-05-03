import { useState, useRef, useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import styles from './LiveChat.module.css';

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const { messages, onlineCount, myId, connected, sendMessage } = useSocket();

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatWidget}>
      {open && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <span className={styles.chatIcon}>💬</span>
              <div>
                <div className={styles.chatTitle}>Anonymous Live Chat</div>
                <div className={styles.chatMeta}>
                  <span className={`${styles.dot} ${connected ? styles.online : styles.offline}`} />
                  {onlineCount} online · You are <strong>{myId}</strong>
                </div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg._id} className={`${styles.message} ${msg.isSystem ? styles.systemMsg : msg.anonymousId === myId ? styles.myMsg : styles.otherMsg}`}>
                {!msg.isSystem && (
                  <div className={styles.sender}>{msg.anonymousId === myId ? 'You' : msg.anonymousId}</div>
                )}
                <div className={styles.bubble}>{msg.message}</div>
                {!msg.isSystem && (
                  <div className={styles.time}>{formatTime(msg.createdAt)}</div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className={styles.inputRow} onSubmit={handleSend}>
            <input
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type anonymously..."
              maxLength={500}
              autoFocus
            />
            <button type="submit" className={styles.sendBtn} disabled={!input.trim() || !connected}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}

      <button className={styles.fab} onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
        {!open && messages.filter(m => !m.isSystem).length > 0 && (
          <span className={styles.badge}>{Math.min(messages.filter(m => !m.isSystem).length, 99)}</span>
        )}
      </button>
    </div>
  );
};

export default LiveChat;
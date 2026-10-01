import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Users,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

import useSocket from '../../hooks/useSocket';
import styles from './LiveChat.module.css';

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const bottomRef = useRef(null);

  const {
    messages,
    onlineCount,
    myId,
    connected,
    sendMessage,
  } = useSocket();

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!input.trim() || !connected) return;

    sendMessage(input.trim());
    setInput('');
  };

  const formatTime = (ts) => {
    const d = new Date(ts);

    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const messageCount = messages.filter(
    (m) => !m.isSystem
  ).length;

  return (
    <div className={styles.chatWidget}>
      {/* ================================
          CHAT WINDOW
      ================================= */}

      {open && (
        <div className={styles.chatBox}>

          {/* Header */}

          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>

              <div className={styles.headerIcon}>
                <MessageCircle size={18} />
              </div>

              <div className={styles.headerInfo}>
                <div className={styles.chatTitle}>
                  Anonymous Live Chat
                </div>

                <div className={styles.chatMeta}>
                  <span
                    className={`${styles.statusDot} ${
                      connected
                        ? styles.online
                        : styles.offline
                    }`}
                  />

                  <span>
                    {connected
                      ? `${onlineCount} online`
                      : 'Disconnected'}
                  </span>

                  <span className={styles.metaDivider}>
                    •
                  </span>

                  <span className={styles.identity}>
                    {myId || 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          {/* Privacy strip */}

          <div className={styles.privacyBar}>
            <ShieldCheck size={13} />

            <span>
              Messages are sent anonymously
            </span>
          </div>

          {/* Messages */}

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <MessageCircle size={21} />
                </div>

                <strong>No messages yet</strong>

                <span>
                  Start an anonymous conversation.
                </span>
              </div>
            )}

            {messages.map((msg) => {
              const mine =
                msg.anonymousId === myId;

              if (msg.isSystem) {
                return (
                  <div
                    key={msg._id}
                    className={styles.systemMsg}
                  >
                    <span>{msg.message}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id}
                  className={`${styles.message} ${
                    mine
                      ? styles.myMsg
                      : styles.otherMsg
                  }`}
                >
                  <div className={styles.sender}>
                    {mine
                      ? 'You'
                      : msg.anonymousId}
                  </div>

                  <div className={styles.bubble}>
                    {msg.message}
                  </div>

                  <div className={styles.time}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* Connection warning */}

          {!connected && (
            <div className={styles.connectionWarning}>
              <WifiOff size={13} />
              <span>
                Reconnecting to live chat...
              </span>
            </div>
          )}

          {/* Input */}

          <form
            className={styles.inputRow}
            onSubmit={handleSend}
          >
            <div className={styles.inputContainer}>
              <input
                className={styles.chatInput}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                placeholder={
                  connected
                    ? 'Type anonymously...'
                    : 'Waiting for connection...'
                }
                maxLength={500}
                disabled={!connected}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className={styles.sendBtn}
              disabled={
                !input.trim() || !connected
              }
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ================================
          FLOATING BUTTON
      ================================= */}

      <button
        type="button"
        className={`${styles.fab} ${
          open ? styles.fabOpen : ''
        }`}
        onClick={() => setOpen(!open)}
        aria-label={
          open ? 'Close live chat' : 'Open live chat'
        }
      >
        {open ? (
          <X size={19} />
        ) : (
          <MessageCircle size={20} />
        )}

        {!open && connected && (
          <span className={styles.activeIndicator} />
        )}

        {!open && messageCount > 0 && (
          <span className={styles.badge}>
            {Math.min(messageCount, 99)}
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveChat;
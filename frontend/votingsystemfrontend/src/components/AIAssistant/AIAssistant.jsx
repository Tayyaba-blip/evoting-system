import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  X,
  Send,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

import styles from './AIAssistant.module.css';

const FAQ = [
  {
    q: /register|signup|sign up/i,
    a: "To register as a voter, click the Register button and choose Sign Up. You'll need your CNIC front and back, a live selfie for face recognition, and a password. Your CNIC details will be verified before registration.",
  },
  {
    q: /login|log in/i,
    a: 'Voters log in using their CNIC number and password. Admins use email and password. Candidates use their registered email and password.',
  },
  {
    q: /vote|voting|cast/i,
    a: 'After logging in, open Voting from your voter dashboard. Complete face verification, select one candidate for each available assembly ballot, and submit your vote.',
  },
  {
    q: /blockchain|secure|security/i,
    a: 'Votes are recorded through the blockchain layer of the E-Voting system. Blocks are linked using cryptographic hashes so changes to recorded blockchain data can be detected.',
  },
  {
    q: /face|facial|camera/i,
    a: 'The system uses face recognition during voter authentication and voting. Your live face is compared with the face descriptor registered with your voter account.',
  },
  {
    q: /cnic|national id|identity/i,
    a: 'During registration, CNIC images can be scanned using OCR to help fill voter information. The submitted details are then checked against the CNIC records available to the system.',
  },
  {
    q: /candidate/i,
    a: 'Candidates are managed by the Election Commission administrator. Candidates have their own portal where they can view their profile and election information.',
  },
  {
    q: /admin/i,
    a: 'Administrators manage system information such as voters, candidates, parties, announcements, and election schedules.',
  },
  {
    q: /party|parties/i,
    a: 'Political parties are managed by the administrator. Candidates may be associated with a party or registered as independent candidates.',
  },
  {
    q: /mna|mpa|assembly/i,
    a: 'MNA refers to a Member of the National Assembly, while MPA refers to a Member of a Provincial Assembly. The voting system handles the available ballots separately.',
  },
  {
    q: /tehsil|area|constituency/i,
    a: 'The system uses voter location and constituency information to determine which candidates and ballots are available to that voter.',
  },
  {
    q: /help|how does|explain/i,
    a: 'I can help explain registration, login, voting, CNIC verification, face recognition, candidates, parties, and the blockchain features of this E-Voting system.',
  },
];

const defaultReplies = [
  "I'm not sure about that yet. Try asking me about registration, voting, CNIC verification, face recognition, blockchain, candidates, or parties.",
  'Could you rephrase that? I currently answer questions related to this E-Voting system.',
  'I can help with E-Voting questions such as how to register, log in, verify your identity, or cast a vote.',
];

const suggestions = [
  'How do I register?',
  'How does voting work?',
  'How is blockchain used?',
  'What is face recognition?',
];

const AIAssistant = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: "Hello! I'm your E-Voting Assistant. Ask me about registration, voting, CNIC verification, face recognition, candidates, or blockchain security.",
      time: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getReply = (text) => {
    for (const item of FAQ) {
      if (item.q.test(text)) {
        return item.a;
      }
    }

    return defaultReplies[
      Math.floor(Math.random() * defaultReplies.length)
    ];
  };

  const sendMessage = (text) => {
    const cleanText = text.trim();

    if (!cleanText || typing) return;

    const userMessage = {
      from: 'user',
      text: cleanText,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setTyping(true);

    timeoutRef.current = setTimeout(() => {
      const reply = getReply(cleanText);

      setMessages((prev) => [
        ...prev,
        {
          from: 'ai',
          text: reply,
          time: new Date(),
        },
      ]);

      setTyping(false);
    }, 700);
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.widget}>
      {open && (
        <div className={styles.box}>
          <div className={styles.glowOne} />
          <div className={styles.glowTwo} />

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <Bot size={19} strokeWidth={2.2} />
                <span className={styles.avatarOnline} />
              </div>

              <div className={styles.headerText}>
                <div className={styles.name}>
                  E-Voting Assistant
                  <Sparkles size={12} />
                </div>

                <div className={styles.status}>
                  <span className={styles.onlineDot} />
                  Online
                  <span className={styles.statusDivider} />
                  System Help
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X size={17} />
            </button>
          </div>

          {/* Security strip */}
          <div className={styles.securityStrip}>
            <ShieldCheck size={12} />
            E-Voting system assistance
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            <div className={styles.todayLabel}>
              <span>Today</span>
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.msg} ${
                  message.from === 'user'
                    ? styles.userMsg
                    : styles.aiMsg
                }`}
              >
                {message.from === 'ai' && (
                  <div className={styles.aiAvatar}>
                    <Bot size={13} />
                  </div>
                )}

                <div className={styles.messageContent}>
                  <div className={styles.bubble}>
                    <p>{message.text}</p>
                  </div>

                  <span className={styles.time}>
                    {formatTime(message.time)}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className={`${styles.msg} ${styles.aiMsg}`}>
                <div className={styles.aiAvatar}>
                  <Bot size={13} />
                </div>

                <div className={styles.messageContent}>
                  <div
                    className={`${styles.bubble} ${styles.typingBubble}`}
                  >
                    <div className={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  <span className={styles.typingLabel}>
                    Assistant is typing
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className={styles.suggestions}>
              <span className={styles.suggestionLabel}>
                QUICK QUESTIONS
              </span>

              <div className={styles.suggestionGrid}>
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    className={styles.suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={styles.inputArea}>
            <form
              className={styles.inputRow}
              onSubmit={handleSend}
            >
              <input
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the E-Voting system..."
                maxLength={300}
                autoComplete="off"
              />

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || typing}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>

            <div className={styles.inputFooter}>
              <span>System assistant</span>
              <span>{input.length}/300</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        className={`${styles.fab} ${
          open ? styles.fabOpen : ''
        }`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? (
          <X size={20} />
        ) : (
          <MessageCircle size={21} />
        )}

        {!open && (
          <>
            <span className={styles.fabOnline} />
            <span className={styles.pulse} />
          </>
        )}
      </button>
    </div>
  );
};

export default AIAssistant;
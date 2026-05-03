import { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';

const FAQ = [
  { q: /register|signup|sign up/i, a: "To register as a voter, click the 'Register' button on the top right → Sign Up. You'll need your CNIC (front & back), a live selfie for face recognition, and a password. Your CNIC will be verified against our national database." },
  { q: /login|log in/i, a: "Voters login with CNIC number + password. Admins use email + password. Candidates use email + temporary password (sent via email when registered by admin)." },
  { q: /vote|voting|cast/i, a: "After logging in, go to your dashboard → Voting (in the hamburger menu). Face verification runs continuously. You can vote for one MNA and one MPA candidate from your tehsil. Each vote is secured on the blockchain." },
  { q: /blockchain|secure|security/i, a: "Every vote is hashed using SHA-256 and chained to the previous block, forming an immutable blockchain stored in MongoDB. Any tampering breaks the chain and is immediately detectable." },
  { q: /face|facial|camera/i, a: "We use face-api.js running locally in your browser. Your face descriptor (128 numbers) is stored encrypted in our database during signup. During login and voting, your live face is compared to verify your identity — no images are uploaded in real time." },
  { q: /cnic|national id|identity/i, a: "Your CNIC is scanned using OCR (Tesseract.js) to auto-fill your registration form. The details are verified against our national CNIC database before you can register." },
  { q: /candidate/i, a: "Candidates are registered by the Election Commission Admin. They receive an email with login credentials. Candidates can view their vote count in real time and also register separately as voters to cast their own vote." },
  { q: /admin/i, a: "Admins are Election Commission officials. They manage parties, candidates, voters, announcements, and voting schedules. Admin login is by email + password (separate from voter system)." },
  { q: /party|parties/i, a: "Parties are created by the admin. Each candidate is assigned to a party (or marked as Independent). You can view all parties and their candidates in the system." },
  { q: /mna|mpa|assembly/i, a: "MNA = Member of National Assembly (federal level). MPA = Member of Provincial Assembly (provincial level). You vote separately for each. Only candidates from your tehsil are shown." },
  { q: /tehsil|area|constituency/i, a: "Your voting options are filtered by your tehsil (from your CNIC). You can only vote for candidates registered in your tehsil to ensure constituency-based voting." },
  { q: /help|how does|explain/i, a: "I'm your E-Voting AI Assistant! Ask me about: registration, login, voting, face recognition, blockchain security, candidates, parties, MNA/MPA elections, or anything else about this system." },
];

const defaultReplies = [
  "I'm not sure about that. Try asking about registration, voting, face recognition, blockchain, or candidates!",
  "Great question! Could you rephrase? I handle questions about the E-Voting system.",
  "I specialize in E-Voting queries. Ask me about how to register, vote, or how blockchain secures your vote!",
];

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: "👋 Hello! I'm your E-Voting AI Assistant. Ask me anything about registration, voting, face recognition, or blockchain security!", time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const getReply = (text) => {
    for (const item of FAQ) {
      if (item.q.test(text)) return item.a;
    }
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getReply(userMsg.text);
      setMessages(prev => [...prev, { from: 'ai', text: reply, time: new Date() }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const suggestions = ['How do I register?', 'How does voting work?', 'How is blockchain used?', 'What is face recognition?'];

  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.widget}>
      {open && (
        <div className={styles.box}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>🤖</div>
              <div>
                <div className={styles.name}>ECP AI Assistant</div>
                <div className={styles.status}><span className={styles.onlineDot} /> Always online</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.from === 'user' ? styles.userMsg : styles.aiMsg}`}>
                {m.from === 'ai' && <div className={styles.aiAvatar}>🤖</div>}
                <div className={styles.bubble}>
                  <p>{m.text}</p>
                  <span className={styles.time}>{fmt(m.time)}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.aiMsg}`}>
                <div className={styles.aiAvatar}>🤖</div>
                <div className={styles.bubble}>
                  <div className={styles.typingDots}><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button key={i} className={styles.suggestion} onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className={styles.inputRow} onSubmit={handleSend}>
            <input className={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask me anything..." maxLength={300} />
            <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}

      <button className={styles.fab} onClick={() => setOpen(!open)}>
        {open ? '✕' : '🤖'}
        {!open && <span className={styles.pulse} />}
      </button>
    </div>
  );
};

export default AIAssistant;
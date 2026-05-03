import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle';
// import AnnouncementBanner from '../../components/AnnouncementBanner/AnnouncementBanner';
import AIAssistant from '../../components/AIAssistant/AIAssistant';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState({ voters: 0, blocks: 0, provinces: 0, uptime: 0 });
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      navigate(role === 'admin' ? '/admin/dashboard' : role === 'candidate' ? '/candidate/dashboard' : '/voter/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        animateCount('voters', 0, 12847, 2000);
        animateCount('blocks', 0, 89423, 2200);
        animateCount('provinces', 0, 6, 1000);
        animateCount('uptime', 0, 99, 1500);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCount = (key, from, to, duration) => {
    const start = Date.now();
    const update = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(prev => ({ ...prev, [key]: Math.floor(from + (to - from) * eased) }));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: t('nav.home'), id: 'hero' },
    { label: t('nav.about'), id: 'about' },
    { label: t('nav.howItWorks'), id: 'how-it-works' },
    { label: t('nav.contact'), id: 'contact' },
  ];

  const steps = [
    { icon: '🪪', title: 'Scan Your CNIC', desc: 'Upload front & back of your CNIC. Our OCR auto-fills your details and verifies against the national database.' },
    { icon: '🤳', title: 'Face Registration', desc: 'Your face is captured using AI (face-api.js). A secure 128-point descriptor is stored — never the actual image.' },
    { icon: '🔐', title: 'Secure Login', desc: 'Login with CNIC + password + live face verification. Multi-factor ensures only you can access your account.' },
    { icon: '🗳️', title: 'Cast Your Vote', desc: 'Vote for MNA & MPA candidates from your tehsil. Continuous face monitoring ensures you are present.' },
    { icon: '⛓️', title: 'Blockchain Security', desc: 'Each vote is SHA-256 hashed and chained immutably. Tampering is mathematically impossible.' },
    { icon: '📊', title: 'Transparent Results', desc: 'Real-time stats, province-wise results, and verifiable blockchain history available to all.' },
  ];

  const features = [
    { icon: '⛓️', title: 'Blockchain Secured', desc: 'Every vote is permanently recorded on an immutable SHA-256 blockchain. Zero tampering possible.' },
    { icon: '🤖', title: 'AI Face Recognition', desc: 'face-api.js runs locally in your browser. Continuous identity verification during voting.' },
    { icon: '🪪', title: 'CNIC Verification', desc: 'OCR-powered CNIC scanning verified against the national database ensures authentic voters only.' },
    { icon: '🔔', title: 'Real-time Notifications', desc: 'Instant alerts for voting schedules, announcements, and results via Socket.io.' },
    { icon: '💬', title: 'Anonymous Live Chat', desc: 'Discuss elections anonymously with other voters in real-time. Privacy guaranteed.' },
    { icon: '🌐', title: 'Bilingual Support', desc: 'Full English and Urdu support. Switch languages instantly across the entire platform.' },
  ];

  return (
    <div className={styles.page}>
      {/* <AnnouncementBanner page="landing" /> */}

      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>🗳️</span>
          <div>
            <div className={styles.brandName}>ECP</div>
            <div className={styles.brandSub}>E-Voting</div>
          </div>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map(l => (
            <button key={l.id} className={styles.navLink} onClick={() => scrollTo(l.id)}>{l.label}</button>
          ))}
        </div>

        <div className={styles.navRight}>
          <ThemeToggle />
          <LanguageToggle />
          <Link to="/register" className={`btn btn-primary ${styles.registerBtn}`}>
            {t('nav.register')} →
          </Link>
          <button className={styles.mobileMenu} onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroBadge}>🇵🇰 Pakistan's Digital Future</span>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine1}>{t('landing.hero')}</span>
              <span className={styles.heroLine2}>{t('landing.hero2')}</span>
              <span className={styles.heroLine3}>{t('landing.hero3')}</span>
            </h1>
            <p className={styles.heroSubtitle}>{t('landing.subtitle')}</p>
            <div className={styles.heroBtns}>
              <Link to="/register" className="btn btn-primary">{t('landing.getStarted')} 🚀</Link>
              <button className="btn btn-outline" onClick={() => scrollTo('how-it-works')}>{t('landing.learnMore')} ↓</button>
            </div>
            <div className={styles.heroTags}>
              <span className={styles.tag}>⛓️ Blockchain</span>
              <span className={styles.tag}>🤖 AI Face ID</span>
              <span className={styles.tag}>🔐 End-to-End Encrypted</span>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.eclipse}>
              <div className={styles.laptopMock}>
                <div className={styles.laptopScreen}>
                  <div className={styles.mockLogin}>
                    <div className={styles.mockLogo}>🗳️ ECP</div>
                    <div className={styles.mockField} />
                    <div className={styles.mockField} />
                    <div className={styles.mockBtn}>Login Securely</div>
                    <div className={styles.mockFace}>📷 Face Verify</div>
                  </div>
                </div>
                <div className={styles.laptopBase} />
              </div>
            </div>
            <div className={styles.floatingCard} style={{ top: '10%', right: '-20px' }}>
              <span>⛓️</span> Vote Secured on Blockchain
            </div>
            <div className={styles.floatingCard} style={{ bottom: '15%', left: '-10px' }}>
              <span>✅</span> Face Verified
            </div>
          </div>
        </div>

        <div className={styles.heroWave}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="var(--bg2)" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className={styles.stats}>
        {[
          { value: count.voters.toLocaleString(), label: t('landing.stats.voters'), icon: '👥' },
          { value: count.blocks.toLocaleString(), label: t('landing.stats.secure'), icon: '⛓️' },
          { value: count.provinces, label: t('landing.stats.provinces'), icon: '🗺️' },
          { value: count.uptime + '%', label: t('landing.stats.uptime'), icon: '🟢' },
        ].map((s, i) => (
          <div key={i} className={`${styles.statCard} animate-fade-up stagger-${i + 1}`}>
            <span className={styles.statIcon}>{s.icon}</span>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ABOUT */}
      <section id="about" className={styles.about}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>About the System</h2>
          <p className={styles.sectionSubtitle}>
            The Election Commission of Pakistan presents a groundbreaking Blockchain-based E-Voting System combining
            cutting-edge AI facial recognition, cryptographic vote integrity, and real-time transparency to bring
            Pakistan's electoral process into the digital age.
          </p>
          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className={`${styles.featureCard} animate-fade-up stagger-${(i % 3) + 1}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>Six simple steps from registration to a secure, verified vote.</p>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to cast your vote?</h2>
        <p>Register as a voter in minutes. Your identity is protected. Your vote is immutable.</p>
        <div className={styles.ctaBtns}>
          <Link to="/register" className="btn btn-primary">Register Now 🗳️</Link>
          <Link to="/login" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Login →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerBrand}>🗳️ ECP E-Voting</div>
            <p className={styles.footerDesc}>Secure. Verified. Digital Voting System. Bringing Pakistan's elections into the blockchain era.</p>
          </div>
          <div>
            <div className={styles.footerHead}>Quick Links</div>
            {navLinks.map(l => <button key={l.id} className={styles.footerLink} onClick={() => scrollTo(l.id)}>{l.label}</button>)}
          </div>
          <div>
            <div className={styles.footerHead}>Portals</div>
            <Link to="/login" className={styles.footerLink}>Voter Login</Link>
            <Link to="/login" className={styles.footerLink}>Admin Login</Link>
            <Link to="/login" className={styles.footerLink}>Candidate Login</Link>
          </div>
          <div>
            <div className={styles.footerHead}>Contact</div>
            <p className={styles.footerDesc}>Election Commission of Pakistan<br />Constitution Avenue, Islamabad<br />support@ecp.gov.pk</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2024 Election Commission of Pakistan. Blockchain E-Voting System. All rights reserved.
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

export default LandingPage;
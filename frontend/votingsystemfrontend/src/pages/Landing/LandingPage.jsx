import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  ChevronDown,
  ContactRound,
  Fingerprint,
  Globe2,
  IdCard,
  LockKeyhole,
  Menu,
  MessageCircle,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Vote,
  X,
  Zap,
  MapPinned,
  Activity,
  BellRing,
  Smartphone,
  Monitor,
  CircleCheck,
  Radio,
} from 'lucide-react';

import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import AnnouncementBanner from '../../components/AnnouncementBanner/AnnouncementBanner';
import AIAssistant from '../../components/AIAssistant/AIAssistant';
import styles from './LandingPage.module.css';
import logo from '../../assets/logo.svg';

const LandingPage = () => {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [count, setCount] = useState({
    voters: 0,
    blocks: 0,
    provinces: 0,
    uptime: 0,
  });

  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      navigate(
        role === 'admin'
          ? '/admin/dashboard'
          : role === 'candidate'
            ? '/candidate/dashboard'
            : '/voter/dashboard'
      );
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          animateCount('voters', 0, 1, 2000);
          animateCount('blocks', 0, 89423, 2200);
          animateCount('provinces', 0, 6, 1000);
          animateCount('uptime', 0, 99, 1500);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCount = (key, from, to, duration) => {
    const start = Date.now();

    const update = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount((prev) => ({
        ...prev,
        [key]: Math.floor(from + (to - from) * eased),
      }));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });

    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Contact', id: 'contact' },
  ];

  const steps = [
    {
      icon: IdCard,
      title: 'Scan Your CNIC',
      desc: 'Upload front & back of your CNIC. Our OCR auto-fills your details and verifies against the national database.',
    },
    {
      icon: ScanFace,
      title: 'Face Registration',
      desc: 'Your face is captured using AI (face-api.js). A secure 128-point descriptor is stored — never the actual image.',
    },
    {
      icon: LockKeyhole,
      title: 'Secure Login',
      desc: 'Login with CNIC + password + live face verification. Multi-factor ensures only you can access your account.',
    },
    {
      icon: Vote,
      title: 'Cast Your Vote',
      desc: 'Vote for MNA & MPA candidates from your tehsil. Continuous face monitoring ensures you are present.',
    },
    {
      icon: Blocks,
      title: 'Blockchain Security',
      desc: 'Each vote is SHA-256 hashed and chained immutably to protect the integrity of the voting record.',
    },
    {
      icon: Activity,
      title: 'Transparent Results',
      desc: 'Real-time stats, province-wise results, and verifiable blockchain history are available through the platform.',
    },
  ];

  const features = [
    {
      icon: Blocks,
      title: 'Blockchain Secured',
      desc: 'Every vote is recorded through the blockchain layer to provide a traceable and tamper-resistant voting history.',
    },
    {
      icon: ScanFace,
      title: 'AI Face Recognition',
      desc: 'Face recognition helps verify voter identity and supports continuous identity checking during voting.',
    },
    {
      icon: IdCard,
      title: 'CNIC Verification',
      desc: 'OCR-powered CNIC scanning helps collect and verify voter information during registration.',
    },
    {
      icon: BellRing,
      title: 'Real-time Notifications',
      desc: 'Receive voting schedule updates, announcements, and other important election information.',
    },
    {
      icon: MessageCircle,
      title: 'Anonymous Live Chat',
      desc: 'A real-time communication space allows voters to participate in election-related discussions.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Authentication',
      desc: 'Multiple identity and authentication checks help protect voter accounts and election access.',
    },
  ];

  const stats = [
    {
      value: count.voters.toLocaleString(),
      label: 'Registered Voters',
      icon: Users,
    },
    {
      value: count.blocks.toLocaleString(),
      label: 'Secure Blocks',
      icon: Blocks,
    },
    {
      value: count.provinces,
      label: 'Provinces Covered',
      icon: MapPinned,
    },
    {
      value: `${count.uptime}%`,
      label: 'System Uptime',
      icon: Activity,
    },
  ];

  return (
    <div className={styles.page}>
      {/* <AnnouncementBanner page="landing" /> */}

      {/* Navigation */}
      <nav
        className={`${styles.nav} ${
          scrolled ? styles.navScrolled : ''
        }`}
      >
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandLogoWrapper}>
              <img
                src={logo}
                alt="ECP"
                className={styles.brandLogo}
              />
            </div>

            <div className={styles.brandText}>
              <div className={styles.brandName}>ECP</div>
              <div className={styles.brandSub}>
                Blockchain E-Voting
              </div>
            </div>
          </Link>

          <div
            className={`${styles.navLinks} ${
              menuOpen ? styles.navOpen : ''
            }`}
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={styles.navLink}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/login"
              className={styles.mobileLogin}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </div>

          <div className={styles.navRight}>
            <ThemeToggle />

            <Link to="/login" className={styles.loginLink}>
              Login
            </Link>

            <Link
              to="/register"
              className={styles.registerBtn}
            >
              Register
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              className={styles.mobileMenu}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>
      {/* Landing Page Announcements */}
      <div className={styles.announcementArea}>
        <AnnouncementBanner page="landing" />
      </div>

      {/* Hero */}
      <section id="hero" className={styles.hero}>
        <div className={styles.heroOrbOne} />
        <div className={styles.heroOrbTwo} />

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <Sparkles size={15} />
              <span>Pakistan's Digital Voting Platform</span>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine1}>
                Secure elections.
              </span>

              <span className={styles.heroLine2}>
                Built for the
                <br />
                digital future.
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              A modern blockchain-based electronic voting
              platform combining secure identity verification,
              facial recognition and transparent election
              records.
            </p>

            <div className={styles.heroBtns}>
              <Link
                to="/register"
                className={styles.primaryBtn}
              >
                Get Started
                <ArrowRight size={18} />
              </Link>

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => scrollTo('how-it-works')}
              >
                See How It Works
                <ChevronDown size={18} />
              </button>
            </div>

            

            <div className={styles.trustRow}>
              <div className={styles.trustIcons}>
                <span>
                  <ShieldCheck size={16} />
                </span>
                <span>
                  <Fingerprint size={16} />
                </span>
                <span>
                  <Vote size={16} />
                </span>
              </div>

              <p>
                Designed around identity, integrity and
                transparency.
              </p>
            </div>
          </div>

          <div className={styles.heroRight}>
  <div className={styles.visualGlow} />

  <div className={styles.deviceStage}>
    {/* Top floating status cards */}
    

    {/* Laptop */}
    <div className={styles.laptopDevice}>
      <div className={styles.laptopScreen}>
        <div className={styles.previewHeader}>
          <div className={styles.previewBrand}>
            <div className={styles.previewLogo}>
              <Vote size={18} />
            </div>

            <div>
              <strong>E-Vote</strong>
              <span>Voter Portal</span>
            </div>
          </div>

          <div className={styles.previewStatus}>
            <span />
            Election Live
          </div>
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewSide}>
            <span className={styles.previewSideActive}>
              <Vote size={17} />
            </span>

            <span>
              <UserCheck size={17} />
            </span>

            <span>
              <Activity size={17} />
            </span>
          </div>

          <div className={styles.previewMain}>
            <div className={styles.previewWelcome}>
              <span>GENERAL ELECTION</span>

              <h3>Cast your ballot</h3>

              <p>
                Select your preferred candidates below.
              </p>
            </div>

            <div className={styles.ballotCard}>
              <div className={styles.ballotTop}>
                <div>
                  <span>NATIONAL ASSEMBLY</span>
                  <strong>Select MNA Candidate</strong>
                </div>

                <span className={styles.ballotBadge}>
                  NA-128
                </span>
              </div>

              <div className={styles.candidateRow}>
                <div className={styles.candidateAvatar}>
                  AK
                </div>

                <div className={styles.candidateInfo}>
                  <strong>Candidate A</strong>
                  <span>National Assembly</span>
                </div>

                <div className={styles.radioCircle}>
                  <div />
                </div>
              </div>

              <div className={styles.candidateRow}>
                <div className={styles.candidateAvatar}>
                  MS
                </div>

                <div className={styles.candidateInfo}>
                  <strong>Candidate B</strong>
                  <span>National Assembly</span>
                </div>

                <div className={styles.radioCircle} />
              </div>
            </div>

            <div className={styles.previewGrid}>
              <div>
                <IdCard size={17} />

                <span>Constituency</span>

                <strong>NA-128</strong>
              </div>

              <div>
                <Activity size={17} />

                <span>Ballot Status</span>

                <strong>Open</strong>
              </div>
            </div>

            <div className={styles.previewAction}>
              Review Selection
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.laptopBase}>
        <div className={styles.laptopNotch} />
      </div>
    </div>

    {/* Phone */}
    <div className={styles.phoneDevice}>
      <div className={styles.phoneSpeaker} />

      <div className={styles.phoneScreen}>
        <div className={styles.phoneHeader}>
          <div className={styles.phoneLogo}>
            <Vote size={14} />
          </div>

          <div>
            <strong>E-Vote</strong>
            <span>Mobile Ballot</span>
          </div>

          <Radio
            size={13}
            className={styles.phoneLiveIcon}
          />
        </div>

        <div className={styles.phoneContent}>
          <div className={styles.phoneElectionLabel}>
            <span>GENERAL ELECTION</span>
            <small>NA-128</small>
          </div>

          <h4>Choose candidate</h4>

          <p className={styles.phoneHint}>
            National Assembly
          </p>

          <div className={styles.phoneCandidateSelected}>
            <div className={styles.phoneCandidateAvatar}>
              AK
            </div>

            <div>
              <strong>Candidate A</strong>
              <span>Selected</span>
            </div>

            <CircleCheck size={16} />
          </div>

          <div className={styles.phoneCandidate}>
            <div className={styles.phoneCandidateAvatar}>
              MS
            </div>

            <div>
              <strong>Candidate B</strong>
              <span>Tap to select</span>
            </div>

            <div className={styles.phoneRadio} />
          </div>

          <button
            type="button"
            className={styles.phoneButton}
          >
            Continue
            <ArrowRight size={12} />
          </button>

          <div className={styles.phoneFooter}>
            <LockKeyhole size={10} />
            Protected voting session
          </div>
        </div>
      </div>

      <div className={styles.phoneHomeIndicator} />
    </div>
  </div>
</div>
        </div>
      </section>

      {/* Statistics */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.stats}>
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={styles.statCard}
              >
                <div className={styles.statIcon}>
                  <Icon size={22} />
                </div>

                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {stat.value}
                  </div>

                  <div className={styles.statLabel}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className={styles.about}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionBadge}>
              <ShieldCheck size={14} />
              PLATFORM FEATURES
            </div>

            <h2 className={styles.sectionTitle}>
              Technology designed for
              <span> secure digital elections.</span>
            </h2>

            <p className={styles.sectionSubtitle}>
              The platform combines blockchain records,
              identity verification and real-time communication
              into one integrated electronic voting system.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={styles.featureCard}
                >
                  <div className={styles.featureTop}>
                    <div className={styles.featureIcon}>
                      <Icon size={24} />
                    </div>

                    <span className={styles.featureNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className={styles.featureTitle}>
                    {feature.title}
                  </h3>

                  <p className={styles.featureDesc}>
                    {feature.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className={styles.howItWorks}
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionBadge}>
              <Zap size={14} />
              SIMPLE PROCESS
            </div>

            <h2 className={styles.sectionTitle}>
              From registration to your
              <span> secure vote.</span>
            </h2>

            <p className={styles.sectionSubtitle}>
              Six straightforward steps guide voters through
              identity registration, verification and voting.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className={styles.stepCard}
                >
                  <div className={styles.stepHeader}>
                    <div className={styles.stepIcon}>
                      <Icon size={23} />
                    </div>

                    <span className={styles.stepNum}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className={styles.stepTitle}>
                    {step.title}
                  </h3>

                  <p className={styles.stepDesc}>
                    {step.desc}
                  </p>

                  <div className={styles.stepBottom}>
                    Step {index + 1}
                    <ArrowRight size={14} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaGlowOne} />
        <div className={styles.ctaGlowTwo} />

        <div className={styles.ctaContent}>
          <div className={styles.ctaIcon}>
            <Vote size={30} />
          </div>

          <span className={styles.ctaLabel}>
            YOUR VOTE. YOUR VOICE.
          </span>

          <h2>Ready to cast your vote?</h2>

          <p>
            Create your voter account, verify your identity and
            participate through the secure digital voting
            platform.
          </p>

          <div className={styles.ctaBtns}>
            <Link
              to="/register"
              className={styles.ctaPrimary}
            >
              Register as a Voter
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/login"
              className={styles.ctaSecondary}
            >
              Login to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={styles.footer}>
        <div className={styles.footerGlow} />

        <div className={styles.footerGrid}>
          <div className={styles.footerIntro}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <Vote size={21} />
              </div>

              <div>
                <strong>ECP E-Voting</strong>
                <span>Blockchain Voting Platform</span>
              </div>
            </div>

            <p className={styles.footerDesc}>
              A secure digital voting platform combining
              identity verification, blockchain records and
              transparent election management.
            </p>

            <div className={styles.footerSecurity}>
              <ShieldCheck size={16} />
              Secure digital election infrastructure
            </div>
          </div>

          <div>
            <div className={styles.footerHead}>
              Navigation
            </div>

            {navLinks.map((link) => (
              <button
                key={link.id}
                className={styles.footerLink}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div>
            <div className={styles.footerHead}>Portals</div>

            <Link
              to="/login"
              className={styles.footerLink}
            >
              Voter Login
            </Link>

            <Link
              to="/login"
              className={styles.footerLink}
            >
              Admin Login
            </Link>

            <Link
              to="/login"
              className={styles.footerLink}
            >
              Candidate Login
            </Link>
          </div>

          <div>
            <div className={styles.footerHead}>Contact</div>

            <div className={styles.contactItem}>
              <MapPinned size={16} />
              <p>
                Election Commission of Pakistan
                <br />
                Constitution Avenue, Islamabad
              </p>
            </div>

            <div className={styles.contactItem}>
              <ContactRound size={16} />
              <p>support@ecp.gov.pk</p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 Election Commission of Pakistan.
          </span>

          <div>
            <span>
              <LockKeyhole size={13} />
              Secure
            </span>

            <span>
              <Globe2 size={13} />
              Digital
            </span>

            <span>
              <Blocks size={13} />
              Blockchain
            </span>
          </div>
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

export default LandingPage;
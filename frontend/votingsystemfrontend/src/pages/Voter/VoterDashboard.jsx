import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchVoterProfile, fetchVoterNotifications, fetchActiveSchedule } from '../../features/voter/voterSlice';
import { formatFullName, formatDate } from '../../utils/formatters';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import LiveChat from '../../components/LiveChat/LiveChat';
import NotificationPanel from '../../components/Notification/NotificationPanel';
import styles from './VoterDashboard.module.css';

const VoterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { profile, notifications, unreadCount, activeSchedule, isVotingActive, loading } = useSelector((s) => s.voter);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [faceStatus, setFaceStatus] = useState('checking'); // 'match' | 'no-match' | 'checking' | 'no-face'
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchVoterProfile());
    dispatch(fetchVoterNotifications());
    dispatch(fetchActiveSchedule());

    const scheduleInterval = setInterval(() => dispatch(fetchActiveSchedule()), 60000);
    const notifInterval = setInterval(() => dispatch(fetchVoterNotifications()), 30000);
    return () => { clearInterval(scheduleInterval); clearInterval(notifInterval); };
  }, [dispatch]);

  // Handle face detection result
  const handleFaceMatch = useCallback((matched) => {
    if (matched) {
      setFaceStatus('match');
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
      }
    } else {
      setFaceStatus('no-match');
      // Start 15-second countdown if not already started
      if (!countdownRef.current) {
        setCountdown(15);
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
              dispatch(logout());
              navigate('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [dispatch, navigate]);

  const handleNoFace = useCallback(() => {
    setFaceStatus('no-face');
    handleFaceMatch(false);
  }, [handleFaceMatch]);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const fullName = profile
    ? formatFullName(profile.firstName, profile.middleName, profile.lastName)
    : user?.firstName || 'Voter';

  const faceStatusConfig = {
    match: { icon: '✅', text: 'Identity Verified', cls: styles.faceMatch },
    'no-match': { icon: '⚠️', text: 'Face Mismatch', cls: styles.faceMismatch },
    checking: { icon: '🔍', text: 'Verifying...', cls: styles.faceChecking },
    'no-face': { icon: '👤', text: 'No Face Detected', cls: styles.faceMismatch },
  };
  const fc = faceStatusConfig[faceStatus] || faceStatusConfig.checking;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>⚡ E-Vote</span>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/voter/dashboard" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            🏠 <span>Dashboard</span>
          </Link>
          <Link to="/voter/profile" className={styles.navItem} onClick={() => setSidebarOpen(false)}>
            👤 <span>My Profile</span>
          </Link>
          <Link
            to={isVotingActive ? '/voter/vote' : '#'}
            className={`${styles.navItem} ${!isVotingActive ? styles.disabledNav : ''}`}
            onClick={(e) => { if (!isVotingActive) { e.preventDefault(); } else setSidebarOpen(false); }}
            title={!isVotingActive ? 'Voting is not currently active' : 'Go to Voting'}
          >
            🗳️ <span>Voting {!isVotingActive && <span className={styles.lockedTag}>Locked</span>}</span>
          </Link>
          <button className={styles.navLogout} onClick={handleLogout}>🚪 <span>Logout</span></button>
        </nav>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)}>☰</button>
        <span className={styles.headerLogo}>⚡ E-Vote</span>
        <div className={styles.headerRight}>
          <button className={styles.notifBtn} onClick={() => setShowNotifs(!showNotifs)}>
            🔔
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          <Link to="/voter/profile" className={styles.profileLink}>
            {profile?.profileImage ? (
              <img src={`http://localhost:5000${profile.profileImage}`} alt="Profile" className={styles.profileImg} />
            ) : (
              <div className={styles.profileAvatar}>{profile?.firstName?.[0]?.toUpperCase() || '?'}</div>
            )}
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifs && (
        <NotificationPanel notifications={notifications} onClose={() => setShowNotifs(false)} />
      )}

      {/* Warning Countdown */}
      {countdown !== null && (
        <div className={styles.countdownBanner}>
          ⚠️ Face not recognized! You will be logged out in <strong>{countdown}s</strong>. Please face the camera.
        </div>
      )}

      {/* Main Content */}
      <main className={styles.main}>
        {/* Welcome Banner */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeText}>
            <h1>Welcome, <span className={styles.nameHighlight}>{fullName}</span> 👋</h1>
            <p>Election Commission of Pakistan — Voter Portal</p>
            <div className={styles.welcomeMeta}>
              <span>📍 {profile?.tehsil || '—'}, {profile?.province || '—'}</span>
              <span>🪪 {profile?.cnicNumber ? profile.cnicNumber.slice(0, 7) + '—' : '—'}</span>
            </div>
          </div>
          <div className={`${styles.faceStatusBadge} ${fc.cls}`}>
            <span>{fc.icon}</span>
            <span>{fc.text}</span>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            {/* Face Camera */}
            <div className={styles.cameraCard}>
              <h3>🎥 Live Identity Verification</h3>
              <p>Your face is continuously verified while you're logged in.</p>
              <FaceCamera
                storedDescriptor={profile?.faceDescriptor}
                onMatch={handleFaceMatch}
                onNoFace={handleNoFace}
                compact={false}
              />
            </div>

            {/* Voting Status */}
            <div className={styles.votingStatusCard}>
              <h3>🗳️ Voting Status</h3>
              {isVotingActive && activeSchedule ? (
                <div className={styles.votingActive}>
                  <div className={styles.activeIndicator}>
                    <span className={styles.pulseDot} />
                    <span>Voting is LIVE</span>
                  </div>
                  <p>{activeSchedule.title}</p>
                  <div className={styles.voteChecks}>
                    <div className={`${styles.voteCheck} ${profile?.hasVotedMNA ? styles.voted : styles.notVoted}`}>
                      {profile?.hasVotedMNA ? '✅' : '⭕'} MNA Vote {profile?.hasVotedMNA ? 'Cast' : 'Pending'}
                    </div>
                    <div className={`${styles.voteCheck} ${profile?.hasVotedMPA ? styles.voted : styles.notVoted}`}>
                      {profile?.hasVotedMPA ? '✅' : '⭕'} MPA Vote {profile?.hasVotedMPA ? 'Cast' : 'Pending'}
                    </div>
                  </div>
                  {(!profile?.hasVotedMNA || !profile?.hasVotedMPA) && (
                    <Link to="/voter/vote" className={styles.voteNowBtn}>
                      🗳️ Vote Now
                    </Link>
                  )}
                </div>
              ) : (
                <div className={styles.votingInactive}>
                  <span>🔒</span>
                  <p>Voting is not currently active. Check back when a schedule is announced.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Voter Info Card */}
            <div className={styles.infoCard}>
              <h3>👤 Voter Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span>Full Name</span>
                  <strong>{fullName}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Gender</span>
                  <strong>{profile?.gender || '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Date of Birth</span>
                  <strong>{profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>District</span>
                  <strong>{profile?.district || '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>City</span>
                  <strong>{profile?.city || '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Tehsil</span>
                  <strong>{profile?.tehsil || '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Province</span>
                  <strong>{profile?.province || '—'}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Registered</span>
                  <strong>{profile?.createdAt ? formatDate(profile.createdAt) : '—'}</strong>
                </div>
              </div>
              <Link to="/voter/profile" className={styles.editProfileBtn}>✏️ Edit Profile</Link>
            </div>

            {/* Recent Notifications Preview */}
            {notifications.length > 0 && (
              <div className={styles.notifPreview}>
                <div className={styles.notifPreviewHeader}>
                  <h3>🔔 Recent Notifications</h3>
                  <button className={styles.viewAllBtn} onClick={() => setShowNotifs(true)}>View All</button>
                </div>
                {notifications.slice(0, 3).map((n) => (
                  <div key={n._id} className={`${styles.notifItem} ${!n.read ? styles.unreadNotif : ''}`}>
                    <span>{n.message}</span>
                    {!n.read && <span className={styles.unreadDot} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <LiveChat />
    </div>
  );
};

export default VoterDashboard;
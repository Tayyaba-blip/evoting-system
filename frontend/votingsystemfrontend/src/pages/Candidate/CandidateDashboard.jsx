import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchCandidateProfile, fetchCandidateVoteCount, fetchCandidateNotifications } from '../../features/candidate/candidateSlice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatVoteCount } from '../../utils/formatters';
import LiveChat from '../../components/LiveChat/LiveChat';
import NotificationPanel from '../../components/Notification/NotificationPanel';
import styles from './CandidateDashboard.module.css';
import { useState } from 'react';

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { profile, notifications, unreadCount, loading } = useSelector((s) => s.candidate);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    dispatch(fetchCandidateProfile());
    dispatch(fetchCandidateVoteCount());
    dispatch(fetchCandidateNotifications());
    const iv = setInterval(() => dispatch(fetchCandidateVoteCount()), 30000);
    return () => clearInterval(iv);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const voteData = profile ? [
    { name: profile.name?.split(' ')[0], votes: profile.totalVotes || 0 }
  ] : [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⚡ E-Vote</span>
          <span className={styles.role}>Candidate Portal</span>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.notifBtn} onClick={() => setShowNotifs(!showNotifs)}>
            🔔
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          <Link to="/candidate/profile" className={styles.profileBtn}>
            {profile?.photo ? (
              <img src={`http://localhost:5000${profile.photo}`} alt="Profile" className={styles.profileImg} />
            ) : (
              <div className={styles.profileAvatar}>👤</div>
            )}
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifs && (
        <NotificationPanel notifications={notifications} onClose={() => setShowNotifs(false)} />
      )}

      <main className={styles.main}>
        {/* Welcome */}
        <div className={styles.welcome}>
          <h1>Welcome, <span className={styles.highlight}>{profile?.name || user?.name}</span> 🎖️</h1>
          <p>{profile?.party?.name || 'Independent'} · {profile?.electionType} · {profile?.constituency}</p>
        </div>

        <div className={styles.grid}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>
              {profile?.photo ? (
                <img src={`http://localhost:5000${profile.photo}`} alt={profile.name} />
              ) : <span>👤</span>}
            </div>
            <h2>{profile?.name}</h2>
            <p>{profile?.email}</p>
            <div className={styles.infoPills}>
              <span className={styles.pill}>{profile?.electionType}</span>
              <span className={styles.pill}>{profile?.constituency}</span>
              <span className={styles.pill}>{profile?.province}</span>
            </div>
            {profile?.party && (
              <div className={styles.partyBox}>
                <strong>Party:</strong> {profile.party.name} ({profile.party.abbreviation})
              </div>
            )}
            <Link to="/candidate/profile" className={styles.editBtn}>✏️ Edit Profile</Link>
          </div>

          {/* Vote Count */}
          <div className={styles.voteCard}>
            <h3>My Vote Count</h3>
            <div className={styles.voteNumber}>{formatVoteCount(profile?.totalVotes || 0)}</div>
            <p className={styles.voteLabel}>Total votes received</p>

            {voteData.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={voteData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                  <Bar dataKey="votes" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            <p className={styles.liveNote}>📡 Live — updates every 30 seconds</p>
          </div>

          {/* Info Box */}
          <div className={styles.infoCard}>
            <h3>Candidate Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span>City</span><strong>{profile?.city || '—'}</strong></div>
              <div className={styles.infoItem}><span>Tehsil</span><strong>{profile?.tehsil || '—'}</strong></div>
              <div className={styles.infoItem}><span>Province</span><strong>{profile?.province || '—'}</strong></div>
              <div className={styles.infoItem}><span>Election Type</span><strong>{profile?.electionType || '—'}</strong></div>
              <div className={styles.infoItem}><span>Constituency</span><strong>{profile?.constituency || '—'}</strong></div>
              <div className={styles.infoItem}><span>CNIC</span><strong>{profile?.cnic || '—'}</strong></div>
            </div>
          </div>

          {/* Symbol Card */}
          {profile?.symbol && (
            <div className={styles.symbolCard}>
              <h3>Election Symbol</h3>
              <img src={`http://localhost:5000${profile.symbol}`} alt="Symbol" className={styles.symbolImg} />
            </div>
          )}
        </div>
      </main>

      <LiveChat />
    </div>
  );
};

export default CandidateDashboard;
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchVoteStats, fetchParties, fetchVoters, fetchCandidates } from '../../features/admin/adminSlice';
import { formatVoteCount, timeAgo } from '../../utils/formatters';
import LiveChat from '../../components/LiveChat/LiveChat';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { voteStats, parties, voters, candidates, loading } = useSelector((s) => s.admin);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  const [announcOpen, setAnnouncOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchVoteStats());
    dispatch(fetchParties());
    dispatch(fetchVoters());
    dispatch(fetchCandidates());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const totalVotes = voteStats?.totalVotesCast || 0;
  const topParty = voteStats?.partyStats
  ? [...voteStats.partyStats].sort((a, b) => b.totalVotes - a.totalVotes)[0]
  : null;
  const navItems = [
    { label: 'Home', icon: '🏠', path: '/admin/dashboard' },
    {
      label: 'Party', icon: '🏛️', children: [
        { label: 'Party List', path: '/admin/dashboard/parties' },
        { label: 'Add Party', path: '/admin/dashboard/parties/add' },
      ]
    },
    { label: 'Candidates', icon: '👤', path: '/admin/dashboard/candidates' },
    { label: 'Voters', icon: '🗳️', path: '/admin/dashboard/voters' },
    {
      label: 'Announcements', icon: '📢', children: [
        { label: 'Announcement List', path: '/admin/dashboard/announcements' },
        { label: 'Add Announcement', path: '/admin/dashboard/announcements/add' },
      ]
    },
    { label: 'Voting Schedule', icon: '📅', path: '/admin/dashboard/schedule' },
    { label: 'Election History', icon: '📜', path: '/admin/dashboard/history' },
    { label: 'Stats & Graph', icon: '📊', path: '/admin/dashboard/stats' },
  ];

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>⚡ E-Vote</span>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <div>
                  <button
                    className={styles.navGroup}
                    onClick={() => {
                      if (item.label === 'Party') setPartyOpen(!partyOpen);
                      if (item.label === 'Announcements') setAnnouncOpen(!announcOpen);
                    }}
                  >
                    <span>{item.icon} {item.label}</span>
                    <span>{(item.label === 'Party' ? partyOpen : announcOpen) ? '▲' : '▼'}</span>
                  </button>
                  {((item.label === 'Party' && partyOpen) || (item.label === 'Announcements' && announcOpen)) && (
                    <div className={styles.subNav}>
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path} className={styles.subNavLink} onClick={() => setSidebarOpen(false)}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link to={item.path} className={styles.navLink} onClick={() => setSidebarOpen(false)}>
                  {item.icon} {item.label}
                </Link>
              )}
            </div>
          ))}
          <button className={styles.logoutLink} onClick={handleLogout}>🚪 Logout</button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.hamburger} onClick={() => setSidebarOpen(true)}>☰</button>
        <div className={styles.headerTitle}>
          <span className={styles.headerLogo}>⚡</span>
          <span>Admin Dashboard</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.adminName}>👤 {user?.name || 'Admin'}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome back, <span className={styles.highlight}>{user?.name || 'Admin'}</span> 👋</h1>
          <p>Election Commission of Pakistan — Control Panel</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🗳️</div>
            <div className={styles.statInfo}>
              <span className={styles.statNum}>{formatVoteCount(totalVotes)}</span>
              <span className={styles.statLabel}>Total Votes Cast</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statInfo}>
              <span className={styles.statNum}>{voters?.length || 0}</span>
              <span className={styles.statLabel}>Registered Voters</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏛️</div>
            <div className={styles.statInfo}>
              <span className={styles.statNum}>{parties?.length || 0}</span>
              <span className={styles.statLabel}>Political Parties</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👤</div>
            <div className={styles.statInfo}>
              <span className={styles.statNum}>{candidates?.length || 0}</span>
              <span className={styles.statLabel}>Candidates</span>
            </div>
          </div>
        </div>

        {/* Leading Party Banner */}
        {topParty && (
          <div className={styles.leadingBanner}>
            <div className={styles.leadingContent}>
              <span className={styles.leadingIcon}>🏆</span>
              <div>
                <h3>Currently Leading</h3>
                <p><strong>{topParty.name}</strong> ({topParty.abbreviation}) with {formatVoteCount(topParty.totalVotes)} votes</p>
              </div>
            </div>
            {voteStats?.isChainValid !== undefined && (
              <div className={`${styles.chainBadge} ${voteStats.isChainValid ? styles.valid : styles.invalid}`}>
                {voteStats.isChainValid ? '🔒 Blockchain Verified' : '⚠️ Chain Alert'}
              </div>
            )}
          </div>
        )}

        {/* Party Vote Breakdown */}
        {voteStats?.partyStats && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Party Vote Breakdown</h2>
            <div className={styles.partyCards}>
              {voteStats.partyStats.slice(0, 6).map((party) => (
                <div key={party._id} className={styles.partyCard}>
                  {party.flag && <img src={`http://localhost:5000${party.flag}`} alt={party.name} className={styles.partyFlag} />}
                  <h4>{party.abbreviation || party.name}</h4>
                  <div className={styles.voteRow}>
                    <span>MNA: <strong>{formatVoteCount(party.mnaVotes)}</strong></span>
                    <span>MPA: <strong>{formatVoteCount(party.mpaVotes)}</strong></span>
                  </div>
                  <span className={styles.totalBadge}>Total: {formatVoteCount(party.totalVotes)}</span>
                </div>
              ))}
            </div>
            <Link to="/admin/dashboard/stats" className={styles.viewMore}>View Full Stats →</Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.quickActions}>
            <Link to="/admin/dashboard/parties/add" className={styles.actionBtn}>➕ Add Party</Link>
            <Link to="/admin/dashboard/candidates/add" className={styles.actionBtn}>➕ Add Candidate</Link>
            <Link to="/admin/dashboard/announcements/add" className={styles.actionBtn}>📢 New Announcement</Link>
            <Link to="/admin/dashboard/schedule" className={styles.actionBtn}>📅 Manage Schedule</Link>
          </div>
        </div>
      </main>

      <LiveChat />
    </div>
  );
};

export default AdminDashboard;
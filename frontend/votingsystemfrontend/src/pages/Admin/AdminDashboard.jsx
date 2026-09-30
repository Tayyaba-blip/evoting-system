import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Users,
  UserRound,
  Vote,
  Megaphone,
  CalendarDays,
  History,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Sparkles,
} from 'lucide-react';

import { logout } from '../../features/auth/authSlice';
import {
  fetchVoteStats,
  fetchParties,
  fetchVoters,
  fetchCandidates,
} from '../../features/admin/adminSlice';
import { formatVoteCount } from '../../utils/formatters';
import LiveChat from '../../components/LiveChat/LiveChat';
import styles from './AdminDashboard.module.css';
import { getImageUrl } from '../../utils/imageUrl';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((s) => s.auth);
  const { voteStats, parties, voters, candidates } = useSelector(
    (s) => s.admin
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
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

  const topParty = voteStats?.partyStats?.length
    ? [...voteStats.partyStats].sort(
        (a, b) => b.totalVotes - a.totalVotes
      )[0]
    : null;

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      label: 'Party',
      icon: Landmark,
      children: [
        {
          label: 'Party List',
          path: '/admin/dashboard/parties',
        },
        {
          label: 'Add Party',
          path: '/admin/dashboard/parties/add',
        },
      ],
    },
    {
      label: 'Candidates',
      icon: UserRound,
      path: '/admin/dashboard/candidates',
    },
    {
      label: 'Voters',
      icon: Users,
      path: '/admin/dashboard/voters',
    },
    {
      label: 'Announcements',
      icon: Megaphone,
      children: [
        {
          label: 'Announcement List',
          path: '/admin/dashboard/announcements',
        },
        {
          label: 'Add Announcement',
          path: '/admin/dashboard/announcements/add',
        },
      ],
    },
    {
      label: 'Voting Schedule',
      icon: CalendarDays,
      path: '/admin/dashboard/schedule',
    },
    {
      label: 'Election History',
      icon: History,
      path: '/admin/dashboard/history',
    },
    {
      label: 'Stats & Graph',
      icon: BarChart3,
      path: '/admin/dashboard/stats',
    },
  ];

  const stats = [
    {
      label: 'Total Votes Cast',
      value: formatVoteCount(totalVotes),
      icon: Vote,
    },
    {
      label: 'Registered Voters',
      value: voters?.length || 0,
      icon: Users,
    },
    {
      label: 'Political Parties',
      value: parties?.length || 0,
      icon: Landmark,
    },
    {
      label: 'Candidates',
      value: candidates?.length || 0,
      icon: UserRound,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Decorative background */}
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.open : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
          <Link
            to="/admin/dashboard"
            className={styles.brand}
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.logoBox}>
              <Vote size={21} strokeWidth={2.4} />
            </div>

            <div className={styles.brandText}>
              <span className={styles.logo}>E-Vote</span>
              <span className={styles.logoSub}>Administration</span>
            </div>
          </Link>

          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className={styles.navLabel}>MAIN MENU</div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen =
                item.label === 'Party'
                  ? partyOpen
                  : announcOpen;

              const childActive = item.children.some(
                (child) => location.pathname === child.path
              );

              return (
                <div
                  key={item.label}
                  className={styles.navGroupWrapper}
                >
                  <button
                    className={`${styles.navGroup} ${
                      childActive ? styles.activeGroup : ''
                    }`}
                    onClick={() => {
                      if (item.label === 'Party') {
                        setPartyOpen(!partyOpen);
                      }

                      if (item.label === 'Announcements') {
                        setAnnouncOpen(!announcOpen);
                      }
                    }}
                  >
                    <span className={styles.navItemLeft}>
                      <Icon size={19} strokeWidth={2} />
                      {item.label}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`${styles.chevron} ${
                        isOpen ? styles.chevronOpen : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className={styles.subNav}>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`${styles.subNavLink} ${
                            isActive(child.path)
                              ? styles.activeSubNav
                              : ''
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className={styles.subNavDot} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

                        return (
              <Link
                key={item.label}
                to={item.path}
                className={`${styles.navLink} ${
                  isActive(item.path) ? styles.activeNav : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={19} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarProfile}>
            <div className={styles.avatar}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>

            <div className={styles.profileInfo}>
              <strong>{user?.name || 'Admin'}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className={styles.logoutLink}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main wrapper */}
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <div className={styles.headerTitle}>
              <span>Admin Dashboard</span>
              <span className={styles.headerDot}>•</span>
              <span className={styles.headerSubtitle}>
                Election Control Center
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.systemStatus}>
              <span className={styles.statusDot} />
              System Online
            </div>

            <div className={styles.headerProfile}>
              <div className={styles.smallAvatar}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>

              <div className={styles.headerProfileText}>
                <strong>{user?.name || 'Admin'}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Welcome */}
          <section className={styles.welcome}>
            <div>
              <div className={styles.eyebrow}>
                <Sparkles size={14} />
                ADMINISTRATION
              </div>

              <h1>
                Welcome back,{' '}
                <span className={styles.highlight}>
                  {user?.name || 'Admin'}
                </span>
              </h1>

              <p>
                Monitor election activity, manage participants and
                review voting statistics from one place.
              </p>
            </div>

            <div className={styles.welcomeBadge}>
              <ShieldCheck size={18} />
              <div>
                <span>Election Commission</span>
                <strong>Pakistan</strong>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className={styles.statsGrid}>
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className={styles.statCard} key={stat.label}>
                  <div className={styles.statTop}>
                    <div className={styles.statIcon}>
                      <Icon size={23} strokeWidth={2} />
                    </div>

                    <div className={styles.statTrend}>
                      <Activity size={13} />
                      Live
                    </div>
                  </div>

                  <div className={styles.statInfo}>
                    <span className={styles.statNum}>
                      {stat.value}
                    </span>
                    <span className={styles.statLabel}>
                      {stat.label}
                    </span>
                  </div>

                  <div className={styles.cardShine} />
                </div>
              );
            })}
          </section>

          {/* Leading party */}
          {topParty && (
            <section className={styles.leadingBanner}>
              <div className={styles.leadingGlow} />

              <div className={styles.leadingContent}>
                <div className={styles.leadingIcon}>
                  <Trophy size={27} />
                </div>

                <div>
                  <span className={styles.leadingLabel}>
                    CURRENTLY LEADING
                  </span>

                  <h2>
                    {topParty.name}
                    {topParty.abbreviation && (
                      <span> ({topParty.abbreviation})</span>
                    )}
                  </h2>

                  <p>
                    Leading with{' '}
                    <strong>
                      {formatVoteCount(topParty.totalVotes)}
                    </strong>{' '}
                    total votes
                  </p>
                </div>
              </div>

              {voteStats?.isChainValid !== undefined && (
                <div
                  className={`${styles.chainBadge} ${
                    voteStats.isChainValid
                      ? styles.valid
                      : styles.invalid
                  }`}
                >
                  {voteStats.isChainValid ? (
                    <ShieldCheck size={17} />
                  ) : (
                    <ShieldAlert size={17} />
                  )}

                  <span>
                    {voteStats.isChainValid
                      ? 'Blockchain Verified'
                      : 'Chain Alert'}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Party Vote Breakdown */}
          {voteStats?.partyStats && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>
                    LIVE RESULTS
                  </span>
                  <h2 className={styles.sectionTitle}>
                    Party Vote Breakdown
                  </h2>
                </div>

                <Link
                  to="/admin/dashboard/stats"
                  className={styles.viewMore}
                >
                  View full analytics
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className={styles.partyCards}>
                {voteStats.partyStats
                  .slice(0, 6)
                  .map((party) => (
                    <div
                      key={party._id}
                      className={styles.partyCard}
                    >
                      <div className={styles.partyTop}>
                        <div className={styles.partyFlagWrapper}>
                          {party.flag ? (
                            <img
                              src={getImageUrl(party.flag)}
                              alt={party.name}
                              className={styles.partyFlag}
                            />
                          ) : (
                            <Landmark size={22} />
                          )}
                        </div>

                        <span className={styles.totalBadge}>
                          {formatVoteCount(party.totalVotes)} votes
                        </span>
                      </div>

                      <div className={styles.partyDetails}>
                        <h4>
                          {party.abbreviation || party.name}
                        </h4>

                        {party.abbreviation && (
                          <p>{party.name}</p>
                        )}
                      </div>

                      <div className={styles.voteRow}>
                        <div>
                          <span>MNA Votes</span>
                          <strong>
                            {formatVoteCount(party.mnaVotes)}
                          </strong>
                        </div>

                        <div className={styles.voteDivider} />

                        <div>
                          <span>MPA Votes</span>
                          <strong>
                            {formatVoteCount(party.mpaVotes)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  MANAGEMENT
                </span>
                <h2 className={styles.sectionTitle}>
                  Quick Actions
                </h2>
              </div>
            </div>

            <div className={styles.quickActions}>
              <Link
                to="/admin/dashboard/parties/add"
                className={styles.actionBtn}
              >
                <div className={styles.actionIcon}>
                  <Landmark size={20} />
                </div>

                <div>
                  <strong>Add Party</strong>
                  <span>Register a political party</span>
                </div>

                <ChevronRight
                  className={styles.actionArrow}
                  size={18}
                />
              </Link>

              <Link
                to="/admin/dashboard/candidates/add"
                className={styles.actionBtn}
              >
                <div className={styles.actionIcon}>
                  <UserRound size={20} />
                </div>

                <div>
                  <strong>Add Candidate</strong>
                  <span>Register a new candidate</span>
                </div>

                <ChevronRight
                  className={styles.actionArrow}
                  size={18}
                />
              </Link>

              <Link
                to="/admin/dashboard/announcements/add"
                className={styles.actionBtn}
              >
                <div className={styles.actionIcon}>
                  <Megaphone size={20} />
                </div>

                <div>
                  <strong>New Announcement</strong>
                  <span>Publish election information</span>
                </div>

                <ChevronRight
                  className={styles.actionArrow}
                  size={18}
                />
              </Link>

              <Link
                to="/admin/dashboard/schedule"
                className={styles.actionBtn}
              >
                <div className={styles.actionIcon}>
                  <CalendarDays size={20} />
                </div>

                <div>
                  <strong>Voting Schedule</strong>
                  <span>Manage election dates</span>
                </div>

                <ChevronRight
                  className={styles.actionArrow}
                  size={18}
                />
              </Link>
            </div>
          </section>
        </main>
      </div>

      <LiveChat />
    </div>
  );
};

export default AdminDashboard;
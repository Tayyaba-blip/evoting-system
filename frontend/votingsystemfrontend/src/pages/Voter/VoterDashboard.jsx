import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  UserRound,
  LogOut,
  LayoutDashboard,
  Vote,
  ShieldCheck,
  ShieldAlert,
  ScanFace,
  MapPin,
  CreditCard,
  LockKeyhole,
  CheckCircle2,
  Circle,
  Pencil,
  ArrowRight,
  CalendarDays,
  MapPinned,
  UserCheck,
  Clock3,
  ChevronRight,
} from 'lucide-react';

import { logout } from '../../features/auth/authSlice';
import {
  fetchVoterProfile,
  fetchVoterNotifications,
  fetchActiveSchedule,
} from '../../features/voter/voterSlice';

import { formatFullName, formatDate } from '../../utils/formatters';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import LiveChat from '../../components/LiveChat/LiveChat';
import NotificationPanel from '../../components/Notification/NotificationPanel';
import { getImageUrl } from '../../utils/imageUrl';
import styles from './VoterDashboard.module.css';

const VoterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);

  const {
    profile,
    notifications,
    unreadCount,
    activeSchedule,
    isVotingActive,
  } = useSelector((s) => s.voter);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [faceStatus, setFaceStatus] = useState('checking');
  const [countdown, setCountdown] = useState(null);

  const countdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchVoterProfile());
    dispatch(fetchVoterNotifications());
    dispatch(fetchActiveSchedule());

    const scheduleInterval = setInterval(
      () => dispatch(fetchActiveSchedule()),
      60000
    );

    const notifInterval = setInterval(
      () => dispatch(fetchVoterNotifications()),
      30000
    );

    return () => {
      clearInterval(scheduleInterval);
      clearInterval(notifInterval);
    };
  }, [dispatch]);

  const handleFaceMatch = useCallback(
    (matched) => {
      if (matched) {
        setFaceStatus('match');

        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdown(null);
        }
      } else {
        setFaceStatus('no-match');

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
    },
    [dispatch, navigate]
  );

  const handleNoFace = useCallback(() => {
    setFaceStatus('no-face');
    handleFaceMatch(false);
  }, [handleFaceMatch]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const fullName = profile
    ? formatFullName(
        profile.firstName,
        profile.middleName,
        profile.lastName
      )
    : user?.firstName || 'Voter';

  const faceStatusConfig = {
    match: {
      icon: ShieldCheck,
      text: 'Identity Verified',
      description: 'Continuous verification active',
      cls: styles.faceMatch,
    },
    'no-match': {
      icon: ShieldAlert,
      text: 'Face Mismatch',
      description: 'Please face the camera clearly',
      cls: styles.faceMismatch,
    },
    checking: {
      icon: ScanFace,
      text: 'Verifying Identity',
      description: 'Secure facial verification in progress',
      cls: styles.faceChecking,
    },
    'no-face': {
      icon: ShieldAlert,
      text: 'No Face Detected',
      description: 'Return to the camera view',
      cls: styles.faceMismatch,
    },
  };

  const fc = faceStatusConfig[faceStatus] || faceStatusConfig.checking;
  const FaceStatusIcon = fc.icon;

  return (
    <div className={styles.container}>
      {/* SIDEBAR */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.open : ''
        }`}
      >
        <div className={styles.sidebarGlow} />

        <div className={styles.sidebarHeader}>
          <Link
            to="/voter/dashboard"
            className={styles.sidebarBrand}
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.brandMark}>
              <Vote size={20} />
            </div>

            <div>
              <strong>E-Vote</strong>
              <span>Voter Portal</span>
            </div>
          </Link>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className={styles.sidebarUser}>
          {profile?.profileImage ? (
            <img
              src={getImageUrl(profile.profileImage)}
              alt="Voter"
              className={styles.sidebarAvatar}
            />
          ) : (
            <div className={styles.sidebarAvatarFallback}>
              {profile?.firstName?.[0]?.toUpperCase() || 'V'}
            </div>
          )}

          <div>
            <strong>{fullName}</strong>
            <span>Registered Voter</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.navLabel}>NAVIGATION</span>

          <Link
            to="/voter/dashboard"
            className={`${styles.navItem} ${styles.activeNav}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/voter/profile"
            className={styles.navItem}
            onClick={() => setSidebarOpen(false)}
          >
            <UserRound />
            <span>My Profile</span>
          </Link>

          <Link
            to={isVotingActive ? '/voter/vote' : '#'}
            className={`${styles.navItem} ${
              !isVotingActive ? styles.disabledNav : ''
            }`}
            onClick={(e) => {
              if (!isVotingActive) {
                e.preventDefault();
              } else {
                setSidebarOpen(false);
              }
            }}
          >
            <Vote />
            <span>Voting</span>

            {!isVotingActive && (
              <span className={styles.lockedTag}>
                <LockKeyhole size={11} />
                Locked
              </span>
            )}
          </Link>

          <div className={styles.navSpacer} />

          <button
            type="button"
            className={styles.navLogout}
            onClick={handleLogout}
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <ShieldCheck size={16} />
          <div>
            <strong>Secure Session</strong>
            <span>Identity monitoring enabled</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <Link to="/voter/dashboard" className={styles.headerBrand}>
            <div className={styles.headerBrandIcon}>
              <Vote size={18} />
            </div>

            <span>E-Vote</span>
          </Link>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.secureIndicator}>
            <span className={styles.secureDot} />
            Secure session
          </div>

          <button
            type="button"
            className={styles.notifBtn}
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <Link to="/voter/profile" className={styles.profileLink}>
            {profile?.profileImage ? (
              <img
                src={getImageUrl(profile.profileImage)}
                alt="Profile"
                className={styles.profileImg}
              />
            ) : (
              <div className={styles.profileAvatar}>
                {profile?.firstName?.[0]?.toUpperCase() || 'V'}
              </div>
            )}

            <div className={styles.headerProfileText}>
              <strong>{profile?.firstName || 'Voter'}</strong>
              <span>Voter</span>
            </div>
          </Link>
        </div>
      </header>

      {showNotifs && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifs(false)}
        />
      )}

      {countdown !== null && (
        <div className={styles.countdownBanner}>
          <ShieldAlert size={18} />

          <span>
            Face not recognized. Please face the camera clearly.
          </span>

          <strong>{countdown}s</strong>
        </div>
      )}

      {/* MAIN */}
      <main
        className={`${styles.main} ${
          countdown !== null ? styles.mainWithWarning : ''
        }`}
      >
        {/* HERO */}
        <section className={styles.welcomeCard}>
          <div className={styles.heroGlowOne} />
          <div className={styles.heroGlowTwo} />

          <div className={styles.welcomeContent}>
            <span className={styles.eyebrow}>
              <UserCheck size={15} />
              VOTER PORTAL
            </span>

            <h1>
              Welcome back,
              <span className={styles.nameHighlight}> {fullName}</span>
            </h1>

            <p>
              Manage your voter profile, verify your identity and
              securely participate in active elections.
            </p>

            <div className={styles.welcomeMeta}>
              <span>
                <MapPin size={15} />
                {profile?.tehsil || 'Not set'},{' '}
                {profile?.province || 'Pakistan'}
              </span>

              <span>
                <CreditCard size={15} />
                {profile?.cnicNumber
                  ? `${profile.cnicNumber.slice(0, 7)}••••••`
                  : 'CNIC unavailable'}
              </span>
            </div>
          </div>

          <div className={`${styles.faceStatusBadge} ${fc.cls}`}>
            <div className={styles.faceStatusIcon}>
              <FaceStatusIcon size={22} />
            </div>

            <div>
              <strong>{fc.text}</strong>
              <span>{fc.description}</span>
            </div>
          </div>
        </section>

        {/* DASHBOARD GRID */}
        <section className={styles.layout}>
          <div className={styles.leftCol}>
            {/* CAMERA */}
            <article className={styles.glassCard}>
              <div className={styles.cardHeading}>
                <div className={styles.cardIcon}>
                  <ScanFace size={19} />
                </div>

                <div>
                  <h2>Live Identity Verification</h2>
                  <p>
                    Your identity is continuously verified during
                    this secure session.
                  </p>
                </div>
              </div>

              <div className={styles.cameraFrame}>
                <FaceCamera
                  storedDescriptor={profile?.faceDescriptor}
                  onMatch={handleFaceMatch}
                  onNoFace={handleNoFace}
                  compact={false}
                />
              </div>

              <div className={styles.securityFooter}>
                <ShieldCheck size={15} />
                Facial verification remains active while you are
                logged in.
              </div>
            </article>

            {/* VOTING STATUS */}
            <article className={styles.glassCard}>
              <div className={styles.cardHeading}>
                <div className={styles.cardIcon}>
                  <Vote size={19} />
                </div>

                <div>
                  <h2>Voting Status</h2>
                  <p>
                    View the status of the currently scheduled
                    election.
                  </p>
                </div>
              </div>

              {isVotingActive && activeSchedule ? (
                <div className={styles.votingActive}>
                  <div className={styles.liveElectionHeader}>
                    <div className={styles.activeIndicator}>
                      <span className={styles.pulseDot} />
                      <span>Voting is live</span>
                    </div>

                    <span className={styles.liveTag}>ACTIVE</span>
                  </div>

                  <div className={styles.electionTitle}>
                    <CalendarDays size={17} />
                    <strong>{activeSchedule.title}</strong>
                  </div>

                  <div className={styles.voteChecks}>
                    <div
                      className={`${styles.voteCheck} ${
                        profile?.hasVotedMNA
                          ? styles.voted
                          : styles.notVoted
                      }`}
                    >
                      {profile?.hasVotedMNA ? (
                        <CheckCircle2 />
                      ) : (
                        <Circle />
                      )}

                      <div>
                        <strong>MNA Vote</strong>
                        <span>
                          {profile?.hasVotedMNA
                            ? 'Successfully cast'
                            : 'Awaiting your vote'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`${styles.voteCheck} ${
                        profile?.hasVotedMPA
                          ? styles.voted
                          : styles.notVoted
                      }`}
                    >
                      {profile?.hasVotedMPA ? (
                        <CheckCircle2 />
                      ) : (
                        <Circle />
                      )}

                      <div>
                        <strong>MPA Vote</strong>
                        <span>
                          {profile?.hasVotedMPA
                            ? 'Successfully cast'
                            : 'Awaiting your vote'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(!profile?.hasVotedMNA ||
                    !profile?.hasVotedMPA) && (
                    <Link
                      to="/voter/vote"
                      className={styles.voteNowBtn}
                    >
                      Continue to Voting
                      <ArrowRight size={17} />
                    </Link>
                  )}
                </div>
              ) : (
                <div className={styles.votingInactive}>
                  <div className={styles.inactiveIcon}>
                    <LockKeyhole size={22} />
                  </div>

                  <div>
                    <strong>No active voting session</strong>
                    <p>
                      Voting will become available when an election
                      schedule is active.
                    </p>
                  </div>
                </div>
              )}
            </article>
          </div>

          <div className={styles.rightCol}>
            {/* INFORMATION */}
            <article className={styles.glassCard}>
              <div className={styles.cardTopRow}>
                <div className={styles.cardHeading}>
                  <div className={styles.cardIcon}>
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2>Voter Information</h2>
                    <p>Your registered voter details.</p>
                  </div>
                </div>

                <Link
                  to="/voter/profile"
                  className={styles.smallEditBtn}
                >
                  <Pencil size={14} />
                  Edit
                </Link>
              </div>

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
                  <strong>
                    {profile?.dateOfBirth
                      ? formatDate(profile.dateOfBirth)
                      : '—'}
                  </strong>
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
                  <strong>
                    {profile?.createdAt
                      ? formatDate(profile.createdAt)
                      : '—'}
                  </strong>
                </div>
              </div>

              <Link
                to="/voter/profile"
                className={styles.editProfileBtn}
              >
                Manage Profile
                <ChevronRight size={16} />
              </Link>
            </article>

            {/* LOCATION */}
            <article className={styles.miniCard}>
              <div className={styles.miniIcon}>
                <MapPinned size={20} />
              </div>

              <div>
                <span>Registered Constituency</span>
                <strong>
                  {profile?.tehsil || 'Tehsil not available'}
                </strong>
                <p>
                  {profile?.district || 'District not available'},{' '}
                  {profile?.province || 'Pakistan'}
                </p>
              </div>
            </article>

            {/* NOTIFICATIONS */}
            <article className={styles.glassCard}>
              <div className={styles.notifPreviewHeader}>
                <div className={styles.cardHeading}>
                  <div className={styles.cardIcon}>
                    <Bell size={19} />
                  </div>

                  <div>
                    <h2>Recent Notifications</h2>
                    <p>Latest updates from your voter portal.</p>
                  </div>
                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className={styles.viewAllBtn}
                    onClick={() => setShowNotifs(true)}
                  >
                    View all
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className={styles.notificationList}>
                  {notifications.slice(0, 3).map((n) => (
                    <div
                      key={n._id}
                      className={`${styles.notifItem} ${
                        !n.read ? styles.unreadNotif : ''
                      }`}
                    >
                      <div className={styles.notificationIcon}>
                        <Bell size={15} />
                      </div>

                      <span>{n.message}</span>

                      {!n.read && (
                        <span className={styles.unreadDot} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyNotifications}>
                  <Clock3 size={20} />
                  <span>No recent notifications</span>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>

      <LiveChat />
    </div>
  );
};

export default VoterDashboard;
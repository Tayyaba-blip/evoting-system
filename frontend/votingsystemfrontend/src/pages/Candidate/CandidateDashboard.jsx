import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronRight,
  Edit3,
  LogOut,
  MapPin,
  Radio,
  ShieldCheck,
  UserRound,
  Vote,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { logout } from '../../features/auth/authSlice';
import {
  fetchCandidateProfile,
  fetchCandidateVoteCount,
  fetchCandidateNotifications,
} from '../../features/candidate/candidateSlice';

import { formatVoteCount } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUrl';

import LiveChat from '../../components/LiveChat/LiveChat';
import NotificationPanel from '../../components/Notification/NotificationPanel';

import styles from './CandidateDashboard.module.css';

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const {
    profile,
    notifications,
    unreadCount,
  } = useSelector((s) => s.candidate);

  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    dispatch(fetchCandidateProfile());
    dispatch(fetchCandidateVoteCount());
    dispatch(fetchCandidateNotifications());

    const interval = setInterval(() => {
      dispatch(fetchCandidateVoteCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const voteData = profile
    ? [
        {
          name: profile.name?.split(' ')[0] || 'Candidate',
          votes: profile.totalVotes || 0,
        },
      ]
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <div className={styles.brandIcon}>
              <Vote size={19} strokeWidth={2.3} />
            </div>

            <div className={styles.brandText}>
              <strong>E-Vote</strong>
              <span>Candidate Portal</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.notifBtn}
              onClick={() => setShowNotifs((prev) => !prev)}
              aria-label="Notifications"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className={styles.badge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <Link
              to="/candidate/profile"
              className={styles.profileBtn}
              aria-label="Candidate profile"
            >
              {profile?.photo ? (
                <img
                  src={getImageUrl(profile.photo)}
                  alt="Profile"
                  className={styles.profileImg}
                />
              ) : (
                <UserRound size={17} />
              )}
            </Link>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {showNotifs && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifs(false)}
        />
      )}

      <main className={styles.main}>
        <section className={styles.welcome}>
          <div>
            <span className={styles.eyebrow}>CANDIDATE DASHBOARD</span>

            <h1>
              Welcome,{' '}
              <span>{profile?.name || user?.name || 'Candidate'}</span>
            </h1>

            <p>
              {profile?.party?.name || 'Independent'}
              {profile?.electionType && ` · ${profile.electionType}`}
              {profile?.constituency && ` · ${profile.constituency}`}
            </p>
          </div>

          <div className={styles.verified}>
            <ShieldCheck size={16} />
            Verified Candidate
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.profileCard}>
            <div className={styles.avatarLarge}>
              {profile?.photo ? (
                <img
                  src={getImageUrl(profile.photo)}
                  alt={profile?.name || 'Candidate'}
                />
              ) : (
                <UserRound size={38} strokeWidth={1.7} />
              )}
            </div>

            <div className={styles.profileIdentity}>
              <h2>{profile?.name || 'Candidate'}</h2>
              <p>{profile?.email || '—'}</p>
            </div>

            <div className={styles.infoPills}>
              {profile?.electionType && (
                <span>{profile.electionType}</span>
              )}

              {profile?.constituency && (
                <span>{profile.constituency}</span>
              )}

              {profile?.province && (
                <span>{profile.province}</span>
              )}
            </div>

            <div className={styles.partyBox}>
              <Building2 size={16} />

              <div>
                <small>Political affiliation</small>
                <strong>
                  {profile?.party
                    ? `${profile.party.name}${
                        profile.party.abbreviation
                          ? ` (${profile.party.abbreviation})`
                          : ''
                      }`
                    : 'Independent'}
                </strong>
              </div>
            </div>

            <Link
              to="/candidate/profile"
              className={styles.editBtn}
            >
              <Edit3 size={15} />
              Edit Profile
              <ChevronRight size={15} />
            </Link>
          </section>

          <section className={styles.voteCard}>
            <div className={styles.cardHeading}>
              <div>
                <span>LIVE RESULTS</span>
                <h3>My Vote Count</h3>
              </div>

              <div className={styles.voteIcon}>
                <Vote size={18} />
              </div>
            </div>

            <div className={styles.voteSummary}>
              <div className={styles.voteNumber}>
                {formatVoteCount(profile?.totalVotes || 0)}
              </div>

              <p>Total votes received</p>
            </div>

            {voteData.length > 0 && (
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={voteData}>
                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke="rgba(16, 70, 39, 0.08)"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#748379',
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#748379',
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: 'rgba(21,148,71,.04)',
                      }}
                      contentStyle={{
                        background: 'rgba(255,255,255,.94)',
                        border: '1px solid rgba(21,148,71,.12)',
                        borderRadius: 12,
                        boxShadow: '0 12px 30px rgba(8,70,35,.1)',
                      }}
                    />

                    <Bar
                      dataKey="votes"
                      fill="#159447"
                      radius={[7, 7, 2, 2]}
                      maxBarSize={55}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className={styles.liveNote}>
              <span className={styles.liveDot} />
              <Radio size={13} />
              Updates automatically every 30 seconds
            </div>
          </section>

          <section className={styles.infoCard}>
            <div className={styles.cardHeading}>
              <div>
                <span>PROFILE DETAILS</span>
                <h3>Candidate Information</h3>
              </div>

              <MapPin size={18} />
            </div>

            <div className={styles.infoGrid}>
              <InfoItem label="City" value={profile?.city} />
              <InfoItem label="Tehsil" value={profile?.tehsil} />
              <InfoItem label="Province" value={profile?.province} />
              <InfoItem
                label="Election Type"
                value={profile?.electionType}
              />
              <InfoItem
                label="Constituency"
                value={profile?.constituency}
              />
              <InfoItem label="CNIC" value={profile?.cnic} />
            </div>
          </section>

          {profile?.symbol && (
            <section className={styles.symbolCard}>
              <div className={styles.cardHeading}>
                <div>
                  <span>ELECTION</span>
                  <h3>Election Symbol</h3>
                </div>
              </div>

              <div className={styles.symbolBox}>
                <img
                  src={getImageUrl(profile.symbol)}
                  alt="Election symbol"
                />
              </div>
            </section>
          )}
        </div>
      </main>

      <LiveChat />
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <span>{label}</span>
    <strong>{value || '—'}</strong>
  </div>
);

export default CandidateDashboard;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { markRead } from '../../features/notifications/notificationSlice';
import NotificationPanel from '../NotificationPanel/NotificationPanel';
import styles from './Header.module.css';

const BASE = 'http://localhost:5000';

const Header = ({ onToggleSidebar, title, backPath }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = localStorage.getItem('role');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const profilePath = role === 'voter' ? '/voter/profile' : role === 'candidate' ? '/candidate/profile' : '/admin/dashboard';
  const profileImg = user?.profileImage || user?.photo;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={onToggleSidebar} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        {backPath && (
          <button className={styles.backBtn} onClick={() => navigate(backPath)}>
            ← Back
          </button>
        )}
        <h1 className={styles.title}>{title || 'Dashboard'}</h1>
      </div>

      <div className={styles.right}>
        {/* Notification bell */}
        <div className={styles.iconWrapper}>
          <button className={styles.iconBtn} onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            onMarkRead={(id) => dispatch(markRead(id))}
          />
        </div>

        {/* Profile */}
        <div className={styles.iconWrapper}>
          <button className={styles.profileBtn} onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}>
            {profileImg ? (
              <img src={`${BASE}${profileImg}`} alt="profile" className={styles.avatar} onError={e => { e.target.style.display='none'; }} />
            ) : (
              <div className={styles.avatarFallback}>{(user?.firstName || user?.name || 'U')[0].toUpperCase()}</div>
            )}
            <span className={styles.profileName}>{user?.firstName || user?.name || 'User'}</span>
            <span className={styles.chevron}>▾</span>
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <Link to={profilePath} className={styles.dropItem} onClick={() => setProfileOpen(false)}>
                👤 My Profile
              </Link>
              <button className={styles.dropItem} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
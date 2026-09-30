import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react';

import { logout } from '../../features/auth/authSlice';
import { markRead } from '../../features/notifications/notificationSlice';
import NotificationPanel from '../NotificationPanel/NotificationPanel';
import styles from './Header.module.css';
import { getImageUrl } from '../../utils/imageUrl';

const Header = ({ onToggleSidebar, title, backPath }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector(
    (s) => s.notifications
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = localStorage.getItem('role');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const profilePath =
    role === 'voter'
      ? '/voter/profile'
      : role === 'candidate'
        ? '/candidate/profile'
        : '/admin/dashboard';

  const profileImg =
    user?.profileImage || user?.photo;

  const displayName =
    user?.firstName || user?.name || 'User';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onToggleSidebar && (
          <button
            type="button"
            className={styles.hamburger}
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}

        {backPath && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <div className={styles.titleGroup}>
          <span className={styles.titleLabel}>
            E-VOTING SYSTEM
          </span>

          <h1 className={styles.title}>
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.iconWrapper}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => {
              setNotifOpen((open) => !open);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            onMarkRead={(id) => dispatch(markRead(id))}
          />
        </div>

        {/* Profile */}
        <div className={styles.iconWrapper}>
          <button
            type="button"
            className={styles.profileBtn}
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotifOpen(false);
            }}
          >
            {profileImg ? (
              <img
                src={getImageUrl(profileImg)}
                alt={`${displayName} profile`}
                className={styles.avatar}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {displayName[0].toUpperCase()}
              </div>
            )}

            <div className={styles.profileText}>
              <strong>{displayName}</strong>
              <span>
                {role
                  ? role.charAt(0).toUpperCase() +
                    role.slice(1)
                  : 'User'}
              </span>
            </div>

            <ChevronDown
              size={15}
              className={`${styles.chevron} ${
                profileOpen ? styles.chevronOpen : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownAvatar}>
                  {displayName[0].toUpperCase()}
                </div>

                <div>
                  <strong>{displayName}</strong>
                  <span>
                    {role
                      ? role.charAt(0).toUpperCase() +
                        role.slice(1)
                      : 'User'}
                  </span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <Link
                to={profilePath}
                className={styles.dropItem}
                onClick={() => setProfileOpen(false)}
              >
                <UserRound size={17} />
                My Profile
              </Link>

              <button
                type="button"
                className={`${styles.dropItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
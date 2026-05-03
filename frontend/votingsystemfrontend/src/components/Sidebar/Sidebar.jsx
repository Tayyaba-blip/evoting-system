import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import styles from './Sidebar.module.css';

const Sidebar = ({ open, onClose, role, menuItems }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🗳️</span>
            <div>
              <div className={styles.logoText}>ECP</div>
              <div className={styles.logoSub}>E-Voting System</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>

        <div className={styles.roleTag}>
          <span className={`${styles.roleBadge} ${styles[role]}`}>
            {role === 'voter' ? '🗳️ Voter' : role === 'admin' ? '⚙️ Admin' : '🏅 Candidate'}
          </span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item, i) => {
            if (item.type === 'divider') return <div key={i} className={styles.divider}>{item.label}</div>;
            if (item.children) return (
              <div key={i} className={styles.group}>
                <div className={styles.groupLabel}>{item.icon} {item.label}</div>
                {item.children.map((child, j) => (
                  <NavLink
                    key={j}
                    to={child.path}
                    className={({ isActive }) => `${styles.navItem} ${styles.child} ${isActive ? styles.active : ''}`}
                    onClick={onClose}
                  >
                    <span className={styles.navIcon}>{child.icon}</span>
                    {child.label}
                  </NavLink>
                ))}
              </div>
            );
            if (item.action === 'logout') return (
              <button key={i} className={`${styles.navItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            );
            return (
              <NavLink
                key={i}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerText}>Election Commission of Pakistan</div>
          <div className={styles.footerSub}>Secure · Verified · Digital</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
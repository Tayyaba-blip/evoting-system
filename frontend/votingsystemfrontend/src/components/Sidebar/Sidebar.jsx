import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  UserRound,
  Users,
  Vote,
  Landmark,
  Megaphone,
  CalendarDays,
  Bell,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  UserCheck,
  BadgeCheck,
  Building2,
  ChevronRight,
  Circle,
  MessageSquare,
  FileText,
  BarChart3,
  Blocks,
} from 'lucide-react';

import { logout } from '../../features/auth/authSlice';
import styles from './Sidebar.module.css';


/* =========================================
   ICON MAPPING

   This lets your existing menuItems continue
   working even if item.icon currently contains
   emoji/string icons.
========================================= */

const getMenuIcon = (item) => {
  const text = `${item?.label || ''} ${item?.path || ''}`.toLowerCase();

  if (item?.action === 'logout') return LogOut;

  if (text.includes('dashboard')) return LayoutDashboard;
  if (text.includes('profile')) return UserRound;
  if (text.includes('voter')) return Users;
  if (text.includes('candidate')) return UserCheck;
  if (text.includes('party')) return Landmark;
  if (text.includes('vote') || text.includes('voting')) return Vote;
  if (text.includes('announcement')) return Megaphone;
  if (text.includes('schedule')) return CalendarDays;
  if (text.includes('notification')) return Bell;
  if (text.includes('setting')) return Settings;
  if (text.includes('admin')) return ShieldCheck;
  if (text.includes('message') || text.includes('chat')) return MessageSquare;
  if (text.includes('report')) return FileText;
  if (text.includes('result') || text.includes('stat')) return BarChart3;
  if (text.includes('blockchain') || text.includes('block')) return Blocks;

  return Circle;
};


const Sidebar = ({
  open,
  onClose,
  role,
  menuItems,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    dispatch(logout());
    onClose?.();
    navigate('/');
  };


  /* =========================================
     ROLE INFORMATION
  ========================================= */

  const getRoleInfo = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator',
          Icon: ShieldCheck,
        };

      case 'candidate':
        return {
          label: 'Candidate',
          Icon: BadgeCheck,
        };

      default:
        return {
          label: 'Voter',
          Icon: UserCheck,
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.Icon;


  /* =========================================
     UI
  ========================================= */

  return (
    <>
      {/* Background overlay */}

      {open && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}


      <aside
        className={`${styles.sidebar} ${
          open ? styles.open : ''
        }`}
        aria-hidden={!open}
      >

        {/* =====================================
            HEADER
        ====================================== */}

        <div className={styles.sidebarTop}>

          <div className={styles.logo}>

            <div className={styles.logoIcon}>
              <Building2 size={21} strokeWidth={2.1} />
            </div>

            <div className={styles.logoContent}>
              <div className={styles.logoText}>
                ECP
              </div>

              <div className={styles.logoSub}>
                E-Voting System
              </div>
            </div>

          </div>


          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={17} />
          </button>

        </div>


        {/* =====================================
            ROLE
        ====================================== */}

        <div className={styles.roleSection}>

          <div
            className={`${styles.roleBadge} ${
              styles[role] || styles.voter
            }`}
          >
            <div className={styles.roleIcon}>
              <RoleIcon size={14} strokeWidth={2.2} />
            </div>

            <div className={styles.roleInfo}>
              <span className={styles.roleCaption}>
                Signed in as
              </span>

              <strong>
                {roleInfo.label}
              </strong>
            </div>

            <span className={styles.verifiedDot} />

          </div>

        </div>


        {/* =====================================
            NAVIGATION
        ====================================== */}

        <nav className={styles.nav}>

          {menuItems.map((item, i) => {

            /* Divider */

            if (item.type === 'divider') {
              return (
                <div
                  key={i}
                  className={styles.divider}
                >
                  <span>{item.label}</span>
                </div>
              );
            }


            /* Group */

            if (item.children) {
              const GroupIcon = getMenuIcon(item);

              return (
                <div
                  key={i}
                  className={styles.group}
                >

                  <div className={styles.groupLabel}>

                    <span className={styles.groupIcon}>
                      <GroupIcon
                        size={16}
                        strokeWidth={2}
                      />
                    </span>

                    <span>
                      {item.label}
                    </span>

                  </div>


                  <div className={styles.children}>

                    {item.children.map((child, j) => {
                      const ChildIcon =
                        getMenuIcon(child);

                      return (
                        <NavLink
                          key={j}
                          to={child.path}
                          className={({ isActive }) =>
                            `${styles.navItem} ${styles.child} ${
                              isActive ? styles.active : ''
                            }`
                          }
                          onClick={onClose}
                        >

                          <span className={styles.navIcon}>
                            <ChildIcon
                              size={16}
                              strokeWidth={2}
                            />
                          </span>

                          <span className={styles.navLabel}>
                            {child.label}
                          </span>

                          <ChevronRight
                            className={styles.navArrow}
                            size={14}
                          />

                        </NavLink>
                      );
                    })}

                  </div>

                </div>
              );
            }


            /* Logout */

            if (item.action === 'logout') {
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.navItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                >

                  <span className={styles.navIcon}>
                    <LogOut
                      size={17}
                      strokeWidth={2}
                    />
                  </span>

                  <span className={styles.navLabel}>
                    {item.label}
                  </span>

                </button>
              );
            }


            /* Normal menu item */

            const MenuIcon = getMenuIcon(item);

            return (
              <NavLink
                key={i}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navItem} ${
                    isActive ? styles.active : ''
                  }`
                }
                onClick={onClose}
              >

                <span className={styles.navIcon}>
                  <MenuIcon
                    size={17}
                    strokeWidth={2}
                  />
                </span>

                <span className={styles.navLabel}>
                  {item.label}
                </span>

                <ChevronRight
                  className={styles.navArrow}
                  size={14}
                />

              </NavLink>
            );
          })}

        </nav>


        {/* =====================================
            FOOTER
        ====================================== */}

        <div className={styles.sidebarFooter}>

          <div className={styles.footerIcon}>
            <ShieldCheck
              size={15}
              strokeWidth={2}
            />
          </div>

          <div>
            <div className={styles.footerText}>
              Election Commission
            </div>

            <div className={styles.footerSub}>
              Secure · Verified · Digital
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
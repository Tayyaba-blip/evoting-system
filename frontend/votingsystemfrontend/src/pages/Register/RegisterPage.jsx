import { Link } from 'react-router-dom';
// import AnnouncementBanner from '../../components/AnnouncementBanner/AnnouncementBanner';
import styles from './RegisterPage.module.css';

const RegisterPage = () => (
  <div className={styles.page}>
    {/* <AnnouncementBanner page="register" /> */}
    <div className={styles.bg} />
    <div className={styles.overlay} />

    <div className={styles.card}>
      <div className={styles.logo}>🗳️</div>
      <h1 className={styles.title}>Election Commission of Pakistan</h1>
      <p className={styles.subtitle}>Secure · Verified · Digital Voting System</p>
      <p className={styles.prompt}>How would you like to proceed?</p>

      <div className={styles.options}>
        <Link to="/login" className={styles.option}>
          <span className={styles.optionIcon}>🔐</span>
          <div className={styles.optionTitle}>Login</div>
          <div className={styles.optionDesc}>Already registered? Sign in to your voter, admin, or candidate account.</div>
          <div className={styles.optionArrow}>→</div>
        </Link>
        <Link to="/signup" className={`${styles.option} ${styles.optionPrimary}`}>
          <span className={styles.optionIcon}>📋</span>
          <div className={styles.optionTitle}>Sign Up</div>
          <div className={styles.optionDesc}>New voter? Register using your CNIC and facial recognition.</div>
          <div className={styles.optionArrow}>→</div>
        </Link>
      </div>

      <Link to="/" className={styles.backLink}>← Back to Home</Link>
    </div>
  </div>
);

export default RegisterPage;
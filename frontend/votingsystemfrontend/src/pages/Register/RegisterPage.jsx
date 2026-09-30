import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AnnouncementBanner from '../../components/AnnouncementBanner/AnnouncementBanner';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  return (
    <div className={styles.page}>
      <AnnouncementBanner page="register" />

      {/* Keep existing background image */}
      <div className={styles.bg} />
      <div className={styles.overlay} />

      {/* Decorative glow */}
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <main className={styles.card}>
        <div className={styles.brandMark}>
          <span>ECP</span>
        </div>

        <div className={styles.heading}>
          <span className={styles.eyebrow}>DIGITAL VOTING PORTAL</span>

          <h1 className={styles.title}>
            Election Commission
            <span> of Pakistan</span>
          </h1>

          <p className={styles.subtitle}>
            Secure, verified and accessible digital voting.
          </p>
        </div>

        <div className={styles.divider}>
          <span />
          <p>Choose how you would like to continue</p>
          <span />
        </div>

        <div className={styles.options}>
          <Link to="/login" className={styles.option}>
            <div className={styles.optionContent}>
              <div className={styles.optionTop}>
                <span className={styles.optionLabel}>EXISTING USER</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </div>

              <h2>Login</h2>

              <p>
                Access your voter, candidate or administrator account.
              </p>
            </div>
          </Link>

          <Link
            to="/signup"
            className={`${styles.option} ${styles.optionPrimary}`}
          >
            <div className={styles.optionContent}>
              <div className={styles.optionTop}>
                <span className={styles.optionLabel}>NEW VOTER</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </div>

              <h2>Create an account</h2>

              <p>
                Register as a voter using your CNIC and identity verification.
              </p>
            </div>
          </Link>
        </div>

        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={15} strokeWidth={2.2} />
          Back to Home
        </Link>
      </main>
    </div>
  );
};

export default RegisterPage;
import styles from './Loader.module.css';

const Loader = ({ text = 'Loading...', fullScreen = false }) => (
  <div className={`${styles.wrapper} ${fullScreen ? styles.fullScreen : ''}`}>
    <div className={styles.ring}>
      <div /><div /><div /><div />
    </div>
    {text && <p className={styles.text}>{text}</p>}
  </div>
);

export default Loader;
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchElectionHistory } from '../../features/admin/adminSlice';
import { formatVoteCount } from '../../utils/formatters';
import styles from './ElectionHistory.module.css';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK'];

const ElectionHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { electionHistory, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchElectionHistory()); }, [dispatch]);

  const results = electionHistory?.results || {};
  const overallWinner = electionHistory?.overallWinner;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>📜 Election History & Results</h1>
      </div>

      {loading ? <div className={styles.loader}>Loading results...</div> : (
        <>
          {overallWinner && (
            <div className={styles.winnerBanner}>
              <div className={styles.winnerContent}>
                <span className={styles.trophy}>🏆</span>
                <div>
                  <h2>Overall Winner</h2>
                  <h3>{overallWinner.name} ({overallWinner.abbreviation})</h3>
                  <p>{formatVoteCount(overallWinner.totalVotes)} total votes nationwide</p>
                </div>
                {overallWinner.flag && (
                  <img src={`${import.meta.env.VITE_API_BASE}${overallWinner.flag}`} alt="Flag" className={styles.winnerFlag} />
                )}
              </div>
            </div>
          )}

          <div className={styles.provincesGrid}>
            {PROVINCES.map((province) => {
              const data = results[province];
              return (
                <div key={province} className={styles.provinceCard}>
                  <h3 className={styles.provinceName}>{province}</h3>
                  <div className={styles.resultRow}>
                    <div className={styles.resultItem}>
                      <span className={styles.resultType}>MNA Winner</span>
                      {data?.mnaWinner ? (
                        <>
                          <span className={styles.candidateName}>{data.mnaWinner.name}</span>
                          <span className={styles.partyTag}>{data.mnaWinner.party?.abbreviation || 'Independent'}</span>
                          <span className={styles.voteCount}>{formatVoteCount(data.mnaWinner.totalVotes)} votes</span>
                        </>
                      ) : <span className={styles.noData}>No votes yet</span>}
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.resultItem}>
                      <span className={styles.resultType}>MPA Winner</span>
                      {data?.mpaWinner ? (
                        <>
                          <span className={styles.candidateName}>{data.mpaWinner.name}</span>
                          <span className={styles.partyTag}>{data.mpaWinner.party?.abbreviation || 'Independent'}</span>
                          <span className={styles.voteCount}>{formatVoteCount(data.mpaWinner.totalVotes)} votes</span>
                        </>
                      ) : <span className={styles.noData}>No votes yet</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionHistory;
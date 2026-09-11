import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchVoters } from '../../features/admin/adminSlice';
import { formatDate, maskCnic, formatFullName } from '../../utils/formatters';
import styles from './VoterList.module.css';

const VoterList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { voters, loading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => { dispatch(fetchVoters()); }, [dispatch]);

  const filtered = voters.filter((v) => {
    const name = formatFullName(v.firstName, v.middleName, v.lastName).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || v.cnicNumber?.includes(search) || v.tehsil?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      (filter === 'Voted MNA' && v.hasVotedMNA) ||
      (filter === 'Voted MPA' && v.hasVotedMPA) ||
      (filter === 'Not Voted' && !v.hasVotedMNA && !v.hasVotedMPA);
    return matchSearch && matchFilter;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>🗳️ Registered Voters</h1>
        <span className={styles.count}>{voters.length} Total</span>
      </div>

      <div className={styles.controls}>
        <input className={styles.search} placeholder="🔍 Search by name, CNIC, tehsil..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.filters}>
          {['All', 'Voted MNA', 'Voted MPA', 'Not Voted'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className={styles.loader}>Loading voters...</div> :
       filtered.length === 0 ? <div className={styles.empty}><span>🗳️</span><p>No voters found.</p></div> : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Voter</span>
            <span>CNIC</span>
            <span>Tehsil</span>
            <span>Province</span>
            <span>MNA</span>
            <span>MPA</span>
            <span>Registered</span>
          </div>
          {filtered.map((v) => (
            <div key={v._id} className={styles.tableRow}>
              <div className={styles.voterInfo}>
                {v.profileImage ? (
                  <img src={`http://localhost:5000${v.profileImage}`} alt={v.firstName} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{v.firstName?.[0]?.toUpperCase() || '?'}</div>
                )}
                <div>
                  <strong>{formatFullName(v.firstName, v.middleName, v.lastName)}</strong>
                  <small>{v.gender} · {v.city}</small>
                </div>
              </div>
              <span className={styles.cnic}>{maskCnic(v.cnicNumber)}</span>
              <span>{v.tehsil || '—'}</span>
              <span>{v.province || '—'}</span>
              <span className={v.hasVotedMNA ? styles.voted : styles.notVoted}>{v.hasVotedMNA ? '✓' : '—'}</span>
              <span className={v.hasVotedMPA ? styles.voted : styles.notVoted}>{v.hasVotedMPA ? '✓' : '—'}</span>
              <span className={styles.date}>{formatDate(v.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoterList;
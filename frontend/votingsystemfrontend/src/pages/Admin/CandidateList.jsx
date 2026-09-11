import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCandidates, removeCandidateLocal } from '../../features/admin/adminSlice';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import styles from './CandidateList.module.css';

const CandidateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { candidates, loading } = useSelector((s) => s.admin);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchCandidates()); }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete candidate "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/admin/candidates/${id}`);
      dispatch(removeCandidateLocal(id));
      toast.success('Candidate deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = candidates.filter((c) => {
    const matchType = filter === 'All' || c.electionType === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.constituency?.toLowerCase().includes(search.toLowerCase()) ||
      c.tehsil?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>👤 Candidates</h1>
        <Link to="/admin/dashboard/candidates/add" className={styles.addBtn}>+ Add Candidate</Link>
      </div>

      <div className={styles.controls}>
        <input className={styles.search} placeholder="🔍 Search by name, constituency, tehsil..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.filters}>
          {['All', 'MNA', 'MPA'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading candidates...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>👤</span>
          <p>No candidates found.</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Candidate</span>
            <span>Type</span>
            <span>Party</span>
            <span>Constituency</span>
            <span>Tehsil</span>
            <span>Votes</span>
            <span>Actions</span>
          </div>
          {filtered.map((c) => (
            <div key={c._id} className={styles.tableRow}>
              <div className={styles.candidateInfo}>
                {c.photo ? (
                  <img src={`http://localhost:5000${c.photo}`} alt={c.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>👤</div>
                )}
                <div>
                  <strong>{c.name}</strong>
                  <small>{c.email}</small>
                </div>
              </div>
              <span className={`${styles.typeBadge} ${c.electionType === 'MNA' ? styles.mna : styles.mpa}`}>{c.electionType}</span>
              <span>{c.party?.abbreviation || 'Independent'}</span>
              <span>{c.constituency || '—'}</span>
              <span>{c.tehsil || '—'}</span>
              <span className={styles.votes}>{c.totalVotes?.toLocaleString() || 0}</span>
              <button className={styles.deleteBtn} onClick={() => handleDelete(c._id, c.name)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateList;
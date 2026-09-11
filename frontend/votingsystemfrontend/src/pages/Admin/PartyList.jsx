import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchParties, removePartyLocal } from '../../features/admin/adminSlice';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import styles from './PartyList.module.css';

const PartyList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parties, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchParties()); }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete party "${name}"? This will unlink its candidates.`)) return;
    try {
      await axiosInstance.delete(`/parties/${id}`);
      dispatch(removePartyLocal(id));
      toast.success('Party deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete party');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>🏛️ Political Parties</h1>
        <Link to="/admin/dashboard/parties/add" className={styles.addBtn}>+ Add Party</Link>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading parties...</div>
      ) : parties.length === 0 ? (
        <div className={styles.empty}>
          <span>🏛️</span>
          <p>No parties registered yet.</p>
          <Link to="/admin/dashboard/parties/add" className={styles.addBtn}>Add First Party</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {parties.map((party) => (
            <div key={party._id} className={`${styles.card} ${party.isIndependent ? styles.independent : ''}`}>
              <div className={styles.cardTop}>
                {party.flag ? (
                  <img src={`http://localhost:5000${party.flag}`} alt={party.name} className={styles.flag} />
                ) : (
                  <div className={styles.flagPlaceholder}>{party.isIndependent ? '👤' : '🏛️'}</div>
                )}
                <div className={styles.partyInfo}>
                  <h3 className={styles.partyName}>{party.name}</h3>
                  <span className={styles.abbr}>{party.abbreviation}</span>
                  {party.isIndependent && <span className={styles.indBadge}>Independent</span>}
                </div>
              </div>

              <div className={styles.meta}>
                {party.leaderName && <p>👑 <strong>Leader:</strong> {party.leaderName}</p>}
                {party.foundedYear && <p>📅 <strong>Founded:</strong> {party.foundedYear}</p>}
                <p>🗳️ <strong>Candidates:</strong> {party.candidateCount || 0}</p>
                <p>📊 <strong>Total Votes:</strong> {party.totalVotes?.toLocaleString() || 0}</p>
              </div>

              {party.history && (
                <p className={styles.history}>{party.history.slice(0, 100)}...</p>
              )}

              <div className={styles.actions}>
                <Link to={`/admin/dashboard/parties/${party._id}`} className={styles.viewBtn}>View Details</Link>
                <button className={styles.deleteBtn} onClick={() => handleDelete(party._id, party.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartyList;
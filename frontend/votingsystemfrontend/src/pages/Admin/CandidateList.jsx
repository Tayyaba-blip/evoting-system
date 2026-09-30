import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  Vote,
  X,
} from 'lucide-react';

import {
  fetchCandidates,
  removeCandidateLocal,
} from '../../features/admin/adminSlice';

import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import styles from './CandidateList.module.css';
import { getImageUrl } from '../../utils/imageUrl';

const CandidateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { candidates, loading } = useSelector((s) => s.admin);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete candidate "${name}"?`)) return;

    try {
      await axiosInstance.delete(`/admin/candidates/${id}`);

      dispatch(removeCandidateLocal(id));

      toast.success('Candidate deleted');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete'
      );
    }
  };

  const filtered = candidates.filter((candidate) => {
    const matchType =
      filter === 'All' || candidate.electionType === filter;

    const query = search.trim().toLowerCase();

    const matchSearch =
      !query ||
      candidate.name?.toLowerCase().includes(query) ||
      candidate.constituency?.toLowerCase().includes(query) ||
      candidate.tehsil?.toLowerCase().includes(query);

    return matchType && matchSearch;
  });

  const totalVotes = candidates.reduce(
    (total, candidate) => total + (candidate.totalVotes || 0),
    0
  );

  return (
    <div className={styles.page}>
      {/* Decorative background */}
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <main className={styles.container}>
        {/* ================= HEADER ================= */}

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.back}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className={styles.heading}>
              <span className={styles.eyebrow}>
                CANDIDATE MANAGEMENT
              </span>

              <h1 className={styles.title}>
                Candidates
              </h1>

              <p className={styles.subtitle}>
                Manage registered election candidates.
              </p>
            </div>
          </div>

          <Link
            to="/admin/dashboard/candidates/add"
            className={styles.addBtn}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Candidate
          </Link>
        </header>

        {/* ================= OVERVIEW ================= */}

        {!loading && candidates.length > 0 && (
          <section className={styles.overview}>
            <div className={styles.overviewItem}>
              <UsersRound size={15} />

              <div>
                <span>Registered</span>
                <strong>{candidates.length}</strong>
              </div>
            </div>

            <div className={styles.overviewDivider} />

            <div className={styles.overviewItem}>
              <Vote size={15} />

              <div>
                <span>Total votes</span>
                <strong>{totalVotes.toLocaleString()}</strong>
              </div>
            </div>
          </section>
        )}

        {/* ================= CONTROLS ================= */}

        <section className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search
              size={16}
              strokeWidth={2}
              className={styles.searchIcon}
            />

            <input
              className={styles.search}
              placeholder="Search name, constituency or tehsil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filters}>
            {['All', 'MNA', 'MPA'].map((item) => (
              <button
                type="button"
                key={item}
                className={`${styles.filterBtn} ${
                  filter === item ? styles.active : ''
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ================= STATES ================= */}

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <strong>Loading candidates</strong>

            <span>Please wait a moment...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.stateCard}>
            <div className={styles.emptyIcon}>
              <UserRound size={25} />
            </div>

            <strong>No candidates found</strong>

            <span>
              {search || filter !== 'All'
                ? 'Try changing your search or filter.'
                : 'No candidates have been registered yet.'}
            </span>

            {(search || filter !== 'All') && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => {
                  setSearch('');
                  setFilter('All');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ================= DESKTOP TABLE ================= */}

            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>Candidate</span>
                <span>Type</span>
                <span>Party</span>
                <span>Constituency</span>
                <span>Tehsil</span>
                <span>Votes</span>
                <span />
              </div>

              <div className={styles.tableBody}>
                {filtered.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={styles.tableRow}
                  >
                    <div className={styles.candidateInfo}>
                      <div className={styles.avatarWrap}>
                        {candidate.photo ? (
                          <img
                            src={getImageUrl(candidate.photo)}
                            alt={candidate.name}
                            className={styles.avatar}
                          />
                        ) : (
                          <div
                            className={styles.avatarPlaceholder}
                          >
                            <UserRound size={18} />
                          </div>
                        )}
                      </div>

                      <div className={styles.candidateText}>
                        <strong>{candidate.name}</strong>

                        {candidate.email && (
                          <small>{candidate.email}</small>
                        )}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`${styles.typeBadge} ${
                          candidate.electionType === 'MNA'
                            ? styles.mna
                            : styles.mpa
                        }`}
                      >
                        {candidate.electionType}
                      </span>
                    </div>

                    <span className={styles.cellText}>
                      {candidate.party?.abbreviation ||
                        'Independent'}
                    </span>

                    <span className={styles.cellText}>
                      {candidate.constituency || '—'}
                    </span>

                    <span className={styles.cellText}>
                      {candidate.tehsil || '—'}
                    </span>

                    <span className={styles.votes}>
                      {candidate.totalVotes?.toLocaleString() || 0}
                    </span>

                    <div className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() =>
                          handleDelete(
                            candidate._id,
                            candidate.name
                          )
                        }
                        aria-label={`Delete ${candidate.name}`}
                        title="Delete candidate"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= MOBILE CARDS ================= */}

            <div className={styles.mobileList}>
              {filtered.map((candidate) => (
                <article
                  key={candidate._id}
                  className={styles.mobileCard}
                >
                  <div className={styles.mobileTop}>
                    <div className={styles.candidateInfo}>
                      <div className={styles.avatarWrap}>
                        {candidate.photo ? (
                          <img
                            src={getImageUrl(candidate.photo)}
                            alt={candidate.name}
                            className={styles.avatar}
                          />
                        ) : (
                          <div
                            className={styles.avatarPlaceholder}
                          >
                            <UserRound size={18} />
                          </div>
                        )}
                      </div>

                      <div className={styles.candidateText}>
                        <strong>{candidate.name}</strong>

                        <small>
                          {candidate.party?.abbreviation ||
                            'Independent'}
                        </small>
                      </div>
                    </div>

                    <span
                      className={`${styles.typeBadge} ${
                        candidate.electionType === 'MNA'
                          ? styles.mna
                          : styles.mpa
                      }`}
                    >
                      {candidate.electionType}
                    </span>
                  </div>

                  <div className={styles.mobileMeta}>
                    <div>
                      <span>Constituency</span>
                      <strong>
                        {candidate.constituency || '—'}
                      </strong>
                    </div>

                    <div>
                      <span>Tehsil</span>
                      <strong>
                        {candidate.tehsil || '—'}
                      </strong>
                    </div>

                    <div>
                      <span>Votes</span>
                      <strong className={styles.mobileVotes}>
                        {candidate.totalVotes?.toLocaleString() ||
                          0}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.mobileActions}>
                    {candidate.email && (
                      <span className={styles.mobileEmail}>
                        {candidate.email}
                      </span>
                    )}

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() =>
                        handleDelete(
                          candidate._id,
                          candidate.name
                        )
                      }
                      aria-label={`Delete ${candidate.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CandidateList;
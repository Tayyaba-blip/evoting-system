import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Search,
  UserRound,
  UsersRound,
  Vote,
  X,
} from 'lucide-react';

import { fetchVoters } from '../../features/admin/adminSlice';

import {
  formatDate,
  maskCnic,
  formatFullName,
} from '../../utils/formatters';

import { getImageUrl } from '../../utils/imageUrl';

import styles from './VoterList.module.css';

const FILTERS = [
  'All',
  'Voted MNA',
  'Voted MPA',
  'Not Voted',
];

const VoterList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { voters, loading } = useSelector(
    (state) => state.admin
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchVoters());
  }, [dispatch]);

  const filtered = voters.filter((voter) => {
    const query = search.trim().toLowerCase();

    const fullName = formatFullName(
      voter.firstName,
      voter.middleName,
      voter.lastName
    ).toLowerCase();

    const matchSearch =
      !query ||
      fullName.includes(query) ||
      voter.cnicNumber?.toLowerCase().includes(query) ||
      voter.tehsil?.toLowerCase().includes(query);

    const matchFilter =
      filter === 'All' ||
      (filter === 'Voted MNA' && voter.hasVotedMNA) ||
      (filter === 'Voted MPA' && voter.hasVotedMPA) ||
      (filter === 'Not Voted' &&
        !voter.hasVotedMNA &&
        !voter.hasVotedMPA);

    return matchSearch && matchFilter;
  });

  const votedMNA = voters.filter(
    (voter) => voter.hasVotedMNA
  ).length;

  const votedMPA = voters.filter(
    (voter) => voter.hasVotedMPA
  ).length;

  const clearFilters = () => {
    setSearch('');
    setFilter('All');
  };

  return (
    <div className={styles.page}>
      {/* Background decoration */}
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
                VOTER MANAGEMENT
              </span>

              <h1 className={styles.title}>
                Registered Voters
              </h1>

              <p className={styles.subtitle}>
                View registered voters and voting status.
              </p>
            </div>
          </div>

          <div className={styles.totalBadge}>
            <UsersRound size={15} />
            <span>{voters.length}</span>
            <small>Total</small>
          </div>
        </header>

        {/* ================= OVERVIEW ================= */}

        {!loading && voters.length > 0 && (
          <section className={styles.overview}>
            <div className={styles.overviewItem}>
              <UsersRound size={15} />

              <div>
                <span>Registered</span>
                <strong>{voters.length}</strong>
              </div>
            </div>

            <div className={styles.overviewDivider} />

            <div className={styles.overviewItem}>
              <Vote size={15} />

              <div>
                <span>MNA votes</span>
                <strong>{votedMNA}</strong>
              </div>
            </div>

            <div className={styles.overviewDivider} />

            <div className={styles.overviewItem}>
              <Vote size={15} />

              <div>
                <span>MPA votes</span>
                <strong>{votedMPA}</strong>
              </div>
            </div>
          </section>
        )}

        {/* ================= SEARCH + FILTER ================= */}

        <section className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search
              size={16}
              strokeWidth={2}
              className={styles.searchIcon}
            />

            <input
              type="text"
              className={styles.search}
              placeholder="Search name, CNIC or tehsil..."
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
            {FILTERS.map((item) => (
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

        {/* ================= LOADING ================= */}

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <strong>Loading voters</strong>

            <span>Please wait a moment...</span>
          </div>
        ) : filtered.length === 0 ? (
          /* ================= EMPTY ================= */

          <div className={styles.stateCard}>
            <div className={styles.emptyIcon}>
              <UserRound size={25} />
            </div>

            <strong>No voters found</strong>

            <span>
              {search || filter !== 'All'
                ? 'Try changing your search or filter.'
                : 'No voters have registered yet.'}
            </span>

            {(search || filter !== 'All') && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={clearFilters}
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
                <span>Voter</span>
                <span>CNIC</span>
                <span>Tehsil</span>
                <span>Province</span>
                <span>MNA</span>
                <span>MPA</span>
                <span>Registered</span>
              </div>

              <div className={styles.tableBody}>
                {filtered.map((voter) => {
                  const fullName = formatFullName(
                    voter.firstName,
                    voter.middleName,
                    voter.lastName
                  );

                  return (
                    <div
                      key={voter._id}
                      className={styles.tableRow}
                    >
                      <div className={styles.voterInfo}>
                        <div className={styles.avatarWrap}>
                          {voter.profileImage ? (
                            <img
                              src={getImageUrl(
                                voter.profileImage
                              )}
                              alt={fullName}
                              className={styles.avatar}
                            />
                          ) : (
                            <div
                              className={
                                styles.avatarPlaceholder
                              }
                            >
                              {voter.firstName?.[0]?.toUpperCase() ||
                                '?'}
                            </div>
                          )}
                        </div>

                        <div className={styles.voterText}>
                          <strong>{fullName}</strong>

                          <small>
                            {[voter.gender, voter.city]
                              .filter(Boolean)
                              .join(' · ') || 'Voter'}
                          </small>
                        </div>
                      </div>

                      <span className={styles.cnic}>
                        {maskCnic(voter.cnicNumber)}
                      </span>

                      <span className={styles.cellText}>
                        {voter.tehsil || '—'}
                      </span>

                      <span className={styles.cellText}>
                        {voter.province || '—'}
                      </span>

                      <div>
                        <span
                          className={`${styles.voteStatus} ${
                            voter.hasVotedMNA
                              ? styles.voted
                              : styles.notVoted
                          }`}
                          title={
                            voter.hasVotedMNA
                              ? 'MNA vote cast'
                              : 'MNA vote not cast'
                          }
                        >
                          {voter.hasVotedMNA ? (
                            <Check
                              size={12}
                              strokeWidth={3}
                            />
                          ) : (
                            <span>—</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`${styles.voteStatus} ${
                            voter.hasVotedMPA
                              ? styles.voted
                              : styles.notVoted
                          }`}
                          title={
                            voter.hasVotedMPA
                              ? 'MPA vote cast'
                              : 'MPA vote not cast'
                          }
                        >
                          {voter.hasVotedMPA ? (
                            <Check
                              size={12}
                              strokeWidth={3}
                            />
                          ) : (
                            <span>—</span>
                          )}
                        </span>
                      </div>

                      <span className={styles.date}>
                        {formatDate(voter.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= MOBILE CARDS ================= */}

            <div className={styles.mobileList}>
              {filtered.map((voter) => {
                const fullName = formatFullName(
                  voter.firstName,
                  voter.middleName,
                  voter.lastName
                );

                return (
                  <article
                    key={voter._id}
                    className={styles.mobileCard}
                  >
                    <div className={styles.mobileTop}>
                      <div className={styles.voterInfo}>
                        <div className={styles.avatarWrap}>
                          {voter.profileImage ? (
                            <img
                              src={getImageUrl(
                                voter.profileImage
                              )}
                              alt={fullName}
                              className={styles.avatar}
                            />
                          ) : (
                            <div
                              className={
                                styles.avatarPlaceholder
                              }
                            >
                              {voter.firstName?.[0]?.toUpperCase() ||
                                '?'}
                            </div>
                          )}
                        </div>

                        <div className={styles.voterText}>
                          <strong>{fullName}</strong>

                          <small>
                            {[voter.gender, voter.city]
                              .filter(Boolean)
                              .join(' · ') || 'Voter'}
                          </small>
                        </div>
                      </div>

                      <span className={styles.mobileCnic}>
                        {maskCnic(voter.cnicNumber)}
                      </span>
                    </div>

                    <div className={styles.mobileMeta}>
                      <div>
                        <span>Tehsil</span>
                        <strong>
                          {voter.tehsil || '—'}
                        </strong>
                      </div>

                      <div>
                        <span>Province</span>
                        <strong>
                          {voter.province || '—'}
                        </strong>
                      </div>

                      <div>
                        <span>Registered</span>
                        <strong>
                          {formatDate(voter.createdAt)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.mobileVoting}>
                      <div>
                        <span>MNA</span>

                        <div
                          className={`${styles.mobileVoteBadge} ${
                            voter.hasVotedMNA
                              ? styles.mobileVoted
                              : styles.mobilePending
                          }`}
                        >
                          {voter.hasVotedMNA && (
                            <Check
                              size={11}
                              strokeWidth={3}
                            />
                          )}

                          {voter.hasVotedMNA
                            ? 'Voted'
                            : 'Not voted'}
                        </div>
                      </div>

                      <div>
                        <span>MPA</span>

                        <div
                          className={`${styles.mobileVoteBadge} ${
                            voter.hasVotedMPA
                              ? styles.mobileVoted
                              : styles.mobilePending
                          }`}
                        >
                          {voter.hasVotedMPA && (
                            <Check
                              size={11}
                              strokeWidth={3}
                            />
                          )}

                          {voter.hasVotedMPA
                            ? 'Voted'
                            : 'Not voted'}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VoterList;
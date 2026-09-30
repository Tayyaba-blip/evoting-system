import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Plus,
  Trash2,
  UserRound,
  UsersRound,
  Vote,
} from 'lucide-react';
import { fetchParties, removePartyLocal } from '../../features/admin/adminSlice';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import styles from './PartyList.module.css';
import { getImageUrl } from '../../utils/imageUrl';

const PartyList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { parties, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchParties());
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Delete party "${name}"? This will unlink its candidates.`
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/parties/${id}`);
      dispatch(removePartyLocal(id));
      toast.success('Party deleted successfully');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete party'
      );
    }
  };

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.background} aria-hidden="true">
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <div className={styles.container}>
        {/* Header */}
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
              <span className={styles.eyebrow}>PARTY MANAGEMENT</span>

              <h1 className={styles.title}>Political Parties</h1>

              <p className={styles.subtitle}>
                Manage registered parties and independent candidates.
              </p>
            </div>
          </div>

          <Link
            to="/admin/dashboard/parties/add"
            className={styles.addBtn}
          >
            <Plus size={17} strokeWidth={2.5} />
            Add Party
          </Link>
        </header>

        {/* Small overview */}
        {!loading && parties.length > 0 && (
          <div className={styles.overview}>
            <div>
              <span className={styles.overviewLabel}>
                Registered parties
              </span>

              <strong className={styles.overviewValue}>
                {parties.length}
              </strong>
            </div>

            <div className={styles.overviewDivider} />

            <div>
              <span className={styles.overviewLabel}>
                Total candidates
              </span>

              <strong className={styles.overviewValue}>
                {parties
                  .reduce(
                    (total, party) =>
                      total + (party.candidateCount || 0),
                    0
                  )
                  .toLocaleString()}
              </strong>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.loaderSpinner} />

            <strong>Loading parties</strong>
            <span>Please wait a moment...</span>
          </div>
        ) : parties.length === 0 ? (
          <div className={styles.stateCard}>
            <div className={styles.emptyIcon}>
              <Building2 size={27} />
            </div>

            <strong>No parties registered</strong>

            <span>
              Add a political party to get started.
            </span>

            <Link
              to="/admin/dashboard/parties/add"
              className={styles.emptyBtn}
            >
              <Plus size={16} />
              Add First Party
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {parties.map((party) => (
              <article
                key={party._id}
                className={`${styles.card} ${
                  party.isIndependent ? styles.independent : ''
                }`}
              >
                {/* Party heading */}
                <div className={styles.cardTop}>
                  <div className={styles.flagWrap}>
                    {party.flag ? (
                      <img
                        src={getImageUrl(party.flag)}
                        alt={`${party.name} flag`}
                        className={styles.flag}
                      />
                    ) : (
                      <div className={styles.flagPlaceholder}>
                        {party.isIndependent ? (
                          <UserRound size={24} />
                        ) : (
                          <Building2 size={24} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.partyInfo}>
                    <div className={styles.nameRow}>
                      <h2 className={styles.partyName}>
                        {party.name}
                      </h2>

                      {party.isIndependent && (
                        <span className={styles.indBadge}>
                          Independent
                        </span>
                      )}
                    </div>

                    {party.abbreviation && (
                      <span className={styles.abbr}>
                        {party.abbreviation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Party information */}
                <div className={styles.meta}>
                  {party.leaderName && (
                    <div className={styles.metaItem}>
                      <UserRound size={16} />

                      <div>
                        <span>Leader</span>
                        <strong>{party.leaderName}</strong>
                      </div>
                    </div>
                  )}

                  {party.foundedYear && (
                    <div className={styles.metaItem}>
                      <CalendarDays size={16} />

                      <div>
                        <span>Founded</span>
                        <strong>{party.foundedYear}</strong>
                      </div>
                    </div>
                  )}

                  <div className={styles.metaItem}>
                    <UsersRound size={16} />

                    <div>
                      <span>Candidates</span>
                      <strong>
                        {party.candidateCount || 0}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.metaItem}>
                    <Vote size={16} />

                    <div>
                      <span>Total votes</span>
                      <strong>
                        {party.totalVotes?.toLocaleString() || 0}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* History */}
                {party.history && (
                  <p className={styles.history}>
                    {party.history.length > 115
                      ? `${party.history.slice(0, 115)}...`
                      : party.history}
                  </p>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                  <Link
                    to={`/admin/dashboard/parties/${party._id}`}
                    className={styles.viewBtn}
                  >
                    View details
                    <ArrowRight size={15} />
                  </Link>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() =>
                      handleDelete(party._id, party.name)
                    }
                    aria-label={`Delete ${party.name}`}
                    title="Delete party"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyList;
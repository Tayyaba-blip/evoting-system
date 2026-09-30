import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarCheck2,
  MapPin,
  ShieldCheck,
  UserRound,
  Vote,
} from 'lucide-react';

import { fetchElectionHistory } from '../../features/admin/adminSlice';
import { formatVoteCount } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUrl';

import styles from './ElectionHistory.module.css';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'AJK',
];

const ElectionHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { electionHistory, loading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchElectionHistory());
  }, [dispatch]);

  const results = electionHistory?.results || {};
  const overallWinner =
    electionHistory?.overallWinner;

  const provincesWithResults = PROVINCES.filter(
    (province) =>
      results[province]?.mnaWinner ||
      results[province]?.mpaWinner
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <main className={styles.container}>
        {/* HEADER */}

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

            <div>
              <span className={styles.eyebrow}>
                ELECTION RECORDS
              </span>

              <h1 className={styles.title}>
                Election Results
              </h1>

              <p className={styles.subtitle}>
                Review recorded election results by region.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <strong>Loading results</strong>

            <span>
              Retrieving election records...
            </span>
          </div>
        ) : (
          <>
            {/* OVERVIEW */}

            <div className={styles.overview}>
              <div className={styles.overviewItem}>
                <MapPin size={14} />

                <div>
                  <span>Regions with results</span>

                  <strong>
                    {provincesWithResults}/{PROVINCES.length}
                  </strong>
                </div>
              </div>

              <div className={styles.overviewDivider} />

              <div className={styles.overviewItem}>
                <ShieldCheck size={14} />

                <div>
                  <span>Record</span>
                  <strong>Election Data</strong>
                </div>
              </div>
            </div>

            {/* OVERALL RESULT */}

            {overallWinner && (
              <section className={styles.overallCard}>
                <div className={styles.overallGlow} />

                <div className={styles.overallLeft}>
                  <div className={styles.overallIcon}>
                    <Vote size={21} />
                  </div>

                  <div className={styles.overallText}>
                    <span className={styles.resultLabel}>
                      TOP PARTY BY RECORDED VOTES
                    </span>

                    <h2>
                      {overallWinner.name}
                    </h2>

                    <div className={styles.overallMeta}>
                      {overallWinner.abbreviation && (
                        <span
                          className={
                            styles.partyBadge
                          }
                        >
                          {overallWinner.abbreviation}
                        </span>
                      )}

                      <span
                        className={styles.voteTotal}
                      >
                        <Vote size={12} />

                        {formatVoteCount(
                          overallWinner.totalVotes
                        )}{' '}
                        recorded votes
                      </span>
                    </div>
                  </div>
                </div>

                {overallWinner.flag && (
                  <div className={styles.flagWrap}>
                    <img
                      src={getImageUrl(
                        overallWinner.flag
                      )}
                      alt={`${overallWinner.name} flag`}
                      className={styles.winnerFlag}
                    />
                  </div>
                )}
              </section>
            )}

            {/* REGIONS */}

            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionLabel}>
                  REGIONAL RESULTS
                </span>

                <h2>Results by Region</h2>
              </div>

              <span className={styles.regionCount}>
                {PROVINCES.length} regions
              </span>
            </div>

            <div className={styles.provincesGrid}>
              {PROVINCES.map((province) => {
                const data = results[province];

                return (
                  <article
                    key={province}
                    className={styles.provinceCard}
                  >
                    <div
                      className={
                        styles.provinceHeader
                      }
                    >
                      <div
                        className={
                          styles.locationIcon
                        }
                      >
                        <MapPin size={15} />
                      </div>

                      <div>
                        <span>REGION</span>

                        <h3>{province}</h3>
                      </div>
                    </div>

                    <div className={styles.results}>
                      {/* MNA */}

                      <div
                        className={
                          styles.resultItem
                        }
                      >
                        <div
                          className={
                            styles.resultHeading
                          }
                        >
                          <span>MNA</span>

                          <small>
                            Recorded leader
                          </small>
                        </div>

                        {data?.mnaWinner ? (
                          <div
                            className={
                              styles.candidate
                            }
                          >
                            <div
                              className={
                                styles.candidateIcon
                              }
                            >
                              <UserRound size={15} />
                            </div>

                            <div
                              className={
                                styles.candidateInfo
                              }
                            >
                              <strong>
                                {
                                  data.mnaWinner
                                    .name
                                }
                              </strong>

                              <div
                                className={
                                  styles.candidateMeta
                                }
                              >
                                <span
                                  className={
                                    styles.partyTag
                                  }
                                >
                                  {data.mnaWinner
                                    .party
                                    ?.abbreviation ||
                                    'Independent'}
                                </span>

                                <span
                                  className={
                                    styles.voteCount
                                  }
                                >
                                  {formatVoteCount(
                                    data.mnaWinner
                                      .totalVotes
                                  )}{' '}
                                  votes
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={
                              styles.noData
                            }
                          >
                            No recorded result
                          </div>
                        )}
                      </div>

                      <div className={styles.divider} />

                      {/* MPA */}

                      <div
                        className={
                          styles.resultItem
                        }
                      >
                        <div
                          className={
                            styles.resultHeading
                          }
                        >
                          <span>MPA</span>

                          <small>
                            Recorded leader
                          </small>
                        </div>

                        {data?.mpaWinner ? (
                          <div
                            className={
                              styles.candidate
                            }
                          >
                            <div
                              className={
                                styles.candidateIcon
                              }
                            >
                              <UserRound size={15} />
                            </div>

                            <div
                              className={
                                styles.candidateInfo
                              }
                            >
                              <strong>
                                {
                                  data.mpaWinner
                                    .name
                                }
                              </strong>

                              <div
                                className={
                                  styles.candidateMeta
                                }
                              >
                                <span
                                  className={
                                    styles.partyTag
                                  }
                                >
                                  {data.mpaWinner
                                    .party
                                    ?.abbreviation ||
                                    'Independent'}
                                </span>

                                <span
                                  className={
                                    styles.voteCount
                                  }
                                >
                                  {formatVoteCount(
                                    data.mpaWinner
                                      .totalVotes
                                  )}{' '}
                                  votes
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={
                              styles.noData
                            }
                          >
                            No recorded result
                          </div>
                        )}
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

export default ElectionHistory;
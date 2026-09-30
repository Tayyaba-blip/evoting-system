import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Database,
  RefreshCw,
  ShieldCheck,
  UsersRound,
  Vote,
} from 'lucide-react';

import { fetchVoteStats } from '../../features/admin/adminSlice';
import { formatVoteCount } from '../../utils/formatters';

import styles from './StatsGraph.module.css';

const COLORS = [
  '#159447',
  '#2f8fa3',
  '#d4a72c',
  '#c95b58',
  '#8267a7',
  '#4c9b6c',
  '#c47a39',
  '#526a9c',
];

const StatsGraph = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { voteStats, loading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchVoteStats());
  }, [dispatch]);

  const partyStats = voteStats?.partyStats || [];
  const totalVotes = voteStats?.totalVotesCast || 0;

  const barData = partyStats.map((party) => ({
    name: party.abbreviation || party.name,
    MNA: party.mnaVotes,
    MPA: party.mpaVotes,
    Total: party.totalVotes,
  }));

  const pieData = partyStats
    .filter((party) => party.totalVotes > 0)
    .map((party) => ({
      name: party.abbreviation || party.name,
      value: party.totalVotes,
    }));

  const sortedPartyStats = [...partyStats].sort(
    (a, b) => b.totalVotes - a.totalVotes
  );

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
                ELECTION ANALYTICS
              </span>

              <h1 className={styles.title}>
                Vote Statistics
              </h1>

              <p className={styles.subtitle}>
                Review recorded vote totals and distribution.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.refresh}
            onClick={() =>
              dispatch(fetchVoteStats())
            }
          >
            <RefreshCw
              size={14}
              className={
                loading ? styles.refreshing : ''
              }
            />

            <span>Refresh</span>
          </button>
        </header>

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <strong>Loading statistics</strong>
            <span>Preparing election data...</span>
          </div>
        ) : (
          <>
            {/* SUMMARY */}

            <section className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <Vote size={18} />
                </div>

                <div>
                  <span className={styles.summaryLabel}>
                    Total Votes Cast
                  </span>

                  <strong className={styles.summaryNum}>
                    {formatVoteCount(totalVotes)}
                  </strong>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <UsersRound size={18} />
                </div>

                <div>
                  <span className={styles.summaryLabel}>
                    Parties
                  </span>

                  <strong className={styles.summaryNum}>
                    {partyStats.length}
                  </strong>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div
                  className={`${styles.summaryIcon} ${
                    voteStats?.isChainValid
                      ? styles.validIcon
                      : styles.alertIcon
                  }`}
                >
                  {voteStats?.isChainValid ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <Database size={18} />
                  )}
                </div>

                <div>
                  <span className={styles.summaryLabel}>
                    Blockchain Status
                  </span>

                  <strong
                    className={`${styles.statusText} ${
                      voteStats?.isChainValid
                        ? styles.validText
                        : styles.invalidText
                    }`}
                  >
                    {voteStats?.isChainValid
                      ? 'Valid'
                      : 'Alert'}
                  </strong>
                </div>
              </div>
            </section>

            {/* BAR CHART */}

            {barData.length > 0 ? (
              <section className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <span className={styles.sectionLabel}>
                      COMPARISON
                    </span>

                    <h2>MNA & MPA Votes</h2>

                    <p>
                      Recorded votes grouped by party.
                    </p>
                  </div>

                  <div className={styles.chartIcon}>
                    <BarChart3 size={18} />
                  </div>
                </div>

                <div className={styles.chartArea}>
                  <ResponsiveContainer
                    width="100%"
                    height={310}
                  >
                    <BarChart
                      data={barData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="rgba(16, 74, 40, 0.08)"
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#73847a',
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#8a9990',
                          fontSize: 9,
                        }}
                      />

                      <Tooltip
                        cursor={{
                          fill:
                            'rgba(21,148,71,0.035)',
                        }}
                        contentStyle={{
                          background:
                            'rgba(255,255,255,.94)',
                          border:
                            '1px solid rgba(21,148,71,.12)',
                          borderRadius: 10,
                          boxShadow:
                            '0 10px 30px rgba(20,80,45,.08)',
                          fontSize: 11,
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: '10px',
                        }}
                      />

                      <Bar
                        dataKey="MNA"
                        fill="#159447"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={34}
                      />

                      <Bar
                        dataKey="MPA"
                        fill="#2f8fa3"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            ) : (
              <div className={styles.stateCard}>
                <div className={styles.emptyIcon}>
                  <BarChart3 size={22} />
                </div>

                <strong>No vote data yet</strong>

                <span>
                  Charts will appear once recorded vote
                  data is available.
                </span>
              </div>
            )}

            {/* DISTRIBUTION */}

            {pieData.length > 0 && (
              <section className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <span className={styles.sectionLabel}>
                      DISTRIBUTION
                    </span>

                    <h2>Overall Vote Share</h2>

                    <p>
                      Distribution of recorded votes by party.
                    </p>
                  </div>
                </div>

                <div className={styles.pieRow}>
                  <div className={styles.pieChart}>
                    <ResponsiveContainer
                      width="100%"
                      height={280}
                    >
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="rgba(255,255,255,.9)"
                          strokeWidth={2}
                        >
                          {pieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                COLORS[
                                  index % COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            formatVoteCount(value)
                          }
                          contentStyle={{
                            background:
                              'rgba(255,255,255,.94)',
                            border:
                              '1px solid rgba(21,148,71,.12)',
                            borderRadius: 10,
                            fontSize: 11,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className={styles.pieCenter}>
                      <strong>
                        {formatVoteCount(totalVotes)}
                      </strong>

                      <span>Total Votes</span>
                    </div>
                  </div>

                  <div className={styles.legendTable}>
                    {sortedPartyStats.map(
                      (party, index) => (
                        <div
                          key={party._id}
                          className={styles.legendRow}
                        >
                          <div
                            className={styles.colorDot}
                            style={{
                              background:
                                COLORS[
                                  index %
                                    COLORS.length
                                ],
                            }}
                          />

                          <span
                            className={
                              styles.partyAbbr
                            }
                          >
                            {party.abbreviation ||
                              party.name}
                          </span>

                          <span
                            className={
                              styles.partyVotes
                            }
                          >
                            {formatVoteCount(
                              party.totalVotes
                            )}
                          </span>

                          <strong
                            className={
                              styles.partyPct
                            }
                          >
                            {totalVotes
                              ? `${(
                                  (party.totalVotes /
                                    totalVotes) *
                                  100
                                ).toFixed(1)}%`
                              : '0%'}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* BREAKDOWN */}

            {partyStats.length > 0 && (
              <section className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <span className={styles.sectionLabel}>
                      DATA
                    </span>

                    <h2>Detailed Breakdown</h2>

                    <p>
                      Vote totals returned for each party.
                    </p>
                  </div>
                </div>

                <div className={styles.tableScroll}>
                  <div className={styles.breakdownTable}>
                    <div
                      className={
                        styles.breakdownHeader
                      }
                    >
                      <span>Party</span>
                      <span>MNA</span>
                      <span>MPA</span>
                      <span>Total</span>
                      <span>Share</span>
                    </div>

                    {sortedPartyStats.map(
                      (party, index) => (
                        <div
                          key={party._id}
                          className={
                            styles.breakdownRow
                          }
                        >
                          <div
                            className={
                              styles.partyCell
                            }
                          >
                            <div
                              className={
                                styles.colorDot
                              }
                              style={{
                                background:
                                  COLORS[
                                    index %
                                      COLORS.length
                                  ],
                              }}
                            />

                            <div>
                              <strong>
                                {party.name}
                              </strong>

                              {party.abbreviation && (
                                <span
                                  className={
                                    styles.smallAbbr
                                  }
                                >
                                  {
                                    party.abbreviation
                                  }
                                </span>
                              )}
                            </div>
                          </div>

                          <span>
                            {formatVoteCount(
                              party.mnaVotes
                            )}
                          </span>

                          <span>
                            {formatVoteCount(
                              party.mpaVotes
                            )}
                          </span>

                          <strong>
                            {formatVoteCount(
                              party.totalVotes
                            )}
                          </strong>

                          <span>
                            {totalVotes
                              ? `${(
                                  (party.totalVotes /
                                    totalVotes) *
                                  100
                                ).toFixed(1)}%`
                              : '0%'}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StatsGraph;
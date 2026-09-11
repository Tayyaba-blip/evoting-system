import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { fetchVoteStats } from '../../features/admin/adminSlice';
import { formatVoteCount } from '../../utils/formatters';
import styles from './StatsGraph.module.css';

const COLORS = ['#00c853', '#00acc1', '#ffab00', '#e53935', '#8e24aa', '#43a047', '#fb8c00', '#3949ab'];

const StatsGraph = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { voteStats, loading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchVoteStats()); }, [dispatch]);

  const partyStats = voteStats?.partyStats || [];
  const totalVotes = voteStats?.totalVotesCast || 0;

  const barData = partyStats.map((p) => ({
    name: p.abbreviation || p.name,
    MNA: p.mnaVotes,
    MPA: p.mpaVotes,
    Total: p.totalVotes,
  }));

  const pieData = partyStats.filter((p) => p.totalVotes > 0).map((p) => ({
    name: p.abbreviation || p.name,
    value: p.totalVotes,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>📊 Vote Statistics</h1>
        <button className={styles.refresh} onClick={() => dispatch(fetchVoteStats())}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading statistics...</div>
      ) : (
        <>
          {/* Summary Row */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryNum}>{formatVoteCount(totalVotes)}</span>
              <span>Total Votes Cast</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryNum}>{partyStats.length}</span>
              <span>Parties</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={`${styles.summaryNum} ${voteStats?.isChainValid ? styles.validNum : styles.invalidNum}`}>
                {voteStats?.isChainValid ? '✓ Valid' : '✗ Alert'}
              </span>
              <span>Blockchain Status</span>
            </div>
          </div>

          {/* Bar Chart — MNA vs MPA */}
          {barData.length > 0 ? (
            <div className={styles.chartCard}>
              <h3>MNA vs MPA Votes by Party</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 10 }} />
                  <Legend />
                  <Bar dataKey="MNA" fill="#00c853" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MPA" fill="#00acc1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.noData}>No votes cast yet. Charts will appear once voting begins.</div>
          )}

          {/* Pie Chart — Overall party share */}
          {pieData.length > 0 && (
            <div className={styles.chartCard}>
              <h3>Overall Vote Share</h3>
              <div className={styles.pieRow}>
                <ResponsiveContainer width="60%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatVoteCount(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend Table */}
                <div className={styles.legendTable}>
                  {[...partyStats].sort((a, b) => b.totalVotes - a.totalVotes).map((p, i) => (
                    <div key={p._id} className={styles.legendRow}>
                      <div className={styles.colorDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={styles.partyAbbr}>{p.abbreviation || p.name}</span>
                      <span className={styles.partyVotes}>{formatVoteCount(p.totalVotes)}</span>
                      <span className={styles.partyPct}>{totalVotes ? ((p.totalVotes / totalVotes) * 100).toFixed(1) + '%' : '0%'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Per-party breakdown table */}
          {partyStats.length > 0 && (
            <div className={styles.chartCard}>
              <h3>Detailed Breakdown</h3>
              <div className={styles.breakdownTable}>
                <div className={styles.breakdownHeader}>
                  <span>Party</span>
                  <span>MNA Votes</span>
                  <span>MPA Votes</span>
                  <span>Total</span>
                  <span>Share</span>
                </div>
                {[...partyStats].sort((a, b) => b.totalVotes - a.totalVotes).map((p, i) => (
                  <div key={p._id} className={styles.breakdownRow}>
                    <div className={styles.partyCell}>
                      <div className={styles.colorDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span>{p.name}</span>
                      <span className={styles.smallAbbr}>({p.abbreviation})</span>
                    </div>
                    <span>{formatVoteCount(p.mnaVotes)}</span>
                    <span>{formatVoteCount(p.mpaVotes)}</span>
                    <strong>{formatVoteCount(p.totalVotes)}</strong>
                    <span>{totalVotes ? ((p.totalVotes / totalVotes) * 100).toFixed(1) + '%' : '0%'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsGraph;
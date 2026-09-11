import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import { fetchCandidatesForVoter, setHasVotedMNA, setHasVotedMPA } from '../../features/voter/voterSlice';
import FaceCamera from '../../components/FaceCamera/FaceCamera';
import styles from './VotingPage.module.css';
import LivenessCheck from '../../components/LivenessCheck/LivenessCheck';

const VotingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, mnaCandidates, mpaCandidates } = useSelector((s) => s.voter);
  const [faceVerified, setFaceVerified] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [faceWarning, setFaceWarning] = useState(false);
  const countdownRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('MNA');
  const [mnaSubmitted, setMnaSubmitted] = useState(profile?.hasVotedMNA || false);
  const [mpaSubmitted, setMpaSubmitted] = useState(profile?.hasVotedMPA || false);

  useEffect(() => {
    dispatch(fetchCandidatesForVoter('MNA'));
    dispatch(fetchCandidatesForVoter('MPA'));
  }, [dispatch]);

  // Face verification guard
  const handleFaceMatch = useCallback((matched) => {
    setFaceVerified(matched);
    setFaceWarning(!matched);
    if (!matched) {
      if (!countdownRef.current) {
        setCountdown(10);
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
              navigate('/voter/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
      }
    }
  }, [navigate]);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  // MNA Form
  const mnaFormik = useFormik({
    initialValues: { candidateId: '' },
    validationSchema: Yup.object({ candidateId: Yup.string().required('Please select an MNA candidate') }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!faceVerified) return toast.error('Face verification required to vote');
      try {
        const { data } = await axiosInstance.post('/vote/cast', { candidateId: values.candidateId, electionType: 'MNA' });
        toast.success(`✅ MNA Vote cast! Block: ${data.blockHash?.slice(0, 12)}...`);
        dispatch(setHasVotedMNA());
        setMnaSubmitted(true);
        setActiveTab('MPA');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cast MNA vote');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // MPA Form
  const mpaFormik = useFormik({
    initialValues: { candidateId: '' },
    validationSchema: Yup.object({ candidateId: Yup.string().required('Please select an MPA candidate') }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!faceVerified) return toast.error('Face verification required to vote');
      try {
        const { data } = await axiosInstance.post('/vote/cast', { candidateId: values.candidateId, electionType: 'MPA' });
        toast.success(`✅ MPA Vote cast! Block: ${data.blockHash?.slice(0, 12)}...`);
        dispatch(setHasVotedMPA());
        setMpaSubmitted(true);

        if (mnaSubmitted) {
          setTimeout(() => navigate('/voter/dashboard'), 2000);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cast MPA vote');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const CandidateCard = ({ candidate, selected, onSelect, disabled }) => (
    <div
      className={`${styles.candidateCard} ${selected ? styles.selected : ''} ${disabled ? styles.disabledCard : ''}`}
      onClick={() => !disabled && onSelect(candidate._id)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && onSelect(candidate._id)}
    >
      <div className={styles.candidateTop}>
        <div className={styles.candidateAvatar}>
          {candidate.photo ? (
            <img src={`http://localhost:5000${candidate.photo}`} alt={candidate.name} />
          ) : <span>👤</span>}
        </div>
        <div className={styles.candidateInfo}>
          <h4>{candidate.name}</h4>
          <p>{candidate.party?.name || 'Independent'}</p>
          {candidate.party?.abbreviation && <span className={styles.partyTag}>{candidate.party.abbreviation}</span>}
        </div>
        {candidate.symbol && (
          <img src={`http://localhost:5000${candidate.symbol}`} alt="Symbol" className={styles.symbol} />
        )}
      </div>
      <div className={styles.candidateBottom}>
        <span>📍 {candidate.constituency || '—'}</span>
        {selected && <span className={styles.selectedMark}>✅ Selected</span>}
      </div>
    </div>
  );

  const allVoted = mnaSubmitted && mpaSubmitted;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/voter/dashboard')}>← Back to Dashboard</button>
        <h1 className={styles.title}>🗳️ Cast Your Vote</h1>
      </div>

      {/* Face Verification Warning */}
      {faceWarning && countdown !== null && (
        <div className={styles.faceAlert}>
          ⚠️ Face not recognized! Returning to dashboard in <strong>{countdown}s</strong>. Please face the camera clearly.
        </div>
      )}

      {/* All voted success */}
      {allVoted ? (
        <div className={styles.successPage}>
          <span>🎉</span>
          <h2>Your votes have been recorded!</h2>
          <p>Both MNA and MPA votes have been securely stored on the blockchain.</p>
          <p className={styles.blockNote}>Your votes are anonymous and tamper-proof.</p>
          <button className={styles.goHome} onClick={() => navigate('/voter/dashboard')}>← Go to Dashboard</button>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Camera Panel */}
          <div className={styles.cameraPanel}>
            <div className={styles.cameraCard}>
              <h3>🎥 Face Verification</h3>
              <p>Your face must be verified continuously while voting. Leaving the camera view will stop the voting process.</p>
              {!livenessPassed ? ( <LivenessCheck onPassed={() => setLivenessPassed(true)} />) : (
                <FaceCamera storedDescriptor={profile?.faceDescriptor} onMatch={handleFaceMatch} onNoFace={() => handleFaceMatch(false)} compact={true} />
              )}
              <div className={`${styles.faceStatus} ${faceVerified ? styles.faceOk : styles.faceFail}`}>
                {faceVerified ? '✅ Face Verified — Safe to Vote' : '⚠️ Face Not Verified — Please face the camera'}
              </div>
            </div>

            {/* Voting Progress */}
            <div className={styles.progressCard}>
              <h3>Voting Progress</h3>
              <div className={styles.progressItem}>
                <div className={`${styles.progressDot} ${mnaSubmitted ? styles.doneDot : styles.pendingDot}`} />
                <span className={mnaSubmitted ? styles.doneText : ''}>MNA Vote {mnaSubmitted ? '✅ Cast' : '⭕ Pending'}</span>
              </div>
              <div className={styles.progressItem}>
                <div className={`${styles.progressDot} ${mpaSubmitted ? styles.doneDot : styles.pendingDot}`} />
                <span className={mpaSubmitted ? styles.doneText : ''}>MPA Vote {mpaSubmitted ? '✅ Cast' : '⭕ Pending'}</span>
              </div>
              <p className={styles.tehsilNote}>
                📍 Showing candidates from: <strong>{profile?.tehsil}</strong>
              </p>
            </div>
          </div>

          {/* Voting Forms */}
          <div className={styles.formsPanel}>
            {/* Tab Switcher */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'MNA' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('MNA')}
                disabled={mnaSubmitted}
              >
                {mnaSubmitted ? '✅' : '🏛️'} MNA Vote {mnaSubmitted && '(Done)'}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'MPA' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('MPA')}
                disabled={mpaSubmitted}
              >
                {mpaSubmitted ? '✅' : '🏛️'} MPA Vote {mpaSubmitted && '(Done)'}
              </button>
            </div>

            {/* MNA Form */}
            {activeTab === 'MNA' && (
              <form onSubmit={mnaFormik.handleSubmit} className={styles.voteForm}>
                <div className={styles.formHeader}>
                  <h2>National Assembly (MNA)</h2>
                  <p>Select one candidate for Member of National Assembly</p>
                </div>

                {mnaSubmitted ? (
                  <div className={styles.alreadyVoted}>✅ You have already cast your MNA vote.</div>
                ) : mnaCandidates.length === 0 ? (
                  <div className={styles.noCandidates}>
                    <span>🔍</span>
                    <p>No MNA candidates found for your tehsil ({profile?.tehsil})</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.candidatesGrid}>
                      {mnaCandidates.map((c) => (
                        <CandidateCard
                          key={c._id}
                          candidate={c}
                          selected={mnaFormik.values.candidateId === c._id}
                          onSelect={(id) => mnaFormik.setFieldValue('candidateId', id)}
                          disabled={!faceVerified || mnaSubmitted}
                        />
                      ))}
                    </div>
                    {mnaFormik.touched.candidateId && mnaFormik.errors.candidateId && (
                      <span className={styles.error}>{mnaFormik.errors.candidateId}</span>
                    )}
                    <button
                      type="submit"
                      className={styles.castBtn}
                      disabled={mnaFormik.isSubmitting || !faceVerified || !livenessPassed || !mnaFormik.values.candidateId}
                    >
                      {mnaFormik.isSubmitting ? '⏳ Casting Vote...' : '🗳️ Cast MNA Vote'}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* MPA Form */}
            {activeTab === 'MPA' && (
              <form onSubmit={mpaFormik.handleSubmit} className={styles.voteForm}>
                <div className={styles.formHeader}>
                  <h2>Provincial Assembly (MPA)</h2>
                  <p>Select one candidate for Member of Provincial Assembly</p>
                </div>

                {mpaSubmitted ? (
                  <div className={styles.alreadyVoted}>✅ You have already cast your MPA vote.</div>
                ) : mpaCandidates.length === 0 ? (
                  <div className={styles.noCandidates}>
                    <span>🔍</span>
                    <p>No MPA candidates found for your tehsil ({profile?.tehsil})</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.candidatesGrid}>
                      {mpaCandidates.map((c) => (
                        <CandidateCard
                          key={c._id}
                          candidate={c}
                          selected={mpaFormik.values.candidateId === c._id}
                          onSelect={(id) => mpaFormik.setFieldValue('candidateId', id)}
                          disabled={!faceVerified || mpaSubmitted}
                        />
                      ))}
                    </div>
                    {mpaFormik.touched.candidateId && mpaFormik.errors.candidateId && (
                      <span className={styles.error}>{mpaFormik.errors.candidateId}</span>
                    )}
                    <button
                      type="submit"
                      className={styles.castBtn}
                      disabled={mpaFormik.isSubmitting || !faceVerified || !livenessPassed || !mpaFormik.values.candidateId}
                    >
                      {mpaFormik.isSubmitting ? '⏳ Casting Vote...' : '🗳️ Cast MPA Vote'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Landmark,
  LockKeyhole,
  MapPin,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Vote,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';

import {
  fetchCandidatesForVoter,
  setHasVotedMNA,
  setHasVotedMPA,
} from '../../features/voter/voterSlice';

import FaceCamera from '../../components/FaceCamera/FaceCamera';
import LivenessCheck from '../../components/LivenessCheck/LivenessCheck';
import { getImageUrl } from '../../utils/imageUrl';
import styles from './VotingPage.module.css';

const VotingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    profile,
    mnaCandidates,
    mpaCandidates,
  } = useSelector((s) => s.voter);

  const [faceVerified, setFaceVerified] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [faceWarning, setFaceWarning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeTab, setActiveTab] = useState('MNA');

  const [mnaSubmitted, setMnaSubmitted] = useState(
    profile?.hasVotedMNA || false
  );

  const [mpaSubmitted, setMpaSubmitted] = useState(
    profile?.hasVotedMPA || false
  );

  const countdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCandidatesForVoter('MNA'));
    dispatch(fetchCandidatesForVoter('MPA'));
  }, [dispatch]);

  const handleFaceMatch = useCallback(
    (matched) => {
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
      } else if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
      }
    },
    [navigate]
  );

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const mnaFormik = useFormik({
    initialValues: {
      candidateId: '',
    },

    validationSchema: Yup.object({
      candidateId: Yup.string().required(
        'Please select an MNA candidate'
      ),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      if (!faceVerified) {
        return toast.error(
          'Face verification required to vote'
        );
      }

      try {
        const { data } = await axiosInstance.post(
          '/vote/cast',
          {
            candidateId: values.candidateId,
            electionType: 'MNA',
          }
        );

        toast.success(
          `MNA vote cast! Block: ${data.blockHash?.slice(
            0,
            12
          )}...`
        );

        dispatch(setHasVotedMNA());
        setMnaSubmitted(true);
        setActiveTab('MPA');
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to cast MNA vote'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const mpaFormik = useFormik({
    initialValues: {
      candidateId: '',
    },

    validationSchema: Yup.object({
      candidateId: Yup.string().required(
        'Please select an MPA candidate'
      ),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      if (!faceVerified) {
        return toast.error(
          'Face verification required to vote'
        );
      }

      try {
        const { data } = await axiosInstance.post(
          '/vote/cast',
          {
            candidateId: values.candidateId,
            electionType: 'MPA',
          }
        );

        toast.success(
          `MPA vote cast! Block: ${data.blockHash?.slice(
            0,
            12
          )}...`
        );

        dispatch(setHasVotedMPA());
        setMpaSubmitted(true);

        if (mnaSubmitted) {
          setTimeout(
            () => navigate('/voter/dashboard'),
            2000
          );
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to cast MPA vote'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const CandidateCard = ({
    candidate,
    selected,
    onSelect,
    disabled,
  }) => (
    <div
      className={`${styles.candidateCard} ${
        selected ? styles.selected : ''
      } ${disabled ? styles.disabledCard : ''}`}
      onClick={() => !disabled && onSelect(candidate._id)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (
          (e.key === 'Enter' || e.key === ' ') &&
          !disabled
        ) {
          e.preventDefault();
          onSelect(candidate._id);
        }
      }}
    >
      <div className={styles.candidateSelection}>
        {selected ? (
          <Check size={14} />
        ) : (
          <span />
        )}
      </div>

      <div className={styles.candidateTop}>
        <div className={styles.candidateAvatar}>
          {candidate.photo ? (
            <img
              src={getImageUrl(candidate.photo)}
              alt={candidate.name}
            />
          ) : (
            <UserRound size={22} />
          )}
        </div>

        <div className={styles.candidateInfo}>
          <h4>{candidate.name}</h4>

          <p>
            {candidate.party?.name || 'Independent'}
          </p>

          {candidate.party?.abbreviation && (
            <span className={styles.partyTag}>
              {candidate.party.abbreviation}
            </span>
          )}
        </div>

        {candidate.symbol && (
          <div className={styles.symbolWrap}>
            <img
              src={getImageUrl(candidate.symbol)}
              alt={`${candidate.name} symbol`}
              className={styles.symbol}
            />
          </div>
        )}
      </div>

      <div className={styles.candidateBottom}>
        <span>
          <MapPin size={13} />
          {candidate.constituency || 'Constituency unavailable'}
        </span>

        {selected && (
          <span className={styles.selectedMark}>
            <CheckCircle2 size={13} />
            Selected
          </span>
        )}
      </div>
    </div>
  );

  const allVoted = mnaSubmitted && mpaSubmitted;

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />

      <main className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.back}
              onClick={() =>
                navigate('/voter/dashboard')
              }
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <span className={styles.eyebrow}>
                SECURE ELECTION PORTAL
              </span>

              <h1 className={styles.title}>
                Cast Your Vote
              </h1>

              <p>
                Select your preferred candidate for each
                assembly.
              </p>
            </div>
          </div>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} />
            Encrypted voting session
          </div>
        </header>

        {faceWarning && countdown !== null && (
          <div className={styles.faceAlert}>
            <div className={styles.alertIcon}>
              <ShieldAlert size={19} />
            </div>

            <div>
              <strong>Identity verification interrupted</strong>
              <span>
                Please face the camera clearly. Returning to
                dashboard in {countdown}s.
              </span>
            </div>

            <span className={styles.alertCountdown}>
              {countdown}
            </span>
          </div>
        )}

        {allVoted ? (
          <section className={styles.successPage}>
            <div className={styles.successGlow} />

            <div className={styles.successIcon}>
              <CheckCircle2 size={38} />
            </div>

            <span className={styles.successEyebrow}>
              VOTING COMPLETE
            </span>

            <h2>Your votes have been recorded</h2>

            <p>
              Both your National Assembly and Provincial
              Assembly votes have been securely submitted.
            </p>

            <div className={styles.blockNote}>
              <ShieldCheck size={16} />

              <div>
                <strong>Blockchain secured</strong>
                <span>
                  Your votes are stored securely and remain
                  anonymous.
                </span>
              </div>
            </div>

            <button
              type="button"
              className={styles.goHome}
              onClick={() =>
                navigate('/voter/dashboard')
              }
            >
              Return to Dashboard
              <ArrowRight size={17} />
            </button>
          </section>
        ) : (
          <div className={styles.layout}>
            {/* SECURITY COLUMN */}
            <aside className={styles.cameraPanel}>
              <section className={styles.cameraCard}>
                <div className={styles.securityHeader}>
                  <div className={styles.securityIcon}>
                    <ScanFace size={20} />
                  </div>

                  <div>
                    <span>IDENTITY SECURITY</span>
                    <h3>Face Verification</h3>
                  </div>
                </div>

                <p className={styles.cameraDescription}>
                  Your identity must remain verified while
                  voting. Leaving the camera view pauses your
                  voting session.
                </p>

                <div className={styles.cameraFrame}>
                  {!livenessPassed ? (
                    <LivenessCheck
                      onPassed={() =>
                        setLivenessPassed(true)
                      }
                    />
                  ) : (
                    <FaceCamera
                      storedDescriptor={
                        profile?.faceDescriptor
                      }
                      onMatch={handleFaceMatch}
                      onNoFace={() =>
                        handleFaceMatch(false)
                      }
                      compact={true}
                    />
                  )}
                </div>

                <div
                  className={`${styles.faceStatus} ${
                    faceVerified
                      ? styles.faceOk
                      : styles.faceFail
                  }`}
                >
                  <div className={styles.statusIcon}>
                    {faceVerified ? (
                      <ShieldCheck size={17} />
                    ) : (
                      <ScanFace size={17} />
                    )}
                  </div>

                  <div>
                    <strong>
                      {faceVerified
                        ? 'Identity verified'
                        : livenessPassed
                        ? 'Verification required'
                        : 'Liveness check required'}
                    </strong>

                    <span>
                      {faceVerified
                        ? 'You can securely select and submit your vote.'
                        : livenessPassed
                        ? 'Please face the camera clearly.'
                        : 'Complete the security check to continue.'}
                    </span>
                  </div>
                </div>
              </section>

              <section className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <div>
                    <span>YOUR PROGRESS</span>
                    <h3>Voting Progress</h3>
                  </div>

                  <Vote size={18} />
                </div>

                <div className={styles.progressLine}>
                  <div
                    className={`${styles.progressItem} ${
                      mnaSubmitted
                        ? styles.progressDone
                        : ''
                    }`}
                  >
                    <div className={styles.progressDot}>
                      {mnaSubmitted ? (
                        <Check size={12} />
                      ) : (
                        <span>1</span>
                      )}
                    </div>

                    <div>
                      <strong>National Assembly</strong>
                      <span>
                        {mnaSubmitted
                          ? 'Vote successfully cast'
                          : 'Awaiting your selection'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`${styles.progressConnector} ${
                      mnaSubmitted
                        ? styles.connectorDone
                        : ''
                    }`}
                  />

                  <div
                    className={`${styles.progressItem} ${
                      mpaSubmitted
                        ? styles.progressDone
                        : ''
                    }`}
                  >
                    <div className={styles.progressDot}>
                      {mpaSubmitted ? (
                        <Check size={12} />
                      ) : (
                        <span>2</span>
                      )}
                    </div>

                    <div>
                      <strong>Provincial Assembly</strong>
                      <span>
                        {mpaSubmitted
                          ? 'Vote successfully cast'
                          : 'Awaiting your selection'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.tehsilNote}>
                  <MapPin size={15} />

                  <div>
                    <span>Candidate area</span>
                    <strong>
                      {profile?.tehsil ||
                        'Tehsil unavailable'}
                    </strong>
                  </div>
                </div>
              </section>

              <div className={styles.securityNote}>
                <LockKeyhole size={17} />

                <div>
                  <strong>Secure voting</strong>
                  <span>
                    Your identity verification protects the
                    integrity of your voting session.
                  </span>
                </div>
              </div>
            </aside>

            {/* VOTING */}
            <section className={styles.formsPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.eyebrow}>
                    BALLOT
                  </span>
                  <h2>Select Your Candidate</h2>
                  <p>
                    Select one candidate for each assembly.
                  </p>
                </div>

                <div className={styles.ballotIcon}>
                  <Vote size={22} />
                </div>
              </div>

              <div className={styles.tabs}>
                <button
                  type="button"
                  className={`${styles.tab} ${
                    activeTab === 'MNA'
                      ? styles.activeTab
                      : ''
                  }`}
                  onClick={() => setActiveTab('MNA')}
                  disabled={mnaSubmitted}
                >
                  <div className={styles.tabIcon}>
                    {mnaSubmitted ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <Landmark size={17} />
                    )}
                  </div>

                  <div>
                    <strong>National Assembly</strong>
                    <span>
                      {mnaSubmitted
                        ? 'Vote submitted'
                        : 'MNA Ballot'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`${styles.tab} ${
                    activeTab === 'MPA'
                      ? styles.activeTab
                      : ''
                  }`}
                  onClick={() => setActiveTab('MPA')}
                  disabled={mpaSubmitted}
                >
                  <div className={styles.tabIcon}>
                    {mpaSubmitted ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <Landmark size={17} />
                    )}
                  </div>

                  <div>
                    <strong>Provincial Assembly</strong>
                    <span>
                      {mpaSubmitted
                        ? 'Vote submitted'
                        : 'MPA Ballot'}
                    </span>
                  </div>
                </button>
              </div>

              {activeTab === 'MNA' && (
                <form
                  onSubmit={mnaFormik.handleSubmit}
                  className={styles.voteForm}
                >
                  <div className={styles.formHeader}>
                    <div>
                      <span className={styles.ballotNumber}>
                        BALLOT 01
                      </span>

                      <h2>
                        Member of National Assembly
                      </h2>

                      <p>
                        Select exactly one candidate below.
                      </p>
                    </div>

                    <Landmark size={22} />
                  </div>

                  {mnaSubmitted ? (
                    <div className={styles.alreadyVoted}>
                      <CheckCircle2 size={21} />

                      <div>
                        <strong>MNA vote submitted</strong>
                        <span>
                          Your National Assembly vote has
                          already been recorded.
                        </span>
                      </div>
                    </div>
                  ) : mnaCandidates.length === 0 ? (
                    <div className={styles.noCandidates}>
                      <UserRound size={26} />
                      <strong>
                        No candidates available
                      </strong>
                      <p>
                        No MNA candidates were found for{' '}
                        {profile?.tehsil || 'your area'}.
                      </p>
                    </div>
                  ) : (
                    <>
                      {!faceVerified && (
                        <div className={styles.lockedNotice}>
                          <LockKeyhole size={15} />
                          Verify your identity to enable
                          candidate selection.
                        </div>
                      )}

                      <div className={styles.candidatesGrid}>
                        {mnaCandidates.map((candidate) => (
                          <CandidateCard
                            key={candidate._id}
                            candidate={candidate}
                            selected={
                              mnaFormik.values
                                .candidateId ===
                              candidate._id
                            }
                            onSelect={(id) =>
                              mnaFormik.setFieldValue(
                                'candidateId',
                                id
                              )
                            }
                            disabled={
                              !faceVerified ||
                              mnaSubmitted
                            }
                          />
                        ))}
                      </div>

                      {mnaFormik.touched.candidateId &&
                        mnaFormik.errors.candidateId && (
                          <span className={styles.error}>
                            {
                              mnaFormik.errors
                                .candidateId
                            }
                          </span>
                        )}

                      <div className={styles.submitArea}>
                        <div className={styles.submitSecurity}>
                          <ShieldCheck size={15} />
                          Your selection is submitted
                          securely.
                        </div>

                        <button
                          type="submit"
                          className={styles.castBtn}
                          disabled={
                            mnaFormik.isSubmitting ||
                            !faceVerified ||
                            !livenessPassed ||
                            !mnaFormik.values.candidateId
                          }
                        >
                          <Vote size={17} />

                          {mnaFormik.isSubmitting
                            ? 'Casting Vote...'
                            : 'Cast MNA Vote'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {activeTab === 'MPA' && (
                <form
                  onSubmit={mpaFormik.handleSubmit}
                  className={styles.voteForm}
                >
                  <div className={styles.formHeader}>
                    <div>
                      <span className={styles.ballotNumber}>
                        BALLOT 02
                      </span>

                      <h2>
                        Member of Provincial Assembly
                      </h2>

                      <p>
                        Select exactly one candidate below.
                      </p>
                    </div>

                    <Landmark size={22} />
                  </div>

                  {mpaSubmitted ? (
                    <div className={styles.alreadyVoted}>
                      <CheckCircle2 size={21} />

                      <div>
                        <strong>MPA vote submitted</strong>
                        <span>
                          Your Provincial Assembly vote has
                          already been recorded.
                        </span>
                      </div>
                    </div>
                  ) : mpaCandidates.length === 0 ? (
                    <div className={styles.noCandidates}>
                      <UserRound size={26} />
                      <strong>
                        No candidates available
                      </strong>
                      <p>
                        No MPA candidates were found for{' '}
                        {profile?.tehsil || 'your area'}.
                      </p>
                    </div>
                  ) : (
                    <>
                      {!faceVerified && (
                        <div className={styles.lockedNotice}>
                          <LockKeyhole size={15} />
                          Verify your identity to enable
                          candidate selection.
                        </div>
                      )}

                      <div className={styles.candidatesGrid}>
                        {mpaCandidates.map((candidate) => (
                          <CandidateCard
                            key={candidate._id}
                            candidate={candidate}
                            selected={
                              mpaFormik.values
                                .candidateId ===
                              candidate._id
                            }
                            onSelect={(id) =>
                              mpaFormik.setFieldValue(
                                'candidateId',
                                id
                              )
                            }
                            disabled={
                              !faceVerified ||
                              mpaSubmitted
                            }
                          />
                        ))}
                      </div>

                      {mpaFormik.touched.candidateId &&
                        mpaFormik.errors.candidateId && (
                          <span className={styles.error}>
                            {
                              mpaFormik.errors
                                .candidateId
                            }
                          </span>
                        )}

                      <div className={styles.submitArea}>
                        <div className={styles.submitSecurity}>
                          <ShieldCheck size={15} />
                          Your selection is submitted
                          securely.
                        </div>

                        <button
                          type="submit"
                          className={styles.castBtn}
                          disabled={
                            mpaFormik.isSubmitting ||
                            !faceVerified ||
                            !livenessPassed ||
                            !mpaFormik.values.candidateId
                          }
                        >
                          <Vote size={17} />

                          {mpaFormik.isSubmitting
                            ? 'Casting Vote...'
                            : 'Cast MPA Vote'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingPage;
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock3,
  LockKeyhole,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import {
  fetchSchedules,
  addScheduleLocal,
  updateScheduleLocal,
  removeScheduleLocal,
} from '../../features/admin/adminSlice';

import { formatDateTime } from '../../utils/formatters';
import styles from './VotingSchedule.module.css';

const VotingSchedule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { schedules, loading } = useSelector(
    (state) => state.admin
  );

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      title: '',
      startTime: '',
      endTime: '',
      description: '',
      electionType: 'Both',
    },

    validationSchema: Yup.object({
      title: Yup.string().required('Title required'),

      startTime: Yup.string().required(
        'Start time required'
      ),

      endTime: Yup.string().required(
        'End time required'
      ),

      electionType: Yup.string().oneOf([
        'MNA',
        'MPA',
        'Both',
      ]),
    }),

    onSubmit: async (
      values,
      { setSubmitting, resetForm }
    ) => {
      try {
        const { data } = await axiosInstance.post(
          '/schedule',
          values
        );

        dispatch(addScheduleLocal(data.schedule));

        toast.success(
          'Voting schedule created! All voters and candidates notified.'
        );

        resetForm();
        setShowForm(false);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to create schedule'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEnd = async (id, title) => {
    if (
      !window.confirm(
        `End voting for "${title}"? This will finalize results.`
      )
    ) {
      return;
    }

    try {
      const { data } = await axiosInstance.patch(
        `/schedule/${id}/end`
      );

      dispatch(updateScheduleLocal(data.schedule));

      toast.success(
        'Voting ended. Results finalized.'
      );
    } catch (err) {
      toast.error('Failed to end schedule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/schedule/${id}`);

      dispatch(removeScheduleLocal(id));

      toast.success('Schedule deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getStatus = (schedule) => {
    if (schedule.isEnded) {
      return {
        label: 'Ended',
        cls: styles.ended,
      };
    }

    const now = new Date();

    if (
      new Date(schedule.startTime) <= now &&
      new Date(schedule.endTime) >= now
    ) {
      return {
        label: 'Live',
        cls: styles.live,
      };
    }

    if (new Date(schedule.startTime) > now) {
      return {
        label: 'Upcoming',
        cls: styles.upcoming,
      };
    }

    return {
      label: 'Closed',
      cls: styles.closed,
    };
  };

  const liveCount = schedules.filter(
    (schedule) => getStatus(schedule).label === 'Live'
  ).length;

  const upcomingCount = schedules.filter(
    (schedule) =>
      getStatus(schedule).label === 'Upcoming'
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
                ELECTION MANAGEMENT
              </span>

              <h1 className={styles.title}>
                Voting Schedule
              </h1>

              <p className={styles.subtitle}>
                Create and manage election voting periods.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.addBtn} ${
              showForm ? styles.cancelAdd : ''
            }`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <X size={15} />
                <span>Close</span>
              </>
            ) : (
              <>
                <Plus size={15} />
                <span>New Schedule</span>
              </>
            )}
          </button>
        </header>

        {/* SMALL OVERVIEW */}

        {!loading && schedules.length > 0 && (
          <div className={styles.overview}>
            <div className={styles.overviewItem}>
              <CalendarDays size={14} />

              <div>
                <span>Schedules</span>
                <strong>{schedules.length}</strong>
              </div>
            </div>

            <div className={styles.overviewDivider} />

            <div className={styles.overviewItem}>
              <span className={styles.liveDot} />

              <div>
                <span>Live</span>
                <strong>{liveCount}</strong>
              </div>
            </div>

            <div className={styles.overviewDivider} />

            <div className={styles.overviewItem}>
              <Clock3 size={14} />

              <div>
                <span>Upcoming</span>
                <strong>{upcomingCount}</strong>
              </div>
            </div>
          </div>
        )}

        {/* CREATE FORM */}

        {showForm && (
          <section className={styles.formCard}>
            <div className={styles.formHeading}>
              <div className={styles.formIcon}>
                <CalendarDays size={18} />
              </div>

              <div>
                <h2>Create schedule</h2>

                <p>
                  Set the voting period and election type.
                </p>
              </div>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className={styles.form}
            >
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>
                    Schedule Title <span>*</span>
                  </label>

                  <input
                    type="text"
                    {...formik.getFieldProps('title')}
                    placeholder="e.g. General Elections"
                  />

                  {formik.touched.title &&
                    formik.errors.title && (
                      <span className={styles.error}>
                        {formik.errors.title}
                      </span>
                    )}
                </div>

                <div className={styles.field}>
                  <label>Election Type</label>

                  <select
                    {...formik.getFieldProps(
                      'electionType'
                    )}
                  >
                    <option value="Both">
                      Both (MNA + MPA)
                    </option>

                    <option value="MNA">
                      MNA Only
                    </option>

                    <option value="MPA">
                      MPA Only
                    </option>
                  </select>
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>
                    Start Time <span>*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...formik.getFieldProps(
                      'startTime'
                    )}
                  />

                  {formik.touched.startTime &&
                    formik.errors.startTime && (
                      <span className={styles.error}>
                        {formik.errors.startTime}
                      </span>
                    )}
                </div>

                <div className={styles.field}>
                  <label>
                    End Time <span>*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...formik.getFieldProps(
                      'endTime'
                    )}
                  />

                  {formik.touched.endTime &&
                    formik.errors.endTime && (
                      <span className={styles.error}>
                        {formik.errors.endTime}
                      </span>
                    )}
                </div>
              </div>

              <div className={styles.field}>
                <label>Description</label>

                <textarea
                  {...formik.getFieldProps(
                    'description'
                  )}
                  rows={3}
                  placeholder="Optional schedule details..."
                />
              </div>

              <div className={styles.infoBox}>
                <Bell size={15} />

                <p>
                  Creating a schedule will notify all
                  voters and candidates immediately.
                </p>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span
                        className={styles.smallSpinner}
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SCHEDULES */}

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <strong>Loading schedules</strong>
            <span>Please wait a moment...</span>
          </div>
        ) : schedules.length === 0 ? (
          <div className={styles.stateCard}>
            <div className={styles.emptyIcon}>
              <CalendarDays size={23} />
            </div>

            <strong>No schedules created</strong>

            <span>
              Create a voting schedule to get started.
            </span>

            <button
              type="button"
              className={styles.emptyAction}
              onClick={() => setShowForm(true)}
            >
              <Plus size={13} />
              New Schedule
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {schedules.map((schedule) => {
              const status = getStatus(schedule);

              return (
                <article
                  key={schedule._id}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.cardTitleRow}>
                        <h3>{schedule.title}</h3>

                        <span
                          className={
                            styles.electionType
                          }
                        >
                          {schedule.electionType}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${status.cls}`}
                    >
                      <span
                        className={styles.statusDot}
                      />
                      {status.label}
                    </span>
                  </div>

                  <div className={styles.times}>
                    <div className={styles.timeItem}>
                      <div className={styles.timeIcon}>
                        <CalendarDays size={15} />
                      </div>

                      <div>
                        <span>Starts</span>

                        <strong>
                          {formatDateTime(
                            schedule.startTime
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.timeItem}>
                      <div className={styles.timeIcon}>
                        <Clock3 size={15} />
                      </div>

                      <div>
                        <span>Ends</span>

                        <strong>
                          {formatDateTime(
                            schedule.endTime
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {schedule.description && (
                    <p className={styles.desc}>
                      {schedule.description}
                    </p>
                  )}

                  <div className={styles.cardActions}>
                    {!schedule.isEnded &&
                      status.label === 'Live' && (
                        <button
                          type="button"
                          className={styles.endBtn}
                          onClick={() =>
                            handleEnd(
                              schedule._id,
                              schedule.title
                            )
                          }
                        >
                          <LockKeyhole size={13} />
                          End Voting
                        </button>
                      )}

                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() =>
                        handleDelete(schedule._id)
                      }
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingSchedule;
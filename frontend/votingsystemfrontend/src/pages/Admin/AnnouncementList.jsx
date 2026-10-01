import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import {
  ArrowLeft,
  Bell,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Megaphone,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';

import {
  fetchAnnouncements,
  updateAnnouncementLocal,
  removeAnnouncementLocal,
} from '../../features/admin/adminSlice';

import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/formatters';

import styles from './AnnouncementList.module.css';

const AnnouncementList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { announcements, loading } = useSelector(
    (state) => state.admin
  );

  const [processingId, setProcessingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  /* =======================================================
     LOAD ANNOUNCEMENTS
  ======================================================= */

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  /* =======================================================
     ACTIVATE / DEACTIVATE
  ======================================================= */

  const handleToggle = async (announcement) => {
  try {
    const { data } =
      await axiosInstance.patch(
        `/announcements/${announcement._id}/toggle`
      );

    dispatch(
      updateAnnouncementLocal(
        data.announcement
      )
    );

    toast.success(
      data.announcement.isActive
        ? 'Announcement activated'
        : 'Announcement deactivated'
    );
  } catch (err) {
    console.error(
      'TOGGLE ANNOUNCEMENT ERROR:',
      err.response?.data || err
    );

    toast.error(
      err.response?.data?.message ||
        'Failed to toggle announcement'
    );
  }
};

  /* =======================================================
     DELETE ANNOUNCEMENT
  ======================================================= */

  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    'Are you sure you want to permanently delete this announcement?'
  );

  if (!confirmed) return;

  try {
    const { data } =
      await axiosInstance.delete(
        `/announcements/${id}`
      );

    if (data?.success) {
      dispatch(
        removeAnnouncementLocal(id)
      );

      toast.success(
        'Announcement deleted successfully'
      );
    }
  } catch (err) {
    console.error(
      'DELETE ANNOUNCEMENT ERROR:',
      err.response?.data || err
    );

    toast.error(
      err.response?.data?.message ||
        'Failed to delete announcement'
    );
  }
};

  /* =======================================================
     DISPLAY LOCATION LABEL
  ======================================================= */

  const displayLabel = (locations) => {
    if (!locations) {
      return 'Not specified';
    }

    if (Array.isArray(locations)) {
      return locations
        .map((location) => {
          if (location === 'landing') {
            return 'Landing';
          }

          if (location === 'register') {
            return 'Register';
          }

          if (location === 'both') {
            return 'Landing & Register';
          }

          return location;
        })
        .join(', ');
    }

    if (locations === 'landing') {
      return 'Landing';
    }

    if (locations === 'register') {
      return 'Register';
    }

    if (locations === 'both') {
      return 'Landing & Register';
    }

    return locations;
  };

  const activeCount = announcements.filter(
    (announcement) =>
      announcement.isActive
  ).length;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className={styles.page}>
      <div
        className={styles.background}
        aria-hidden="true"
      >
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

            <div className={styles.heading}>
              <span className={styles.eyebrow}>
                COMMUNICATION
              </span>

              <h1 className={styles.title}>
                Announcements
              </h1>

              <p className={styles.subtitle}>
                Manage public notices across
                the platform.
              </p>
            </div>
          </div>

          <Link
            to="/admin/dashboard/announcements/add"
            className={styles.addBtn}
          >
            <Plus
              size={16}
              strokeWidth={2.5}
            />

            <span>Add Announcement</span>
          </Link>
        </header>

        {/* OVERVIEW */}

        {!loading &&
          announcements.length > 0 && (
            <section
              className={styles.overview}
            >
              <div
                className={
                  styles.overviewItem
                }
              >
                <Megaphone size={15} />

                <div>
                  <span>Total</span>

                  <strong>
                    {announcements.length}
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.overviewDivider
                }
              />

              <div
                className={
                  styles.overviewItem
                }
              >
                <CheckCircle2 size={15} />

                <div>
                  <span>Active</span>

                  <strong>
                    {activeCount}
                  </strong>
                </div>
              </div>
            </section>
          )}

        {/* CONTENT */}

        {loading ? (
          <div className={styles.stateCard}>
            <div
              className={styles.spinner}
            />

            <strong>
              Loading announcements
            </strong>

            <span>
              Please wait a moment...
            </span>
          </div>
        ) : announcements.length === 0 ? (
          <div className={styles.stateCard}>
            <div
              className={styles.emptyIcon}
            >
              <Bell size={24} />
            </div>

            <strong>
              No announcements yet
            </strong>

            <span>
              Create an announcement to
              display a public notice.
            </span>

            <Link
              to="/admin/dashboard/announcements/add"
              className={styles.emptyButton}
            >
              <Plus size={14} />

              Create Announcement
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {announcements.map(
              (announcement) => {
                const isToggling =
                  processingId ===
                  announcement._id;

                const isDeleting =
                  deletingId ===
                  announcement._id;

                return (
                  <article
                    key={announcement._id}
                    className={`${
                      styles.card
                    } ${
                      !announcement.isActive
                        ? styles.inactive
                        : ''
                    }`}
                  >
                    <div
                      className={
                        styles.statusLine
                      }
                    />

                    <div
                      className={
                        styles.cardContent
                      }
                    >
                      <div
                        className={
                          styles.cardTop
                        }
                      >
                        <div
                          className={
                            styles.announcementIcon
                          }
                        >
                          <Megaphone
                            size={17}
                          />
                        </div>

                        <div
                          className={
                            styles.cardHeading
                          }
                        >
                          <div
                            className={
                              styles.titleRow
                            }
                          >
                            <h3
                              className={
                                styles.annTitle
                              }
                            >
                              {
                                announcement.title
                              }
                            </h3>

                            <span
                              className={`${
                                styles.statusBadge
                              } ${
                                announcement.isActive
                                  ? styles.activeBadge
                                  : styles.inactiveBadge
                              }`}
                            >
                              <span
                                className={
                                  styles.statusDot
                                }
                              />

                              {announcement.isActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </div>

                          <p
                            className={
                              styles.annMessage
                            }
                          >
                            {
                              announcement.message
                            }
                          </p>
                        </div>
                      </div>

                      <div
                        className={
                          styles.cardBottom
                        }
                      >
                        <div
                          className={
                            styles.meta
                          }
                        >
                          <span
                            className={
                              styles.metaItem
                            }
                          >
                            <MapPin
                              size={12}
                            />

                            {displayLabel(
                              announcement.displayOn
                            )}
                          </span>

                          <span
                            className={
                              styles.metaItem
                            }
                          >
                            <CalendarClock
                              size={12}
                            />

                            {formatDateTime(
                              announcement.createdAt
                            )}
                          </span>
                        </div>

                        <div
                          className={
                            styles.actions
                          }
                        >
                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            className={
                              styles.toggleBtn
                            }
                            disabled={
                              isToggling ||
                              isDeleting
                            }
                            onClick={() =>
                              handleToggle(
                                announcement
                              )
                            }
                            title={
                              announcement.isActive
                                ? 'Deactivate announcement'
                                : 'Activate announcement'
                            }
                          >
                            <Power
                              size={14}
                            />

                            <span>
                              {isToggling
                                ? 'Updating...'
                                : announcement.isActive
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </span>
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className={
                              styles.deleteBtn
                            }
                            disabled={
                              isDeleting ||
                              isToggling
                            }
                            onClick={() =>
                              handleDelete(
                                announcement._id
                              )
                            }
                            title="Delete announcement"
                          >
                            <Trash2
                              size={14}
                            />

                            <span>
                              {isDeleting
                                ? 'Deleting...'
                                : 'Delete'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnouncementList;
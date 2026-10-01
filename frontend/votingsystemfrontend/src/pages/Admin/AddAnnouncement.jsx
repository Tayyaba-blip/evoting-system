import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import {
  ArrowLeft,
  Check,
  Eye,
  Globe2,
  Home,
  Megaphone,
  Plus,
  UserPlus,
} from 'lucide-react';

import axiosInstance from '../../api/axiosInstance';
import { addAnnouncementLocal } from '../../features/admin/adminSlice';
import styles from './AddAnnouncement.module.css';

const DISPLAY_OPTIONS = [
  {
    value: 'landing',
    label: 'Landing Page',
    description: 'Public homepage',
    icon: Home,
  },
  {
    value: 'register',
    label: 'Register Page',
    description: 'Voter registration',
    icon: UserPlus,
  },
  {
    value: 'both',
    label: 'Both Pages',
    description: 'Display everywhere',
    icon: Globe2,
  },
];

const AddAnnouncement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: '',
      message: '',
      displayOn: [],
    },

    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .max(150),

      message: Yup.string()
        .required('Message is required')
        .max(1000),

      displayOn: Yup.array().min(
        1,
        'Select at least one display location'
      ),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        // FIXED: admin route
        const { data } = await axiosInstance.post(
  '/announcements',
  values
);

        if (data?.announcement) {
          dispatch(
            addAnnouncementLocal(data.announcement)
          );
        }

        toast.success(
          'Announcement created and published!'
        );

        navigate(
          '/admin/dashboard/announcements'
        );
      } catch (err) {
        console.error(
          'CREATE ANNOUNCEMENT ERROR:',
          err
        );

        toast.error(
          err.response?.data?.message ||
            'Failed to create announcement'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleDisplay = (value) => {
    const current = formik.values.displayOn;

    if (value === 'both') {
      formik.setFieldValue(
        'displayOn',
        current.includes('both')
          ? []
          : ['both']
      );

      return;
    }

    const withoutBoth = current.filter(
      (item) => item !== 'both'
    );

    if (current.includes(value)) {
      formik.setFieldValue(
        'displayOn',
        withoutBoth.filter(
          (item) => item !== value
        )
      );
    } else {
      formik.setFieldValue(
        'displayOn',
        [...withoutBoth, value]
      );
    }
  };

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
        <header className={styles.header}>
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
              New Announcement
            </h1>

            <p className={styles.subtitle}>
              Publish a notice across the platform.
            </p>
          </div>
        </header>

        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Megaphone size={19} />
            </div>

            <div>
              <h2>Announcement details</h2>

              <p>
                Write your message and choose where it
                should appear.
              </p>
            </div>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className={styles.form}
          >
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="title">
                  Announcement Title
                  <span>*</span>
                </label>

                <small>
                  {formik.values.title.length}/150
                </small>
              </div>

              <input
                id="title"
                type="text"
                {...formik.getFieldProps('title')}
                placeholder="e.g. Voting begins on 20th January"
                className={
                  formik.touched.title &&
                  formik.errors.title
                    ? styles.inputError
                    : ''
                }
              />

              {formik.touched.title &&
                formik.errors.title && (
                  <span className={styles.error}>
                    {formik.errors.title}
                  </span>
                )}
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="message">
                  Message
                  <span>*</span>
                </label>

                <small>
                  {formik.values.message.length}/1000
                </small>
              </div>

              <textarea
                id="message"
                {...formik.getFieldProps('message')}
                placeholder="Write the announcement message..."
                rows={5}
                className={
                  formik.touched.message &&
                  formik.errors.message
                    ? styles.inputError
                    : ''
                }
              />

              {formik.touched.message &&
                formik.errors.message && (
                  <span className={styles.error}>
                    {formik.errors.message}
                  </span>
                )}
            </div>

            <div className={styles.field}>
              <label>
                Display Location
                <span>*</span>
              </label>

              <div className={styles.displayOptions}>
                {DISPLAY_OPTIONS.map((option) => {
                  const Icon = option.icon;

                  const selected =
                    formik.values.displayOn.includes(
                      option.value
                    );

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.optBtn} ${
                        selected
                          ? styles.selected
                          : ''
                      }`}
                      onClick={() =>
                        toggleDisplay(option.value)
                      }
                    >
                      <div
                        className={
                          styles.optionIcon
                        }
                      >
                        <Icon size={16} />
                      </div>

                      <div
                        className={
                          styles.optionText
                        }
                      >
                        <strong>
                          {option.label}
                        </strong>

                        <span>
                          {option.description}
                        </span>
                      </div>

                      <div
                        className={`${styles.selectionCheck} ${
                          selected
                            ? styles.checkSelected
                            : ''
                        }`}
                      >
                        {selected && (
                          <Check
                            size={11}
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {formik.touched.displayOn &&
                formik.errors.displayOn && (
                  <span className={styles.error}>
                    {formik.errors.displayOn}
                  </span>
                )}
            </div>

            {formik.values.title &&
              formik.values.message && (
                <div className={styles.preview}>
                  <div
                    className={
                      styles.previewHeader
                    }
                  >
                    <div>
                      <Eye size={14} />
                      <span>Preview</span>
                    </div>

                    <span
                      className={styles.liveBadge}
                    >
                      LIVE PREVIEW
                    </span>
                  </div>

                  <div
                    className={styles.previewCard}
                  >
                    <div
                      className={
                        styles.previewIcon
                      }
                    >
                      <Megaphone size={15} />
                    </div>

                    <div>
                      <strong>
                        {formik.values.title}
                      </strong>

                      <p>
                        {formik.values.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate(-1)}
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
                      className={styles.spinner}
                    />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Plus
                      size={15}
                      strokeWidth={2.5}
                    />
                    Publish Announcement
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default AddAnnouncement;
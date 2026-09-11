/**
 * formatters.js
 * Utility formatting helpers for the e-voting system.
 */

/**
 * Format a date string or Date to readable format.
 * @param {string|Date} date
 * @param {string} locale
 */
export const formatDate = (date, locale = 'en-PK') => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date + time.
 */
export const formatDateTime = (date, locale = 'en-PK') => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format Pakistan CNIC: XXXXX-XXXXXXX-X
 */
export const formatCnic = (cnic) => {
  if (!cnic) return '';
  const clean = cnic.replace(/\D/g, '');
  if (clean.length !== 13) return cnic;
  return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`;
};

/**
 * Mask CNIC for privacy: XXXXX-XXXX***-X
 */
export const maskCnic = (cnic) => {
  if (!cnic) return '';
  const formatted = formatCnic(cnic);
  return formatted.slice(0, 10) + '***' + formatted.slice(13);
};

/**
 * Format a full name from parts.
 */
export const formatFullName = (firstName, middleName, lastName) => {
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
};

/**
 * Format vote count with commas.
 */
export const formatVoteCount = (count) => {
  if (count === undefined || count === null) return '0';
  return Number(count).toLocaleString('en-PK');
};

/**
 * Format percentage.
 */
export const formatPercent = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

/**
 * Time remaining until a date.
 * @param {string|Date} targetDate
 * @returns {string}
 */
export const timeUntil = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Time since a date (e.g., "2 hours ago").
 */
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
    { label: 'second', secs: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.secs);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

/**
 * Truncate text with ellipsis.
 */
export const truncate = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word.
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

/**
 * Get initials from name.
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Province list for Pakistan.
 */
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'AJK',
];

/**
 * Election type labels.
 */
export const ELECTION_TYPES = {
  MNA: 'Member of National Assembly (MNA)',
  MPA: 'Member of Provincial Assembly (MPA)',
};
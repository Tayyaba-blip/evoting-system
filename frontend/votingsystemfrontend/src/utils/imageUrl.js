const API_ORIGIN = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, '')
  : 'http://localhost:5000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // Already a full URL, such as Cloudinary
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  ) {
    return imagePath;
  }

  // Make sure relative paths begin with /
  const normalizedPath = imagePath.startsWith('/')
    ? imagePath
    : `/${imagePath}`;

  return `${API_ORIGIN}${normalizedPath}`;
};
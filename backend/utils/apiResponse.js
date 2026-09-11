/**
 * apiResponse.js
 * Standardized API response helpers.
 */

const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFoundResponse = (res, entity = 'Resource') => {
  return res.status(404).json({ success: false, message: `${entity} not found.` });
};

const unauthorizedResponse = (res, message = 'Not authorized.') => {
  return res.status(401).json({ success: false, message });
};

const forbiddenResponse = (res, message = 'Access forbidden.') => {
  return res.status(403).json({ success: false, message });
};

const validationErrorResponse = (res, errors) => {
  return res.status(422).json({ success: false, message: 'Validation failed.', errors });
};

const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  paginatedResponse,
};
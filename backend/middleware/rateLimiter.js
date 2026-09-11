const rateLimit = require('express-rate-limit');

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes.' },
});

// Strict limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Face verification limiter
const faceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Too many face verification requests.' },
});

// Voting limiter (per user per window)
const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many vote attempts. Each voter can only vote once per election type.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// Email/OTP limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
});

module.exports = { generalLimiter, authLimiter, faceLimiter, voteLimiter, otpLimiter };
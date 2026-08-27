import { rateLimit, ipKeyGenerator } from "express-rate-limit";

// Limit per logged-in user when we have one, otherwise per IP.
export const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.max || 100,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) =>
      req.user?.id ? `user_${req.user.id}` : `ip_${ipKeyGenerator(req.ip)}`,
  });

export const apiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 150 });
export const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
export const postLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 50 });
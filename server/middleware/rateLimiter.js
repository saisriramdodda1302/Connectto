import rateLimit from "express-rate-limit";

// IP+User combined rate limiting.
export const createRateLimiter = (options) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000, // default is 15 mins.
        max: options.max || 100, // limiting each IP or User to 100 requests per `window`.
        message: { message: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            // Combining IP and userId if available (assuming user is appended to req by verifyToken)
            // But verifyToken in auth.js might not put `req.user`, it currently does `req.user = verified;`
            const ip = req.ip || req.connection.remoteAddress;
            const userId = req.user ? req.user.id : "guest";
            return `${ip}_${userId}`;
        }
    });
};

export const apiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 150 });
export const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
export const postLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 50 });

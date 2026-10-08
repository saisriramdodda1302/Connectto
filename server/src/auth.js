import jwt from 'jsonwebtoken';

const COOKIE = 'ct_session';
const WEEK = 7 * 24 * 60 * 60 * 1000;
const secret = () => process.env.JWT_SECRET;

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

export function startSession(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE, token, { ...cookieOpts(), maxAge: WEEK });
}

export function endSession(res) {
  res.clearCookie(COOKIE, cookieOpts());
}

export function requireAuth(req, res, next) {
  try {
    req.userId = Number(jwt.verify(req.cookies[COOKIE], secret()).sub);
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in to continue.' });
  }
}

// short-lived token the browser hands to the socket, since the socket may live on another domain
export const socketTicket = (userId) =>
  jwt.sign({ sub: String(userId) }, secret(), { audience: 'socket', expiresIn: '1m' });

export const readTicket = (token) => Number(jwt.verify(token, secret(), { audience: 'socket' }).sub);

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { one } from '../db.js';
import { endSession, requireAuth, socketTicket, startSession } from '../auth.js';
import { HttpError, parse } from '../http.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

const email = z.string().trim().toLowerCase().email('Enter a valid email address.');
const name = (label) => z.string().trim().min(1, `Enter your ${label}.`).max(40);

const Register = z.object({
  first_name: name('first name'),
  last_name: name('last name'),
  email,
  password: z.string().min(8, 'Use at least 8 characters for the password.').max(72),
});

const Login = z.object({ email, password: z.string().min(1, 'Enter your password.') });

const PUBLIC = 'id, first_name, last_name, email';

router.post('/register', limiter, async (req, res) => {
  const body = parse(Register, req.body);
  const hash = await bcrypt.hash(body.password, 10);
  const user = await one(
    `insert into users (first_name, last_name, email, password_hash) values ($1, $2, $3, $4)
     on conflict (email) do nothing returning ${PUBLIC}`,
    [body.first_name, body.last_name, body.email, hash],
  );
  if (!user) throw new HttpError(409, 'An account with this email already exists.');
  startSession(res, user.id);
  res.status(201).json(user);
});

router.post('/login', limiter, async (req, res) => {
  const body = parse(Login, req.body);
  const user = await one(`select ${PUBLIC}, password_hash from users where email = $1`, [body.email]);
  const ok = user && (await bcrypt.compare(body.password, user.password_hash));
  if (!ok) throw new HttpError(401, 'Email or password is incorrect.');
  startSession(res, user.id);
  delete user.password_hash;
  res.json(user);
});

router.post('/logout', (req, res) => {
  endSession(res);
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await one(`select ${PUBLIC} from users where id = $1`, [req.userId]);
  if (!user) throw new HttpError(401, 'Please sign in to continue.');
  res.json(user);
});

router.get('/socket-token', requireAuth, (req, res) => {
  res.json({ token: socketTicket(req.userId) });
});

export default router;

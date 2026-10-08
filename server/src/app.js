import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import auth from './routes/auth.js';
import users from './routes/users.js';
import posts from './routes/posts.js';
import messages from './routes/messages.js';
import { pool } from './db.js';

export const app = express();

app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.use(helmet());
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  await pool.query('select 1');
  res.json({ ok: true });
});

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/messages', messages);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Photos must be under 4 MB.' : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err.code === '22P02' || err.code === '23503') return res.status(404).json({ error: 'Not found.' });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

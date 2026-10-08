import { Router } from 'express';
import { z } from 'zod';
import { one, query } from '../db.js';
import { requireAuth } from '../auth.js';
import { emitTo } from '../socket.js';
import { HttpError, idParam, parse, writeLimit } from '../http.js';

const router = Router();
router.use(requireAuth);

const PAGE = 40;

// one row per person you've talked to, newest conversation first
router.get('/', async (req, res) => {
  const { rows } = await query(
    `with last as (
       select distinct on (other) other, body, created_at, sender_id
       from (select case when sender_id = $1 then recipient_id else sender_id end as other, id, body, created_at, sender_id
             from messages where sender_id = $1 or recipient_id = $1) m
       order by other, id desc
     )
     select u.id, u.first_name, u.last_name, last.body as last_body, last.created_at as last_at,
            last.sender_id = $1 as last_mine
     from last join users u on u.id = last.other
     order by last.created_at desc`,
    [req.userId],
  );
  res.json(rows);
});

router.get('/:userId', async (req, res) => {
  const other = idParam(req.params.userId);
  const before = req.query.before ? idParam(req.query.before) : null;
  const params = [req.userId, other];
  if (before) params.push(before);

  const { rows } = await query(
    `select id, sender_id, recipient_id, body, created_at from messages
     where least(sender_id, recipient_id) = least($1::int, $2::int)
       and greatest(sender_id, recipient_id) = greatest($1::int, $2::int)
       ${before ? 'and id < $3' : ''}
     order by id desc
     limit ${PAGE + 1}`,
    params,
  );
  const page = rows.slice(0, PAGE);
  res.json({ messages: page.reverse(), next: rows.length > PAGE ? page[0].id : null });
});

const NewMessage = z.object({
  body: z.string().trim().min(1, 'Type a message first.').max(2000, 'Messages can be up to 2000 characters.'),
});

router.post('/:userId', writeLimit, async (req, res) => {
  const other = idParam(req.params.userId);
  if (other === req.userId) throw new HttpError(400, "You can't message yourself.");
  const { body } = parse(NewMessage, req.body);

  const message = await one(
    `insert into messages (sender_id, recipient_id, body) values ($1, $2, $3)
     returning id, sender_id, recipient_id, body, created_at`,
    [req.userId, other, body],
  );
  emitTo([req.userId, other], 'message', message);
  res.status(201).json(message);
});

export default router;

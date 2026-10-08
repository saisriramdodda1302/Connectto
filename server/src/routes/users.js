import { Router } from 'express';
import { one, query } from '../db.js';
import { requireAuth } from '../auth.js';
import { HttpError, idParam } from '../http.js';

const router = Router();
router.use(requireAuth);

const followedBy = (me) => `exists (select 1 from follows f where f.follower_id = ${me} and f.followee_id = u.id)`;

// search by name, or suggest people you don't follow yet
router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 60);

  if (q) {
    const term = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    const { rows } = await query(
      `select u.id, u.first_name, u.last_name, ${followedBy('$1')} as is_following
       from users u
       where u.id <> $1 and u.first_name || ' ' || u.last_name ilike $2
       order by u.first_name, u.last_name
       limit 20`,
      [req.userId, term],
    );
    return res.json(rows);
  }

  const { rows } = await query(
    `select u.id, u.first_name, u.last_name, false as is_following
     from users u
     where u.id <> $1 and not ${followedBy('$1')}
     order by u.id desc
     limit 5`,
    [req.userId],
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const user = await one(
    `select u.id, u.first_name, u.last_name, u.created_at,
            (select count(*)::int from posts where user_id = u.id) as post_count,
            (select count(*)::int from follows where followee_id = u.id) as follower_count,
            (select count(*)::int from follows where follower_id = u.id) as following_count,
            ${followedBy('$2')} as is_following
     from users u where u.id = $1`,
    [idParam(req.params.id), req.userId],
  );
  if (!user) throw new HttpError(404, 'This person does not exist.');
  res.json(user);
});

router.get('/:id/following', async (req, res) => {
  const { rows } = await query(
    `select u.id, u.first_name, u.last_name, ${followedBy('$2')} as is_following
     from follows f join users u on u.id = f.followee_id
     where f.follower_id = $1
     order by f.created_at desc`,
    [idParam(req.params.id), req.userId],
  );
  res.json(rows);
});

async function followState(id) {
  return one('select count(*)::int as follower_count from follows where followee_id = $1', [id]);
}

router.put('/:id/follow', async (req, res) => {
  const id = idParam(req.params.id);
  if (id === req.userId) throw new HttpError(400, "You can't follow yourself.");
  await query('insert into follows (follower_id, followee_id) values ($1, $2) on conflict do nothing', [req.userId, id]);
  res.json({ is_following: true, ...(await followState(id)) });
});

router.delete('/:id/follow', async (req, res) => {
  const id = idParam(req.params.id);
  await query('delete from follows where follower_id = $1 and followee_id = $2', [req.userId, id]);
  res.json({ is_following: false, ...(await followState(id)) });
});

export default router;

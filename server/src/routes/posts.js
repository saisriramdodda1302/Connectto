import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { one, query } from '../db.js';
import { requireAuth } from '../auth.js';
import { HttpError, idParam, parse, writeLimit } from '../http.js';

const router = Router();
router.use(requireAuth);

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.has(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Photos can be JPG, PNG, WebP or GIF.')),
});

const PAGE = 10;

// $1 is always the viewer
const SELECT = `
  select p.id, p.body, p.created_at, p.image_type is not null as has_image,
         u.id as author_id, u.first_name, u.last_name,
         (select count(*)::int from likes l where l.post_id = p.id) as like_count,
         (select count(*)::int from comments c where c.post_id = p.id) as comment_count,
         exists (select 1 from likes l where l.post_id = p.id and l.user_id = $1) as liked
  from posts p join users u on u.id = p.user_id`;

const Feed = z.object({
  scope: z.enum(['following', 'everyone']).default('following'),
  author: z.coerce.number().int().positive().optional(),
  before: z.coerce.number().int().positive().optional(),
});

router.get('/', async (req, res) => {
  const { scope, author, before } = parse(Feed, req.query);
  const params = [req.userId];
  const where = [];

  if (author) {
    params.push(author);
    where.push(`p.user_id = $${params.length}`);
  } else if (scope === 'following') {
    where.push('(p.user_id = $1 or p.user_id in (select followee_id from follows where follower_id = $1))');
  }
  if (before) {
    params.push(before);
    where.push(`p.id < $${params.length}`);
  }
  params.push(PAGE + 1);

  const { rows } = await query(
    `${SELECT} ${where.length ? `where ${where.join(' and ')}` : ''} order by p.id desc limit $${params.length}`,
    params,
  );
  const posts = rows.slice(0, PAGE);
  res.json({ posts, next: rows.length > PAGE ? posts.at(-1).id : null });
});

const NewPost = z.object({ body: z.string().trim().max(2000, 'Posts can be up to 2000 characters.').default('') });

router.post('/', writeLimit, upload.single('image'), async (req, res) => {
  const { body } = parse(NewPost, req.body ?? {});
  if (!body && !req.file) throw new HttpError(400, 'Write something or add a photo.');

  const { id } = await one(
    'insert into posts (user_id, body, image, image_type) values ($1, $2, $3, $4) returning id',
    [req.userId, body, req.file?.buffer ?? null, req.file?.mimetype ?? null],
  );
  res.status(201).json(await one(`${SELECT} where p.id = $2`, [req.userId, id]));
});

router.get('/:id/image', async (req, res) => {
  const post = await one('select image, image_type from posts where id = $1 and image is not null', [idParam(req.params.id)]);
  if (!post) throw new HttpError(404, 'Not found.');
  res.set('Cache-Control', 'private, max-age=31536000, immutable').type(post.image_type).send(post.image);
});

router.delete('/:id', async (req, res) => {
  const gone = await one('delete from posts where id = $1 and user_id = $2 returning id', [idParam(req.params.id), req.userId]);
  if (!gone) throw new HttpError(404, 'Not found.');
  res.status(204).end();
});

const likeState = async (postId, liked) => ({
  liked,
  ...(await one('select count(*)::int as like_count from likes where post_id = $1', [postId])),
});

router.put('/:id/like', async (req, res) => {
  const id = idParam(req.params.id);
  await query('insert into likes (post_id, user_id) values ($1, $2) on conflict do nothing', [id, req.userId]);
  res.json(await likeState(id, true));
});

router.delete('/:id/like', async (req, res) => {
  const id = idParam(req.params.id);
  await query('delete from likes where post_id = $1 and user_id = $2', [id, req.userId]);
  res.json(await likeState(id, false));
});

const COMMENT = `
  select c.id, c.body, c.created_at, u.id as author_id, u.first_name, u.last_name
  from comments c join users u on u.id = c.user_id`;

router.get('/:id/comments', async (req, res) => {
  const { rows } = await query(`${COMMENT} where c.post_id = $1 order by c.id`, [idParam(req.params.id)]);
  res.json(rows);
});

const NewComment = z.object({
  body: z.string().trim().min(1, 'Write a comment first.').max(1000, 'Comments can be up to 1000 characters.'),
});

router.post('/:id/comments', writeLimit, async (req, res) => {
  const { body } = parse(NewComment, req.body);
  const { id } = await one('insert into comments (post_id, user_id, body) values ($1, $2, $3) returning id', [
    idParam(req.params.id),
    req.userId,
    body,
  ]);
  res.status(201).json(await one(`${COMMENT} where c.id = $1`, [id]));
});

export default router;

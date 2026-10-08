import { rateLimit } from 'express-rate-limit';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function parse(schema, data) {
  const out = schema.safeParse(data);
  if (!out.success) throw new HttpError(400, out.error.issues[0]?.message || 'Invalid request.');
  return out.data;
}

export function idParam(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Not found.');
  return id;
}

export const writeLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: (req) => `user:${req.userId}`,
  message: { error: 'You are doing that too fast. Try again in a minute.' },
});

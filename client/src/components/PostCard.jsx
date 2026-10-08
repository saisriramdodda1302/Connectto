import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { fmtDate, fullName, timeAgo } from '../lib/format';
import Avatar from './Avatar';
import Comments from './Comments';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.like_count);
  const [comments, setComments] = useState(post.comment_count);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const name = fullName(post);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      const res = await api(`/posts/${post.id}/like`, { method: next ? 'PUT' : 'DELETE' });
      setLiked(res.liked);
      setLikes(res.like_count);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    }
  };

  const remove = async () => {
    await api(`/posts/${post.id}`, { method: 'DELETE' });
    onDelete(post.id);
  };

  return (
    <article className="card p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <Link to={`/people/${post.author_id}`} tabIndex={-1}>
          <Avatar user={post} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/people/${post.author_id}`} className="font-medium hover:underline">
            {name}
          </Link>
          <p className="text-xs text-muted">
            <time dateTime={post.created_at} title={fmtDate(post.created_at)}>
              {timeAgo(post.created_at)}
            </time>
          </p>
        </div>
        {post.author_id === user.id &&
          (confirming ? (
            <div className="flex items-center gap-2 text-sm">
              <button type="button" className="btn h-8 px-3 text-bad" onClick={remove}>
                Delete
              </button>
              <button type="button" className="btn h-8 px-3" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Delete post"
              className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-line/40 hover:text-ink"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ))}
      </header>

      {post.body && <p className="mt-3 whitespace-pre-wrap break-words">{post.body}</p>}
      {post.has_image && (
        <img
          src={`/api/posts/${post.id}/image`}
          alt={`Photo shared by ${name}`}
          loading="lazy"
          className="mt-3 max-h-[32rem] w-full rounded-lg border border-line object-cover"
        />
      )}

      <div className="-ml-2.5 mt-3 flex gap-1 text-sm text-muted">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-line/40 ${liked ? 'text-bad' : 'hover:text-ink'}`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          {likes}
        </button>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Comments"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-line/40 hover:text-ink"
        >
          <MessageSquare className="h-4 w-4" />
          {comments}
        </button>
      </div>

      {open && <Comments postId={post.id} onAdded={() => setComments((n) => n + 1)} />}
    </article>
  );
}

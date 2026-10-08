import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SendHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import { fullName, timeAgo } from '../lib/format';
import Avatar from './Avatar';

export default function Comments({ postId, onAdded }) {
  const [items, setItems] = useState(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/posts/${postId}/comments`)
      .then(setItems)
      .catch((err) => setError(err.message));
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError('');
    try {
      const comment = await api(`/posts/${postId}/comments`, { method: 'POST', body: { body } });
      setItems((prev) => [...(prev ?? []), comment]);
      setBody('');
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      {items?.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <Avatar user={c} size="sm" />
          <div className="min-w-0 rounded-lg bg-page px-3 py-2">
            <p className="text-sm">
              <Link to={`/people/${c.author_id}`} className="font-medium hover:underline">
                {fullName(c)}
              </Link>
              <span className="ml-2 text-xs text-muted">{timeAgo(c.created_at)}</span>
            </p>
            <p className="whitespace-pre-wrap break-words text-sm">{c.body}</p>
          </div>
        </div>
      ))}
      {items?.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}

      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor={`comment-${postId}`} className="sr-only">
          Write a comment
        </label>
        <input
          id={`comment-${postId}`}
          value={body}
          maxLength={1000}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment"
          className="field h-9 text-sm"
        />
        <button type="submit" className="btn h-9 px-3" disabled={busy || !body.trim()} aria-label="Send comment">
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

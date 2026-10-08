import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import Avatar from './Avatar';

const MAX_BYTES = 4 * 1024 * 1024;

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (file) => {
    setError('');
    if (file && file.size > MAX_BYTES) {
      setError('Photos must be under 4 MB.');
      file = null;
    }
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : '');
    if (!file && fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('body', body);
      if (image) form.append('image', image);
      onPosted(await api('/posts', { method: 'POST', form }));
      setBody('');
      pick(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card p-4">
      <div className="flex gap-3">
        <Avatar user={user} />
        <label htmlFor="post-body" className="sr-only">
          Write a post
        </label>
        <textarea
          id="post-body"
          rows={2}
          maxLength={2000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What are you working on?"
          className="field min-h-[3.5rem] resize-y"
        />
      </div>

      {preview && (
        <div className="relative ml-[3.25rem] mt-3 w-fit">
          <img src={preview} alt="Selected photo" className="max-h-64 rounded-lg border border-line" />
          <button
            type="button"
            onClick={() => pick(null)}
            aria-label="Remove photo"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-page/90 text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="ml-[3.25rem] mt-2 text-sm text-bad">
          {error}
        </p>
      )}

      <div className="ml-[3.25rem] mt-3 flex items-center justify-between">
        <button type="button" className="btn h-8 px-3" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <button type="submit" className="btn btn-primary h-8 px-4" disabled={busy || (!body.trim() && !image)}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}

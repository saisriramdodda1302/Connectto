import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Composer from './Composer';
import PostCard from './PostCard';

const postsUrl = ({ scope, author }, before) => {
  const params = new URLSearchParams(author ? { author } : { scope });
  if (before) params.set('before', before);
  return `/posts?${params}`;
};

export default function PostList({ scope = 'following', author, canPost, empty }) {
  const [posts, setPosts] = useState(null);
  const [next, setNext] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    api(postsUrl({ scope, author }))
      .then((data) => {
        if (!live) return;
        setPosts(data.posts);
        setNext(data.next);
      })
      .catch((err) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, [scope, author]);

  const more = async () => {
    setLoading(true);
    try {
      const data = await api(postsUrl({ scope, author }, next));
      setPosts((prev) => [...prev, ...data.posts]);
      setNext(data.next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canPost && <Composer onPosted={(post) => setPosts((prev) => [post, ...(prev ?? [])])} />}
      {error && <p className="text-bad">{error}</p>}
      {posts?.length === 0 && <div className="card p-8 text-center text-muted">{empty}</div>}
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
      ))}
      {next && (
        <div className="flex justify-center pt-2">
          <button type="button" className="btn" onClick={more} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

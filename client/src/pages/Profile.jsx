import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { fullName } from '../lib/format';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import PersonRow from '../components/PersonRow';
import PostList from '../components/PostList';

export default function Profile() {
  const { id } = useParams();
  return <ProfileView key={id} id={Number(id)} />;
}

function ProfileView({ id }) {
  const { user: me } = useAuth();
  const [person, setPerson] = useState(null);
  const [following, setFollowing] = useState(null);
  const [error, setError] = useState('');
  const isMe = id === me.id;

  useEffect(() => {
    api(`/users/${id}`)
      .then(setPerson)
      .catch((err) => setError(err.message));
    api(`/users/${id}/following`)
      .then(setFollowing)
      .catch(() => setFollowing([]));
  }, [id]);

  if (error) return <p className="text-bad">{error}</p>;
  if (!person) return null;

  const joined = new Date(person.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <>
      <section className="card flex flex-wrap items-center gap-5 p-5 sm:p-6">
        <Avatar user={person} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{fullName(person)}</h1>
          <p className="text-sm text-muted">Joined {joined}</p>
          <dl className="mt-3 flex gap-5 text-sm">
            <Stat label="posts" value={person.post_count} />
            <Stat label="followers" value={person.follower_count} />
            <Stat label="following" value={person.following_count} />
          </dl>
        </div>
        {!isMe && (
          <div className="flex gap-2">
            <FollowButton
              id={person.id}
              following={person.is_following}
              onChange={(res) => setPerson((p) => ({ ...p, follower_count: res.follower_count }))}
            />
            <Link to={`/messages/${person.id}`} className="btn h-8 px-3">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Message
            </Link>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section className="min-w-0">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Posts</h2>
          <PostList
            author={id}
            canPost={isMe}
            empty={isMe ? 'You have not posted anything yet.' : `${person.first_name} has not posted anything yet.`}
          />
        </section>
        <aside>
          <h2 className="mb-2 text-sm font-medium text-muted">Following</h2>
          {following?.length === 0 && <p className="text-sm text-muted">Not following anyone yet.</p>}
          {following?.length > 0 && (
            <ul className="card divide-y divide-line">
              {following.map((p) => (
                <PersonRow key={p.id} person={p} />
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex gap-1">
      <dt className="sr-only">{label}</dt>
      <dd className="font-semibold">{value}</dd>
      <span className="text-muted" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

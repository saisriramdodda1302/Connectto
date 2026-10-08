import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PostList from '../components/PostList';
import PersonRow from '../components/PersonRow';

const TABS = [
  ['following', 'Following'],
  ['everyone', 'Everyone'],
];

export default function Feed() {
  const [scope, setScope] = useState('following');

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <section className="min-w-0">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
          <div role="tablist" className="flex rounded-full border border-line p-0.5 text-sm">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={scope === key}
                onClick={() => setScope(key)}
                className={`rounded-full px-3 py-1 ${scope === key ? 'bg-line/70 text-ink' : 'text-muted hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <PostList
          key={scope}
          scope={scope}
          canPost
          empty={
            scope === 'following'
              ? 'Nothing here yet. Follow a few people, or switch to Everyone to see all posts.'
              : 'No one has posted yet. Be the first.'
          }
        />
      </section>
      <aside>
        <Suggestions />
      </aside>
    </div>
  );
}

function Suggestions() {
  const [people, setPeople] = useState(null);

  useEffect(() => {
    api('/users')
      .then(setPeople)
      .catch(() => setPeople([]));
  }, []);

  return (
    <section className="lg:sticky lg:top-20">
      <h2 className="mb-2 text-sm font-medium text-muted">People to follow</h2>
      {people?.length === 0 && <p className="text-sm text-muted">No suggestions right now.</p>}
      {people?.length > 0 && (
        <ul className="card divide-y divide-line">
          {people.map((p) => (
            <PersonRow key={p.id} person={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

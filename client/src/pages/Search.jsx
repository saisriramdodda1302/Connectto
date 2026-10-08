import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { api } from '../lib/api';
import PersonRow from '../components/PersonRow';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!q) return;
    let live = true;
    api(`/users?q=${encodeURIComponent(q)}`)
      .then((rows) => live && setResult({ q, rows }))
      .catch(() => live && setResult({ q, rows: [] }));
    return () => {
      live = false;
    };
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get('q').trim();
    if (value) setParams({ q: value });
  };

  const rows = result?.q === q ? result.rows : null;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <form onSubmit={submit} role="search" className="relative mt-4 max-w-md sm:hidden">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input key={q} name="q" type="search" defaultValue={q} placeholder="Search people by name" aria-label="Search people" className="field pl-9" />
      </form>

      <div className="mt-6 max-w-xl">
        {!q && <p className="text-muted">Find people by their first or last name.</p>}
        {q && !rows && <p className="text-muted">Searching…</p>}
        {rows?.length === 0 && <p className="text-muted">No one called “{q}” yet.</p>}
        {rows?.length > 0 && (
          <>
            <p className="mb-2 text-sm text-muted">
              {rows.length} {rows.length === 1 ? 'person' : 'people'} found
            </p>
            <ul className="card divide-y divide-line">
              {rows.map((p) => (
                <PersonRow key={p.id} person={p} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

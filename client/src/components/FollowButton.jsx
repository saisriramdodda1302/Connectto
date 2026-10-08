import { useState } from 'react';
import { api } from '../lib/api';

export default function FollowButton({ id, following, onChange }) {
  const [on, setOn] = useState(following);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const res = await api(`/users/${id}/follow`, { method: next ? 'PUT' : 'DELETE' });
      onChange?.(res);
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      className={`btn h-8 shrink-0 px-3 ${on ? '' : 'btn-primary'}`}
    >
      {on ? 'Following' : 'Follow'}
    </button>
  );
}

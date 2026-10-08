import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, SendHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useSocket } from '../lib/socket';
import { fmtTime, fullName, timeAgo } from '../lib/format';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { id } = useParams();
  const otherId = id ? Number(id) : null;
  const { socket, unread } = useSocket();
  const [threads, setThreads] = useState(null);

  const loadThreads = useCallback(() => {
    api('/messages')
      .then(setThreads)
      .catch(() => setThreads([]));
  }, []);

  useEffect(() => {
    loadThreads();
    socket.on('message', loadThreads);
    return () => socket.off('message', loadThreads);
  }, [socket, loadThreads]);

  return (
    <div className="card grid h-[calc(100dvh-9rem)] min-h-[26rem] overflow-hidden md:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className={`min-h-0 flex-col border-line md:flex md:border-r ${otherId ? 'hidden' : 'flex'}`}>
        <h1 className="border-b border-line px-4 py-3 font-semibold">Messages</h1>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {threads?.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted">No conversations yet. Open someone's profile and press Message.</li>
          )}
          {threads?.map((t) => (
            <li key={t.id}>
              <Link
                to={`/messages/${t.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-line/30 ${t.id === otherId ? 'bg-line/40' : ''}`}
              >
                <Avatar user={t} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${unread.has(t.id) ? 'font-semibold' : 'font-medium'}`}>{fullName(t)}</span>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(t.last_at)}</span>
                  </div>
                  <p className="truncate text-sm text-muted">
                    {t.last_mine && 'You: '}
                    {t.last_body}
                  </p>
                </div>
                {unread.has(t.id) && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="New message" />}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <section className={`min-h-0 flex-col ${otherId ? 'flex' : 'hidden md:flex'}`}>
        {otherId ? (
          <Conversation key={otherId} otherId={otherId} />
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-muted">
            Pick a conversation, or open someone's profile and press Message.
          </div>
        )}
      </section>
    </div>
  );
}

function Conversation({ otherId }) {
  const { user } = useAuth();
  const { socket, markRead } = useSocket();
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState(null);
  const [next, setNext] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const lastId = messages?.at(-1)?.id;

  useEffect(() => {
    api(`/users/${otherId}`)
      .then(setOther)
      .catch((err) => setError(err.message));
    api(`/messages/${otherId}`)
      .then((data) => {
        setMessages(data.messages);
        setNext(data.next);
      })
      .catch((err) => setError(err.message));
  }, [otherId]);

  useEffect(() => {
    const onMessage = (m) => {
      const ours = [m.sender_id, m.recipient_id].includes(otherId) && [m.sender_id, m.recipient_id].includes(user.id);
      if (!ours) return;
      setMessages((prev) => (!prev || prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    };
    socket.on('message', onMessage);
    return () => socket.off('message', onMessage);
  }, [socket, otherId, user.id]);

  useEffect(() => {
    markRead(otherId);
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [otherId, lastId, markRead]);

  const earlier = async () => {
    const data = await api(`/messages/${otherId}?before=${next}`);
    setMessages((prev) => [...data.messages, ...prev]);
    setNext(data.next);
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    setError('');
    try {
      const m = await api(`/messages/${otherId}`, { method: 'POST', body: { body } });
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    } catch (err) {
      setError(err.message);
      setText(body);
    }
  };

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <Link to="/messages" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {other && (
          <Link to={`/people/${other.id}`} className="flex items-center gap-3 hover:underline">
            <Avatar user={other} size="sm" />
            <span className="font-medium">{fullName(other)}</span>
          </Link>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {next && (
          <div className="flex justify-center pb-2">
            <button type="button" className="btn h-8 px-3 text-xs" onClick={earlier}>
              Load earlier messages
            </button>
          </div>
        )}
        {messages?.length === 0 && other && (
          <p className="pt-10 text-center text-sm text-muted">Say hello to {other.first_name}.</p>
        )}
        {messages?.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                title={fmtTime(m.created_at)}
                className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md border border-line bg-page'
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <input
          id="message"
          value={text}
          maxLength={2000}
          autoComplete="off"
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          className="field"
        />
        <button type="submit" className="btn btn-primary px-3" disabled={!text.trim()} aria-label="Send">
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
      {error && (
        <p role="alert" className="px-4 pb-3 text-sm text-bad">
          {error}
        </p>
      )}
    </>
  );
}

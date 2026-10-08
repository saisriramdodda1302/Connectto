import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { SocketContext } from '../lib/socket';

// empty means same origin (Vite proxy locally, nginx in Docker)
const url = import.meta.env.VITE_SOCKET_URL || undefined;

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(() => new Set());
  const [socket] = useState(() =>
    io(url, {
      autoConnect: false,
      auth: (cb) => api('/auth/socket-token').then(cb, () => cb({})),
    }),
  );

  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => {
    const onMessage = (m) => {
      if (m.sender_id !== user.id) setUnread((prev) => new Set(prev).add(m.sender_id));
    };
    socket.on('message', onMessage);
    return () => socket.off('message', onMessage);
  }, [socket, user.id]);

  const markRead = useCallback((id) => {
    setUnread((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ socket, unread, markRead }), [socket, unread, markRead]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

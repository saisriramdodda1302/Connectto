import { Server } from 'socket.io';
import { readTicket } from './auth.js';

let io;

export function attachSocket(server) {
  const origins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(server, { serveClient: false, cors: origins.length ? { origin: origins } : undefined });

  io.use((socket, next) => {
    try {
      socket.data.userId = readTicket(socket.handshake.auth?.token);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => socket.join(`user:${socket.data.userId}`));
}

export function emitTo(userIds, event, data) {
  io?.to(userIds.map((id) => `user:${id}`)).emit(event, data);
}

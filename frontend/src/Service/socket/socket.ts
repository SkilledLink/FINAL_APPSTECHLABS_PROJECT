import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  // Reuse existing socket if the token hasn't changed.
  if (socket && (socket.auth as any)?.token === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  // Token changed (login/logout) — tear down and reconnect.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
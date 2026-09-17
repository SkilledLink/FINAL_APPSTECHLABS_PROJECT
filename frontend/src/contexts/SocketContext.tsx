import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '../Service/socket/socket';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export const SocketProvider: React.FC<{ token: string | null; children: React.ReactNode }> = ({
  token,
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // No token → real logout. Disconnect for good.
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = connectSocket(token);
    setSocket(s);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    if (s.connected) setConnected(true);

    return () => {
      // ⚠️ Only remove the listeners we added. Do NOT disconnect here —
      // React StrictMode unmounts+remounts in dev, and calling
      // disconnectSocket() mid-handshake causes "closed before the
      // connection is established". The socket is a singleton that
      // lives until the token goes away (real logout) or the page
      // actually closes.
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [token]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

export const useSocket = (loungeId, userId, displayName) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize single socket connection with built-in auto-reconnection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Handle initial connection and room joining
    socket.on('connect', () => {
      console.log('Socket connected successfully, ID:', socket.id);
      if (loungeId) {
        socket.emit('join_lounge', { loungeId, userId });
        if (displayName) {
          socket.emit('presence.join', { loungeId, userId, displayName });
        }
      }
    });

    // Handle automatic re-sync after a dropped connection or network blip
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected on attempt ${attemptNumber}, re-joining lounge...`);
      if (loungeId) {
        socket.emit('join_lounge', { loungeId, userId });
        if (displayName) {
          socket.emit('presence.join', { loungeId, userId, displayName });
        }
      }
    });

    // Clean up socket connection when the component using it unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [loungeId, userId, displayName]);

  // Return the active socket instance so components can call .emit() or .on()
  return socketRef.current;
};
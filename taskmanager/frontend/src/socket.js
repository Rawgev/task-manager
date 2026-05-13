import { io } from 'socket.io-client';

let socket = null;
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/';

export const getSocket = () => {
  if (!socket) socket = io(API_URL, { transports: ['websocket'] });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

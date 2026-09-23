import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// One socket for the whole app. It connects only after login.
const socket = io(API_BASE, { autoConnect: false });

export const connectSocket = (userId) => {
  if (!userId) return;
  const join = () => socket.emit("join", userId);
  socket.off("connect", socket._join);      // never stack handlers
  socket._join = join;
  socket.on("connect", join);               // re-join after every (re)connect
  if (socket.connected) join();
  else socket.connect();
};

export const disconnectSocket = () => {
  socket.off("connect", socket._join);
  socket.disconnect();
};

export default socket;
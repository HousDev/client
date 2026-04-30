// import { io } from "socket.io-client";

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"], // force websocket
// });

// export default socket;


import { io } from "socket.io-client";

// 🔥 dynamic URL (production safe)
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // ✅ allow fallback
  withCredentials: true,
});

export default socket;
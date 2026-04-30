// import { io } from "socket.io-client";

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"], // force websocket
// });

// export default socket;


import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// 🔥 safe URL handling
const SOCKET_URL = API_URL
  ? API_URL.replace(/\/api\/?$/, "")
  : window.location.origin;

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
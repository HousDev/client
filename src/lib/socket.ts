// import { io } from "socket.io-client";

// const socket = io("http://localhost:4000", {
//   transports: ["websocket"], // force websocket
// });

// export default socket;


import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_API_URL, {
  transports: ["websocket"], // force websocket
});

export default socket;
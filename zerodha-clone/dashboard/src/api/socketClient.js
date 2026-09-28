import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

let socket;

// Lazily creates a single shared socket connection to the `/market`
// namespace (see backend/src/sockets/priceSocket.js) so multiple components
// mounting/unmounting don't each open their own websocket.
export function getMarketSocket() {
  if (!socket) {
    socket = io(`${SOCKET_URL}/market`, { autoConnect: true });
  }
  return socket;
}

import { useEffect } from "react";
import { getMarketSocket } from "../api/socketClient";

/**
 * Subscribes to the backend's simulated live-price feed
 * (backend/src/sockets/priceSocket.js) and forwards each batch of updated
 * instruments to `onTick`. Centralised here so WatchList/Holdings/Positions
 * all react to the same live prices instead of each polling the REST
 * endpoint on a timer.
 */
export function useMarketSocket({ onInstruments, onTick } = {}) {
  useEffect(() => {
    const socket = getMarketSocket();

    const handleInstruments = (instruments) => onInstruments && onInstruments(instruments);
    const handleTick = (updated) => onTick && onTick(updated);

    socket.on("instruments", handleInstruments);
    socket.on("priceUpdate", handleTick);

    return () => {
      socket.off("instruments", handleInstruments);
      socket.off("priceUpdate", handleTick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useMarketSocket;

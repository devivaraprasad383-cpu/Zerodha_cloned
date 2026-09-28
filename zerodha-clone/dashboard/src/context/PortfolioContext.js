import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosClient from "../api/axiosClient";

const PortfolioContext = createContext(null);

/**
 * Single source of truth for everything the dashboard screens render:
 * holdings, positions, order history, wallet balance and the instrument
 * watchlist. Screens read from here instead of each firing its own axios
 * call against a hardcoded URL, and `refresh()` is called once after an
 * order executes so every screen reflects the new state immediately.
 */
export const PortfolioProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [holdingsRes, positionsRes, ordersRes, walletRes, instrumentsRes] =
        await Promise.all([
          axiosClient.get("/holdings"),
          axiosClient.get("/positions"),
          axiosClient.get("/orders"),
          axiosClient.get("/funds"),
          axiosClient.get("/market/instruments"),
        ]);
      setHoldings(holdingsRes.data.data);
      setPositions(positionsRes.data.data);
      setOrders(ordersRes.data.data);
      setWallet(walletRes.data.data);
      setInstruments(instrumentsRes.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Merges a batch of live-updated instruments (from the price-tick socket)
  // into local state without needing a full refetch of everything else.
  const applyInstrumentTicks = useCallback((updated) => {
    setInstruments((prev) => {
      const byId = new Map(updated.map((i) => [i._id, i]));
      return prev.map((i) => byId.get(i._id) || i);
    });
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        holdings,
        positions,
        orders,
        wallet,
        instruments,
        loading,
        error,
        refresh,
        applyInstrumentTicks,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
export default PortfolioContext;

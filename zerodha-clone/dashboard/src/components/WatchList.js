import React, { useContext, useMemo, useState } from "react";

import GeneralContext from "./GeneralContext";
import { usePortfolio } from "../context/PortfolioContext";
import useMarketSocket from "../hooks/useMarketSocket";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { DoughnutChart } from "./DoughnoutChart";

const CHART_COLORS = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(255, 206, 86, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(255, 159, 64, 0.5)",
];

/**
 * The instrument list, and every price on it, used to be a hardcoded array
 * in data.js. It's now the live `Instrument` collection: seeded once on the
 * backend, then perturbed every couple of seconds by the price-simulation
 * socket (see backend/src/sockets/priceSocket.js) and pushed to every
 * connected client over the `/market` websocket namespace.
 */
const WatchList = () => {
  const { instruments, applyInstrumentTicks } = usePortfolio();
  const [search, setSearch] = useState("");

  useMarketSocket({ onTick: applyInstrumentTicks });

  const filtered = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return instruments;
    return instruments.filter((i) => i.symbol.includes(term));
  }, [instruments, search]);

  const chartData = {
    labels: instruments.map((i) => i.symbol),
    datasets: [
      {
        label: "Price",
        data: instruments.map((i) => i.lastPrice),
        backgroundColor: CHART_COLORS,
        borderColor: CHART_COLORS.map((c) => c.replace("0.5", "1")),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, tcs, reliance"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="counts">
          {" "}
          {filtered.length} / {instruments.length}
        </span>
      </div>

      <ul className="list">
        {filtered.map((stock) => (
          <WatchListItem stock={stock} key={stock._id || stock.symbol} />
        ))}
      </ul>

      {instruments.length > 0 && <DoughnutChart data={chartData} />}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const changePercent = stock.dayChangePercent ?? 0;
  const isDown = changePercent < 0;

  return (
    <li
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="item">
        <p className={isDown ? "down" : "up"}>{stock.symbol}</p>
        <div className="itemInfo">
          <span className="percent">{changePercent.toFixed(2)}%</span>
          {isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.lastPrice.toFixed(2)}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions stock={stock} />}
    </li>
  );
};

const WatchListActions = ({ stock }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={() => generalContext.openOrderWindow(stock, "BUY")}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={() => generalContext.openOrderWindow(stock, "SELL")}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip title="Analytics (A)" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};

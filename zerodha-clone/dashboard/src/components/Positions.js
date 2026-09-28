import React, { useMemo } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import useMarketSocket from "../hooks/useMarketSocket";

const Positions = () => {
  const { positions, instruments, applyInstrumentTicks } = usePortfolio();
  useMarketSocket({ onTick: applyInstrumentTicks });

  const priceBySymbol = useMemo(() => {
    const map = new Map();
    instruments.forEach((i) => map.set(i.symbol, i));
    return map;
  }, [instruments]);

  const rows = positions.map((position) => {
    const instrument = priceBySymbol.get(position.name);
    const ltp = instrument ? instrument.lastPrice : position.avg;
    const prevClose = instrument ? instrument.previousClose : position.avg;
    const curValue = ltp * position.qty;
    const investment = position.avg * position.qty;
    const pnl = curValue - investment;
    const dayChangePercent = prevClose ? ((ltp - prevClose) / prevClose) * 100 : 0;
    return { ...position, ltp, pnl, dayChangePercent };
  });

  return (
    <>
      <h3 className="title">Positions ({rows.length})</h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Product</th>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&amp;L</th>
            <th>Chg.</th>
          </tr>

          {rows.map((stock) => {
            const profClass = stock.pnl >= 0 ? "profit" : "loss";
            const dayClass = stock.dayChangePercent >= 0 ? "profit" : "loss";

            return (
              <tr key={stock._id || `${stock.product}-${stock.name}`}>
                <td>{stock.product}</td>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{stock.ltp.toFixed(2)}</td>
                <td className={profClass}>{stock.pnl.toFixed(2)}</td>
                <td className={dayClass}>{stock.dayChangePercent.toFixed(2)}%</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
};

export default Positions;

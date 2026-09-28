import React, { useMemo } from "react";
import { VerticalGraph } from "./VerticalGraph";
import { usePortfolio } from "../context/PortfolioContext";
import useMarketSocket from "../hooks/useMarketSocket";

/**
 * Holdings now come from `GET /api/holdings` (qty + weighted avg. buy price
 * only — no price/P&L fields, since those are derived, not stored data).
 * The live LTP is looked up from the shared instrument feed and every
 * P&L figure below is computed from the two, so it can never drift out of
 * sync the way a denormalized `price` field on the holding would.
 */
const Holdings = () => {
  const { holdings, instruments, applyInstrumentTicks } = usePortfolio();
  useMarketSocket({ onTick: applyInstrumentTicks });

  const priceBySymbol = useMemo(() => {
    const map = new Map();
    instruments.forEach((i) => map.set(i.symbol, i));
    return map;
  }, [instruments]);

  const rows = holdings.map((holding) => {
    const instrument = priceBySymbol.get(holding.name);
    const ltp = instrument ? instrument.lastPrice : holding.avg;
    const prevClose = instrument ? instrument.previousClose : holding.avg;
    const curValue = ltp * holding.qty;
    const investment = holding.avg * holding.qty;
    const pnl = curValue - investment;
    const netChangePercent = investment ? (pnl / investment) * 100 : 0;
    const dayChangePercent = prevClose ? ((ltp - prevClose) / prevClose) * 100 : 0;
    return { ...holding, ltp, curValue, investment, pnl, netChangePercent, dayChangePercent };
  });

  const totalInvestment = rows.reduce((sum, r) => sum + r.investment, 0);
  const totalCurValue = rows.reduce((sum, r) => sum + r.curValue, 0);
  const totalPnl = totalCurValue - totalInvestment;
  const totalPnlPercent = totalInvestment ? (totalPnl / totalInvestment) * 100 : 0;

  const labels = rows.map((r) => r.name);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: rows.map((r) => r.ltp),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({rows.length})</h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&amp;L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>

          {rows.map((stock) => {
            const profClass = stock.pnl >= 0 ? "profit" : "loss";
            const dayClass = stock.dayChangePercent >= 0 ? "profit" : "loss";

            return (
              <tr key={stock._id || stock.name}>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{stock.ltp.toFixed(2)}</td>
                <td>{stock.curValue.toFixed(2)}</td>
                <td className={profClass}>{stock.pnl.toFixed(2)}</td>
                <td className={profClass}>{stock.netChangePercent.toFixed(2)}%</td>
                <td className={dayClass}>{stock.dayChangePercent.toFixed(2)}%</td>
              </tr>
            );
          })}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>{totalInvestment.toFixed(2)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>{totalCurValue.toFixed(2)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalPnl >= 0 ? "profit" : "loss"}>
            {totalPnl.toFixed(2)} ({totalPnlPercent.toFixed(2)}%)
          </h5>
          <p>P&amp;L</p>
        </div>
      </div>
      {rows.length > 0 && <VerticalGraph data={chartData} />}
    </>
  );
};

export default Holdings;

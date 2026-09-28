import React, { useMemo } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { getStoredUser } from "../auth/authStorage";

const Summary = () => {
  const { wallet, holdings, instruments } = usePortfolio();
  const user = getStoredUser();

  const priceBySymbol = useMemo(() => {
    const map = new Map();
    instruments.forEach((i) => map.set(i.symbol, i));
    return map;
  }, [instruments]);

  const { investment, currentValue } = holdings.reduce(
    (acc, h) => {
      const ltp = priceBySymbol.get(h.name)?.lastPrice ?? h.avg;
      acc.investment += h.avg * h.qty;
      acc.currentValue += ltp * h.qty;
      return acc;
    },
    { investment: 0, currentValue: 0 }
  );

  const pnl = currentValue - investment;
  const pnlPercent = investment ? (pnl / investment) * 100 : 0;

  if (!wallet) return null;

  return (
    <>
      <div className="username">
        <h6>Hi, {user ? user.name : "there"}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{wallet.availableCash.toFixed(2)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{wallet.usedMargin.toFixed(2)}</span>{" "}
            </p>
            <p>
              Opening balance <span>{wallet.openingBalance.toFixed(2)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={pnl >= 0 ? "profit" : "loss"}>
              {pnl.toFixed(2)} <small>{pnlPercent.toFixed(2)}%</small>{" "}
            </h3>
            <p>P&amp;L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{currentValue.toFixed(2)}</span>{" "}
            </p>
            <p>
              Investment <span>{investment.toFixed(2)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;

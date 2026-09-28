import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import axiosClient from "../api/axiosClient";
import GeneralContext from "./GeneralContext";
import { usePortfolio } from "../context/PortfolioContext";

import "./BuyActionWindow.css";

/**
 * Places a real order against POST /api/orders and reacts to what the
 * backend actually decided:
 *  - 201 -> order executed; refresh the shared portfolio state so
 *    Holdings/Positions/Funds update immediately.
 *  - 422 -> order rejected (insufficient funds on a BUY, insufficient
 *    shares on a SELL); show the reason instead of silently closing, which
 *    is what the original "fire and forget" axios.post did.
 */
const BuyActionWindow = ({ stock, mode }) => {
  const generalContext = useContext(GeneralContext);
  const { refresh } = usePortfolio();

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(stock ? stock.lastPrice : 0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSell = mode === "SELL";

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await axiosClient.post("/orders", {
        name: stock.symbol,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode,
      });
      await refresh();
      generalContext.closeOrderWindow();
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Could not place the order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => generalContext.closeOrderWindow();

  if (!stock) return null;

  const margin = (Number(stockQuantity) * Number(stockPrice) || 0).toFixed(2);

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      {error && <p className="order-error">{error}</p>}

      <div className="buttons">
        <span>{isSell ? "Proceeds" : "Margin required"} ₹{margin}</span>
        <div>
          <Link
            className={isSell ? "btn btn-grey sell-confirm" : "btn btn-blue"}
            onClick={submitting ? undefined : handleSubmit}
          >
            {submitting ? "Placing..." : isSell ? "Sell" : "Buy"}
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;

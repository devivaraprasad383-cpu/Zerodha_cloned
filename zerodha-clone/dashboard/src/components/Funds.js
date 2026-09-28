import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Was a screen of entirely hardcoded numbers. Now reads the user's real
 * wallet (`GET /api/funds`) and "Add funds" actually calls
 * `POST /api/funds/add`, so the balance you see here is the same balance
 * the order-execution engine checks against.
 */
const Funds = () => {
  const { wallet, refresh } = usePortfolio();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!wallet) return null;

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    setError("");
    setSubmitting(true);
    try {
      await axiosClient.post("/funds/add", { amount: value });
      await refresh();
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Could not add funds");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers for your paper-trading wallet</p>
        <form className="add-funds-form" onSubmit={handleAddFunds}>
          <input
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn btn-green" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add funds"}
          </button>
        </form>
        {error && <p className="order-error">{error}</p>}
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available cash</p>
              <p className="imp colored">{wallet.availableCash.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{wallet.usedMargin.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{wallet.openingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;

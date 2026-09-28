import React from "react";
import { Link } from "react-router-dom";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Every order attempt - executed or rejected - is persisted by the backend
 * (see backend/src/services/orderService.js), so this is a real audit
 * trail rather than the static "no orders" placeholder it used to be.
 */
const Orders = () => {
  const { orders } = usePortfolio();

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <h3 className="title">Orders ({orders.length})</h3>
      <div className="order-table">
        <table>
          <tr>
            <th>Time</th>
            <th>Instrument</th>
            <th>Mode</th>
            <th>Qty.</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>{order.name}</td>
              <td className={order.mode === "BUY" ? "profit" : "loss"}>{order.mode}</td>
              <td>{order.qty}</td>
              <td>{order.price.toFixed(2)}</td>
              <td className={order.status === "EXECUTED" ? "profit" : "loss"}>
                {order.status}
                {order.rejectReason ? ` — ${order.rejectReason}` : ""}
              </td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export default Orders;

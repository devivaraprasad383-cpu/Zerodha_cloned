import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openOrderWindow: (_stock, _mode) => {},
  closeOrderWindow: () => {},
});

/**
 * Holds which instrument the order window is open for and whether it's a
 * BUY or a SELL. The original version only supported opening a "buy"
 * window for a bare symbol string with no live price; this now carries the
 * whole instrument (so the window can default the price field to the
 * current LTP) and the trade direction.
 */
export const GeneralContextProvider = (props) => {
  const [isOrderWindowOpen, setIsOrderWindowOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [orderMode, setOrderMode] = useState("BUY");

  const handleOpenOrderWindow = (stock, mode) => {
    setIsOrderWindowOpen(true);
    setSelectedStock(stock);
    setOrderMode(mode);
  };

  const handleCloseOrderWindow = () => {
    setIsOrderWindowOpen(false);
    setSelectedStock(null);
  };

  return (
    <GeneralContext.Provider
      value={{
        openOrderWindow: handleOpenOrderWindow,
        closeOrderWindow: handleCloseOrderWindow,
      }}
    >
      {props.children}
      {isOrderWindowOpen && (
        <BuyActionWindow stock={selectedStock} mode={orderMode} />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;

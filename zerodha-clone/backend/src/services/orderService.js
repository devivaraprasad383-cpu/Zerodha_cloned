const { Order } = require("../models/Order");
const { Holding } = require("../models/Holding");
const { Wallet } = require("../models/Wallet");
const ApiError = require("../utils/ApiError");
const { withTransaction } = require("../utils/withTransaction");
const logger = require("../config/logger");

/**
 * Order execution engine.
 *
 * The original tutorial project's `/newOrder` route just wrote whatever the
 * client posted straight into Mongo — no funds check, no effect on
 * holdings, no way to know if an order actually succeeded. This service
 * makes an order do what it's supposed to do:
 *
 *  BUY:  availableCash must cover qty * price. On success, cash is debited
 *        and the holding's qty/weighted-average-price is updated (or
 *        created).
 *  SELL: the user must hold at least `qty` shares of the instrument. On
 *        success, cash is credited and the holding is reduced (or removed
 *        once it reaches zero).
 *
 * Every attempt — including rejected ones — is persisted as an Order so
 * there's an audit trail, mirroring how a real brokerage never silently
 * drops an order.
 */
async function placeOrder(user, { name, qty, price, mode }) {
  const symbol = name.toUpperCase().trim();

  return withTransaction(async (session) => {
    const opts = session ? { session } : {};

    const wallet = await Wallet.findOne({ user: user._id }, null, opts);
    if (!wallet) {
      throw ApiError.notFound("Wallet not found for user");
    }

    const existingHolding = await Holding.findOne(
      { user: user._id, name: symbol },
      null,
      opts
    );

    if (mode === "BUY") {
      return executeBuy({ user, symbol, qty, price, wallet, existingHolding, opts });
    }
    if (mode === "SELL") {
      return executeSell({ user, symbol, qty, price, wallet, existingHolding, opts });
    }
    throw ApiError.badRequest(`Unsupported order mode: ${mode}`);
  });
}

async function executeBuy({ user, symbol, qty, price, wallet, existingHolding, opts }) {
  const cost = qty * price;

  if (cost > wallet.availableCash) {
    await rejectOrder({ user, symbol, qty, price, mode: "BUY", reason: "Insufficient funds", opts });
    throw ApiError.unprocessable("Insufficient funds to place this order", {
      required: cost,
      available: wallet.availableCash,
    });
  }

  wallet.availableCash -= cost;
  await wallet.save(opts);

  let holding;
  if (existingHolding) {
    const newQty = existingHolding.qty + qty;
    const newAvg =
      (existingHolding.qty * existingHolding.avg + qty * price) / newQty;
    existingHolding.qty = newQty;
    existingHolding.avg = newAvg;
    holding = await existingHolding.save(opts);
  } else {
    holding = await Holding.create([{ user: user._id, name: symbol, qty, avg: price }], opts).then(
      (docs) => (Array.isArray(docs) ? docs[0] : docs)
    );
  }

  const order = await createOrder({ user, symbol, qty, price, mode: "BUY", status: "EXECUTED", opts });
  logger.info(`Order executed: BUY ${qty} ${symbol} @ ${price} for user ${user._id}`);
  return { order, holding, wallet };
}

async function executeSell({ user, symbol, qty, price, wallet, existingHolding, opts }) {
  if (!existingHolding || existingHolding.qty < qty) {
    await rejectOrder({
      user,
      symbol,
      qty,
      price,
      mode: "SELL",
      reason: "Insufficient holdings to sell",
      opts,
    });
    throw ApiError.unprocessable("You don't hold enough shares to place this sell order", {
      requested: qty,
      held: existingHolding ? existingHolding.qty : 0,
    });
  }

  wallet.availableCash += qty * price;
  await wallet.save(opts);

  let holding = null;
  const remainingQty = existingHolding.qty - qty;
  if (remainingQty === 0) {
    await Holding.deleteOne({ _id: existingHolding._id }, opts);
  } else {
    existingHolding.qty = remainingQty;
    holding = await existingHolding.save(opts);
  }

  const order = await createOrder({ user, symbol, qty, price, mode: "SELL", status: "EXECUTED", opts });
  logger.info(`Order executed: SELL ${qty} ${symbol} @ ${price} for user ${user._id}`);
  return { order, holding, wallet };
}

async function createOrder({ user, symbol, qty, price, mode, status, rejectReason, opts }) {
  const docs = await Order.create(
    [{ user: user._id, name: symbol, qty, price, mode, status, rejectReason }],
    opts
  );
  return Array.isArray(docs) ? docs[0] : docs;
}

async function rejectOrder({ user, symbol, qty, price, mode, reason, opts }) {
  return createOrder({ user, symbol, qty, price, mode, status: "REJECTED", rejectReason: reason, opts });
}

module.exports = { placeOrder };

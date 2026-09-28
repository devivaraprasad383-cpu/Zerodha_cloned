const mongoose = require("mongoose");
const logger = require("../config/logger");

/**
 * Runs `fn` inside a MongoDB multi-document transaction so an order
 * execution (deduct cash + upsert holding + write order record) is atomic.
 *
 * Transactions require a replica set, which a bare single-node `mongod`
 * (the common local/dev setup) does not provide. Rather than force every
 * contributor to run a replica set locally, this falls back to running the
 * same function without a session — documented tradeoff, not a silent bug.
 */
async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (err) {
    const unsupported =
      /Transaction numbers|IllegalOperation|replica set/i.test(
        err.message || ""
      );
    if (unsupported) {
      logger.warn(
        "MongoDB transactions unsupported on this deployment (standalone node); " +
          "falling back to a non-transactional execution path."
      );
      return fn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { withTransaction };

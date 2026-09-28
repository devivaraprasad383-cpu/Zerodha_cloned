/**
 * Small helpers so every endpoint replies with the same envelope shape,
 * which keeps the frontend's response handling uniform.
 */
const ok = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const created = (res, data) => ok(res, data, 201);

module.exports = { ok, created };

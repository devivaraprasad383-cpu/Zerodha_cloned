const asyncHandler = require("../utils/asyncHandler");
const { created, ok } = require("../utils/apiResponse");
const authService = require("../services/authService");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register({ name, email, password });
  created(res, { user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  ok(res, { user, token });
});

const me = asyncHandler(async (req, res) => {
  ok(res, { user: req.user });
});

module.exports = { signup, login, me };

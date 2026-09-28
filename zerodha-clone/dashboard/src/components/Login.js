import "./Auth.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { setSession } from "../auth/authStorage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      setSession(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Kite</h2>
        {error && <p className="auth-error">{error}</p>}
        <fieldset>
          <legend>Email</legend>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </fieldset>
        <fieldset>
          <legend>Password</legend>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>
        <button className="btn btn-blue" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="auth-hint">
          Don't have an account? <a href="/signup">Sign up</a>.
        </p>
        <p className="auth-hint">
          Demo login: <code>demo@zerodha.local</code> / <code>Demo@1234</code>{" "}
          (after running <code>npm run seed</code> on the backend)
        </p>
      </form>
    </div>
  );
};

export default Login;

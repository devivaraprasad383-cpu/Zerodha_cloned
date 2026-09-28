import "./Auth.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { setSession } from "../auth/authStorage";

const Signup = () => {
  const [name, setName] = useState("");
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
      const res = await axiosClient.post("/auth/signup", { name, email, password });
      const { token, user } = res.data.data;
      setSession(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      const details = err.response?.data?.error?.details;
      setError(
        (details && details.map((d) => d.message).join(", ")) ||
          err.response?.data?.error?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create your Kite account</h2>
        {error && <p className="auth-error">{error}</p>}
        <fieldset>
          <legend>Name</legend>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </fieldset>
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
          <legend>Password (min. 8 characters)</legend>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>
        <button className="btn btn-blue" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
        <p className="auth-hint">
          Every new account starts with a ₹1,00,000 paper-trading wallet.
        </p>
        <p className="auth-hint">
          Already have an account? <a href="/login">Log in</a>.
        </p>
      </form>
    </div>
  );
};

export default Signup;

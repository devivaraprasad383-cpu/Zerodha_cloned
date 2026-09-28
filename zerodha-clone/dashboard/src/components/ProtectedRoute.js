import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../auth/authStorage";

/**
 * Gate around the trading dashboard. The original app rendered the same
 * shared data for anyone who opened it; now every route below this one
 * requires a valid session, and an unauthenticated visitor is bounced to
 * /login with the page they wanted preserved for after they sign in.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;

// src/auth/RequireAuth.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  // Wait for Firebase to resolve auth state before doing anything
  if (loading) return null;

  // If user is not logged in, silently redirect to login
  if (!user) {
    console.log("🚫 RequireAuth: no user, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
}

export default RequireAuth;

import React from "react";

export default function ProtectedRoute({
  children,
  user,
  requiredRole,
}) {
  const token = localStorage.getItem("kapilai_token");

  // User login nahi hai
  if (!token || !user) {
    return null;
  }

  // Agar specific role required hai
  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    return null;
  }

  return children;
}

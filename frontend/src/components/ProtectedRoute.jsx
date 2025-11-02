import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute({ children, requireAdmin = false, requireEditor = false }) {
  const { user } = useAuthStore();

  if (!user) {
    // redirect to login if no user
    return <Navigate to="/login" replace />;
  }

  // admin stuff
  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // editor stuff
  if (requireEditor && !["admin", "editor"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import authContext from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useContext(authContext);
  const token = localStorage.getItem('access_token');

  // Check if user is authenticated - if not, go to landing page
  if (!user && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
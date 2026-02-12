import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear logged-in user
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login", { replace: true });
  }, [navigate]);

  return null; // No UI needed, instantly redirects
}

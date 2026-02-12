import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user"); // Clear logged-in user
    navigate("/login"); // Redirect to login
  }, [navigate]);

  return null; // No UI needed
}

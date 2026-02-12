import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import supabase from "../createClients";

export default function Login({ setUser }) { // <-- receive setUser from App.js
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      return Swal.fire("Error", "Please enter username and password", "error");
    }

    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("username", username.trim())
        .single();

      if (error || !data) return Swal.fire("Error", "User not found", "error");
      if (data.password !== password) return Swal.fire("Error", "Wrong password", "error");

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // Update App.js state
      if (setUser) setUser(data);

      Swal.fire("Success", "Logged in!", "success").then(() => {
        navigate("/dashboard"); // redirect to dashboard
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}

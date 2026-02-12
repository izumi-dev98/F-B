import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import supabase from "../createClients"; // make sure this points to your Supabase client

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Trim and normalize username/password
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return Swal.fire("Error", "Please enter username and password", "error");
    }

    try {
      // Supabase query with case-insensitive match
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .ilike("username", trimmedUsername) // case-insensitive
        .single();

      if (error || !data) {
        return Swal.fire("Error", "User not found", "error");
      }

      // Plain password check (for production, use hashing!)
      if (data.password !== trimmedPassword) {
        return Swal.fire("Error", "Incorrect password", "error");
      }

      // Save user in localStorage
      localStorage.setItem("user", JSON.stringify(data));

      Swal.fire("Success", `Welcome ${data.full_name}!`, "success");

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong. Try again.", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">POS System Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}

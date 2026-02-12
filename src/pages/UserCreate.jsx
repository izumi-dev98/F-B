import { useState } from "react";
import Swal from "sweetalert2";
import supabase from "../createClients";

export default function UserCreate() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!fullName || !username || !password) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ full_name: fullName, username, password, role }])
        .select()
        .single();

      if (error) return Swal.fire("Error", error.message, "error");

      Swal.fire("Success", `User ${data.username} created!`, "success");
      setFullName("");
      setUsername("");
      setPassword("");
      setRole("user");
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Create New User</h2>
      <form onSubmit={handleCreateUser} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="chief">Chief</option>
          <option value="user">User</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Create User
        </button>
      </form>
    </div>
  );
}

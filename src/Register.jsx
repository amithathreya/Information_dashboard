import React, { useState } from "react";

const URL = "http://localhost:8080";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! You can now log in.");
        setUsername("");
        setPassword("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error connecting to server.");
      console.error(error);
    }
  };

  return (
    <div>
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl m-2 p-4 text-center text-2xl font-bold shadow-md">
        <h1>USER REGISTRATION</h1>
      </header>
      <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-gray-100">
        <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md flex flex-col w-72">
          <h2 className="mb-5 text-center text-xl text-gray-800 font-semibold">Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded"
            required
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-md cursor-pointer text-lg hover:bg-blue-700 transition-colors">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;

import React, { useState } from "react";


function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://1d8d4083b703.ngrok-free.app/login", { // temporaryy ngrok link
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
        const data = await response.json();
      if (response.ok) {
        alert(`Welcome ${username}! Login successful`);
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
      {/* Header at the top */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl m-2 p-4 text-center text-2xl font-bold shadow-md">
        <h1>STUDENT PORTAL</h1>
      </header>

      {/* Container for form */}
      <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md flex flex-col w-72">
          <h2 className="mb-5 text-center text-xl text-gray-800 font-semibold">Student Login</h2>
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

          <button type="submit" className="p-2 bg-green-600 text-white rounded-md cursor-pointer text-lg hover:bg-green-700 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}



export default StudentLogin;

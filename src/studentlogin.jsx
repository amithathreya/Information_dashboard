import React, { useState } from "react";


function StudentLogin() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Welcome ${name}! ID Verified`);
    console.log("Student Name:", name);
    console.log("Student ID:", studentId);
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
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="text"
            placeholder="Enter your student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
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

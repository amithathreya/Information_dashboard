"use client";
import { useState } from "react";
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
const API_URL = "http://localhost:8080";

interface StudentLoginProps {
  onAdminClick: () => void;
}

function StudentLogin({ onAdminClick }: StudentLoginProps) {
  const [USN, setUSN] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  // Removed name, department, academicYear fields
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Registration mode (USN and password only)
        const response = await fetch(`${API_URL}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            USN,
            password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Registration successful! Please login.");
          setIsRegister(false);
        } else {
          alert(data.message || "Registration failed");
        }
      } else {
        // Login mode
        const response = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ USN, password }),
        });
        const data = await response.json();
        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usn', USN);
          router.push('/dashboard');
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      alert("Error connecting to server.");
      console.error(error);
    }
  };

  return (
    <AuroraBackground variant="light">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 text-slate-900"
      >
        <div className="flex-col items-center text-slate-900">
      {/* Header bar */}
      <header className="w-full text-center py-3">
        <h1 className="text-3xl font-bold mt-20">STUDENT LOGIN </h1>
      </header>
      <div className="w-full flex justify-center mt-8 py-40 ">
        <div className="w-104 h-65 p-8 rounded-xl bg-white/70 backdrop-blur-md text-slate-900">
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              className="mb-4 h-15"
              placeholder="USN"
              value={USN}
              onChange={(e) => setUSN(e.target.value)}
              required
            />
            <Input
              type="password"
              className="mb-4 h-15 rounded-md p-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* No extra fields for registration */}
            <Button
              className="w-full p-2 py-5 bg-green-600 text-white rounded-md cursor-pointer text-lg hover:bg-green-700 transition-colors duration-300"
              size="lg"
              type="submit"
            >
              {isRegister ? "Register" : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              className="underline"
              onClick={() => setIsRegister((prev) => !prev)}
            >
              {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
            </Button>
          </div>
        </div>
      </div>
    </div>
      </motion.div>
    </AuroraBackground>
  );
}

export default StudentLogin;

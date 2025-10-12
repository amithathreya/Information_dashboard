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
    const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
  const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ USN, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        // alert(`Welcome ${USN}! Login successful`);
        router.push('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error connecting to server.");
      console.error(error);
    }
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 text-white"
      >
        <div className="flex-col items-center text-white">
      {/* Header bar */}
      <header className="w-full text-center py-3 text-white">
        <h1 className="text-3xl font-bold mt-20 text-white">STUDENT LOGIN </h1>
      </header>
      <div className="w-full flex justify-center mt-8 py-40 ">
        <div className="w-104 h-65 p-8 rounded-xl bg-black/30 backdrop-blur-md opacity-70 text-white">
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              className="mb-4 h-15 text-white placeholder-white"
              placeholder="USN"
              value={USN}
              onChange={(e) => setUSN(e.target.value)}
              required
            />
            <Input
              type="password"
              className="mb-4 h-15 rounded-md p-2 text-white placeholder-white"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              className="w-full p-2 py-5 bg-green-600 text-white rounded-md cursor-pointer text-lg hover:bg-green-900 transition-colors duration-300"
              size="lg"
              type="submit"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
      </motion.div>
    </AuroraBackground>
  );
}

export default StudentLogin;

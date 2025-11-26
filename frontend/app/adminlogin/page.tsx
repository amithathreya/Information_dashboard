"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";

const API_URL = "http://localhost:8080";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await fetch(`${API_URL}/admin/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ username, password }),
        })
        const body = await res.json().catch(() => ({}))
        if (res.status === 201) {
          alert(body.message || "Admin registered")
          setIsRegister(false)
        } else {
          alert(body.message || `Register failed (${res.status})`)
        }
        return
      }

      // Login flow
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.token) {
        // backend now returns { message, token, redirect }
        localStorage.setItem("token", data.token);
        localStorage.setItem("admin", "1");
        // prefer backend-provided redirect if present
        const redirect = data.redirect || "/admin";
        if (data.message) console.info(data.message)
        router.push(redirect);
      } else {
        alert(data.message || "Login failed");
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
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 text-slate-900"
      >
        <div className="flex-col items-center text-slate-900">
          <header className="w-full text-center py-3">
            <h1 className="text-3xl font-bold mt-20">ADMIN LOGIN</h1>
          </header>
          <div className="w-full flex justify-center mt-8 py-40 ">
            <div className="w-104 h-65 p-8 rounded-xl bg-white/70 backdrop-blur-md text-slate-900">
              <form onSubmit={handleSubmit}>
                <Input
                  type="text"
                  className="mb-4 h-15"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <Button
                  className="w-full p-2 py-5 bg-green-600 text-white rounded-md cursor-pointer text-lg hover:bg-green-700 transition-colors duration-300"
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

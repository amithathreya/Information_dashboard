"use client";
import React from "react";
import { Vortex } from "@/components/ui/vortex"; // adjust import path as needed

export default function MainPage() {
  return (
    <Vortex backgroundColor="#000000ff" particleCount={1000}>
      <div className="relative z-10 flex flex-col items-center justify-center h-screen">
        <h1 className="text-5xl font-bold text-white">Welcome to My Site</h1>
        <p className="text-lg text-gray-200 mt-4">With a stunning Vortex background!</p>
      </div>
    </Vortex>
  );
}

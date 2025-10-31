import React from "react";
import { config } from 'dotenv';
import SignForm from "@/components/auth/SignForm";

config();

export default function Home() {
  return (
    <main className="flex h-screen w-h-screen text-base">
      <div className="flex-1 bg-ping-pong bg-cover bg-no-repeat">
      </div>
      <SignForm/>
    </main>
  );
}

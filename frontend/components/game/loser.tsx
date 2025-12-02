"use client";

import React from "react";
import Image from "next/image";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import socket from "@/components/socketG";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface prop {
  setWon: (val: string) => void;
  setLost: (val: string) => void;
  me: string;
  other: string;
}

export default function Lost({ setWon, setLost, me, other }: prop) {
  const router = useRouter();
  const [event, setEvent] = useState<string>("retry-game");
  const [senderName, setSenderName] = useState<string>(me);
  const [senderSocketId, setSenderSocketId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(30); // Increased time for online interaction
  const [retry, setRetry] = useState<string>("Retry Challenge");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
            clearInterval(timer);
            // Auto-leave only if no challenge is pending/accepted
            if (event !== "accept-retry" && retry !== "Challenge Sent...") {
                router.push("/game");
            }
            return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [router, event, retry]);

  // Use off before on to prevent double-listening
  socket.off("refresh-page");
  socket.on("refresh-page", () => {
    setWon("");
    setLost("");
  });

  socket.off("retry-game");
  socket.on("retry-game", (data: any) => {
    setSenderName(data.sender);
    setSenderSocketId(data.senderSocketId);
    setEvent("accept-retry");
    setRetry("Accept Retry?");
  });

  const { data, isLoading } = useQuery({
    queryKey: ["user", "me_online_lost"],
    queryFn: async () => {
      const { data } = await axios.get("/users/me");
      return data;
    },
  });
  
  if (isLoading) return <div className="grid place-content-center h-full w-full text-white text-3xl bg-gray-900">Loading...</div>;

  return (
    <main className="h-full w-full grid place-content-center p-4 sm:p-0 bg-gray-900/90">
      <div className="flex flex-col items-center gap-6 sm:gap-10 p-6 sm:px-16 sm:py-16 bg-gray-800/80 backdrop-blur-lg shadow-[0_0_50px_rgba(252,79,79,0.5)] rounded-3xl border-4 border-[#fc4f4f]">
        
        <h1 className="text-7xl sm:text-8xl font-black text-[#fc4f4f] drop-shadow-lg animate-bounce">
          DEFEAT
        </h1>
        
        <p className="text-xl text-gray-300">You lost the match. Better luck next time!</p>

        <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-8 border-gray-600 shadow-2xl">
          <Image
            width={400}
            height={400}
            alt="Your Avatar"
            src={data.avatar}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 w-full justify-center">
          
          <button
            className="font-extrabold text-xl sm:text-2xl bg-[#fc4f4f] text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-[#d63a3a] hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50"
            onClick={() => {
              if (event === "retry-game") {
                 setRetry("Challenge Sent...");
              }
              socket.emit(event, {
                senderUsername: senderName,
                reciever: other,
                senderSocketId: socket.id, // Use the actual socket ID
              });
            }}
            disabled={event === "retry-game" && retry === "Challenge Sent..."}
          >
            {retry}
          </button>
          
          <button
            className="font-extrabold text-xl sm:text-2xl bg-gray-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-700 hover:shadow-2xl hover:scale-105 active:scale-95"
            onClick={() => {
              router.push("/game");
            }}
            disabled={timeLeft <= 0 && event !== "accept-retry"}
          >
            Leave ({timeLeft}s)
          </button>
        </div>
      </div>
    </main>
  );
}
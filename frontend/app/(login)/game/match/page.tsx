"use client";

import { useEffect, useState } from "react";
import { LoadingPlayer, LeftPlayer } from "@/components/game/PlayersMatch";
import socket from "@/components/socketG";
import axios from "@/lib/axios";
import Game from "@/components/game/fullGame";
import { useRouter } from "next/navigation";
import { Zap, HeartPulse } from "lucide-react";

export default function MatchPlayers() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>("");
  const [isPlayerFetched, setIsPlayerFetched] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Authenticating...");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/users/me");
        if (data && data.id != null) {
          setPlayerId(data.id.toString());
          setLoadingStatus("Player identity confirmed.");
          setIsPlayerFetched(true);
        } else {
            setLoadingStatus("Error: Could not fetch user ID.");
        }
      } catch (error) {
        setLoadingStatus("Error: Failed to connect to user service.");
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isPlayerFetched || !playerId) return;

    setLoadingStatus("Checking current match status...");
    socket.emit("player-status", playerId);

    const onPlayerStatus = (status: string) => {
      if (status === "not-looking") {
        setLoadingStatus("Status free. Looking for a new opponent...");
        socket.emit("looking-for-match", playerId);
      } else {
        setLoadingStatus("Rejoining existing game...");
        setGameStart(true);
      }
    };
    socket.on("player-status", onPlayerStatus);
    
    const onGameStart = (opponentId: string) => {
        setLoadingStatus(`Match found! Opponent ID: ${opponentId}. Starting game...`);
        setGameStart(true);
    };
    socket.on("game-start", onGameStart);


    return () => {
      socket.off("player-status", onPlayerStatus);
      socket.off("game-start", onGameStart);
    };
  }, [isPlayerFetched, playerId]);

  if (gameStart && isPlayerFetched) {
    return <Game meId={playerId} />;
  }

  // Matchmaking / Loading Screen
  return (
    <main className="min-h-screen grid place-content-center pt-16 pb-16 bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-12 p-8 sm:p-16 bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center">
            <div className="flex items-center justify-center mb-3">
                <HeartPulse size={36} className="text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
              Searching for Match
            </h1>
            <p className="text-gray-400 text-lg font-mono">
              Status: {loadingStatus}
            </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row items-center justify-center w-full">
            <LeftPlayer />
            <div className="relative flex items-center justify-center w-24 h-24 sm:h-auto sm:w-auto p-4">
                <Zap size={64} className="text-blue-500/50 absolute z-0 animate-pulse" />
                <h1 className="text-6xl font-black text-white z-10 drop-shadow-lg">
                    VS
                </h1>
            </div>

            <LoadingPlayer setGame={setGameStart} />
        </div>

        <button
          className="mt-4 flex gap-2 items-center text-lg bg-red-600 hover:bg-red-700 py-3 px-8 rounded-full font-bold text-white transition-all transform hover:scale-[1.03] shadow-xl shadow-red-600/40"
          onClick={() => {
             router.push("/game");
          }}
        >
          Cancel Search
        </button>
      </div>
    </main>
  );
}

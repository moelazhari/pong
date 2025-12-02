"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import socket from "@/components/socketG";

// Components
import PlayersScore from "@/components/game/score";
import Won from "@/components/game/winner";
import Lost from "@/components/game/loser";
import DefaultGame from "./defaultGame";
import FootGame from "./footGame";
import DisapGame from "./disapearGame";

interface Props {
  meId: string;
}

interface PlayerState {
  left: string;
  right: string;
}

// Helper hook for handling responsive scaling
const useGameScale = () => {
  const [scale, setScale] = useState({ sx: 1, sy: 1 });
  const CANVAS_W = 1700;
  const CANVAS_H = 900;

  useEffect(() => {
    let timeoutId: number;

    const updateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight - 100; // Account for score/buttons padding

      // Calculate scale factor based on container size
      const scaleFactor = Math.min(windowWidth / CANVAS_W, windowHeight / CANVAS_H);

      // Clamp scale between 0.5 and 1.0 to prevent massive upscaling or overly small rendering
      const clampedScale = Math.max(0.5, Math.min(1.0, scaleFactor));
      
      setScale({
        sx: clampedScale,
        sy: clampedScale,
      });
    };

    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateScale, 200);
    };

    updateScale(); // Initial call
    window.addEventListener("resize", onResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return scale;
};

export default function Game({ meId }: Props) {
  const router = useRouter(); // Using mock router
  const { sx, sy } = useGameScale();

  // Game State
  const [players, setPlayers] = useState<PlayerState>({ left: "", right: "" });
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState(""); 
  const [roomId, setRoomId] = useState("");
  const [map, setMap] = useState("default");
  
  // Countdown State
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false); // Start hidden until room is ready

  // Refs for data accessed inside Event Listeners (prevents stale closures)
  const playersRef = useRef<PlayerState>({ left: "", right: "" });
  const countdownIntervalRef = useRef<number | undefined>(undefined);

  // 1. Socket Initialization
  useEffect(() => {
    socket.emit("full-Game", meId);

    const onGameInfo = (data: any) => {
      const newPlayers = { left: data.leftPlayer, right: data.rightPlayer };
      setPlayers(newPlayers);
      playersRef.current = newPlayers; // Update ref for other listeners
      
      setRoomId(data.room);
      const savedMap = localStorage.getItem("map") || "default"; // Default map if none saved
      setMap(savedMap);
      setShowCountdown(true); // Show countdown once game info is ready
    };

    const onScore = (data: { leftScore: number; rightScore: number }) => {
      setScores({ left: data.leftScore, right: data.rightScore });
    };

    const onWinner = (side: string) => {
      const currentPlayers = playersRef.current;
      const winnerName = side === "left" ? currentPlayers.left : currentPlayers.right;
      setWinner(winnerName);
    };

    socket.on("game-info", onGameInfo);
    socket.on("score", onScore);
    socket.on("winner", onWinner);

    return () => {
      socket.off("game-info", onGameInfo);
      socket.off("score", onScore);
      socket.off("winner", onWinner);
    };
  }, [meId]);

  // 2. Countdown Logic
  useEffect(() => {
    if (!showCountdown || roomId === "") return; // Only run if room is ready

    if (countdown > 0) {
      // Clear any existing interval before starting a new one
      if (countdownIntervalRef.current !== undefined) {
        clearInterval(countdownIntervalRef.current);
      }
      
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [countdown, showCountdown, roomId]); // Depend on showCountdown/roomId to start

  // 3. Handlers
  const handleLeave = () => {
    socket.emit("leave-game", { room: roomId, player: meId });
    router.push("/game");
  };

  // Determine Game Over State
  const isGameOver = winner !== "";
  const didIWin = winner === meId;
  const otherPlayerName = meId === players.right ? players.left : players.right;

  // Render the appropriate map component
  const renderGameCanvas = () => {
    if (!roomId) return null; // Wait for room info

    switch (map) {
      case "football-mode":
        return <FootGame roomid={roomId} me={meId} RightPlayer={players.right} />;
      case "space-mode":
        return <DisapGame roomid={roomId} me={meId} RightPlayer={players.right} />;
      case "default":
      default:
        return <DefaultGame roomid={roomId} me={meId} RightPlayer={players.right} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      
      {/* GAME OVER STATE */}
      {isGameOver && (
        <div className="flex items-center justify-center min-h-screen w-full">
          {didIWin ? (
            <Won setWon={setWinner} me={meId} other={otherPlayerName} />
          ) : (
            <Lost setWon={setWinner} me={meId} other={otherPlayerName} />
          )}
        </div>
      )}

      {/* GAME IN PROGRESS STATE */}
      {!isGameOver && players.left && players.right && (
        <div className="flex flex-col items-center gap-6 w-full max-w-7xl">
          
          {/* Scoreboard Area */}
          <PlayersScore
            left={scores.left}
            right={scores.right}
            leftPlayer={players.left}
            rightPlayer={players.right}
            currentUserId={meId}
          />

          {/* Canvas Area with Scale */}
          <div 
            className="relative transition-transform duration-300"
            style={{ transform: `scale(${sx}, ${sy})`, transformOrigin: 'top center' }}
          >
            {/* Dramatic Countdown Overlay */}
            {showCountdown && countdown > 0 && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 rounded-xl">
                <p className="font-black text-white text-9xl sm:text-[150px] animate-pulse drop-shadow-neon" style={{'--tw-drop-shadow': '0 0 10px #fff'}}>
                  {countdown}
                </p>
              </div>
            )}
            
            {/* Game Canvas */}
            {renderGameCanvas()}
          </div>

          {/* Leave Button */}
          <button
            className="mt-6 px-8 py-3 text-lg font-bold text-white bg-red-600 rounded-full shadow-lg shadow-red-600/40 hover:bg-red-700 transition-colors transform hover:scale-105"
            onClick={handleLeave}
          >
            Forfeit Match
          </button>
        </div>
      )}
    </main>
  );
}
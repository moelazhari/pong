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

  useEffect(() => {
    let timeoutId: number;

    const updateScale = () => {
      const canvasWidth = 1750;
      const canvasHeight = 1200;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scaleFactor = Math.min(windowWidth / canvasWidth, windowHeight / canvasHeight);

      setScale({
        sx: scaleFactor > 1 ? 1 : scaleFactor * 0.95,
        sy: scaleFactor > 0.95 ? 1 : scaleFactor * 0.85,
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
  const router = useRouter();
  const { sx, sy } = useGameScale();

  // Game State
  const [players, setPlayers] = useState<PlayerState>({ left: "", right: "" });
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState(""); 
  const [roomId, setRoomId] = useState("");
  const [map, setMap] = useState("default");
  
  // Countdown State
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

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
      const savedMap = localStorage.getItem("map");
      if (savedMap) setMap(savedMap);
    };

    const onScore = (data: { leftScore: number; rightScore: number }) => {
      setScores({ left: data.leftScore, right: data.rightScore });
    };

    const onWinner = (side: string) => {
      // Use ref to get the most current player names without adding 'players' to dependency array
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
    if (countdown > 0) {
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setShowCountdown(false);
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [countdown]);

  // 3. Handlers
  const handleLeave = () => {
    socket.emit("leave-game", { room: roomId, player: meId });
    router.push("/game");
  };

  // 4. Reset Logic (Passed to Won/Lost components if they allow re-match)
  const resetGameUI = () => {
    setWinner("");
    // Add any other reset logic here if needed
  };

  // Determine Game Over State
  const isGameOver = winner !== "";
  const didIWin = winner === meId;
  const otherPlayerName = meId === players.right ? players.left : players.right;

  return (
    <main className="w-full h-full grid place-content-center pt-14">
      
      {/* GAME IN PROGRESS */}
      {!isGameOver && (
        <div
          className="flex flex-col gap-8 p-16 sm:bg-white sm:bg-opacity-20 sm:backdrop-blur-lg sm:drop-shadow-lg sm:rounded-3xl"
          style={{ transform: `scale(${sx}, ${sy})` }}
        >
          {players.left && players.right && (
            <PlayersScore
              left={scores.left}
              right={scores.right}
              leftPlayer={players.left}
              rightPlayer={players.right}
              currentUserId={meId}
            />
          )}

          <div className="relative">
            {showCountdown && scores.left === 0 && scores.right === 0 && (
              <p className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 font-bold text-[#f6f6f6] z-10 text-[90px] mb-[150px]">
                {countdown}
              </p>
            )}

            {map === "default" && (
              <DefaultGame roomid={roomId} me={meId} RightPlayer={players.right} />
            )}
            {map === "football-mode" && (
              <FootGame roomid={roomId} me={meId} RightPlayer={players.right} />
            )}
            {map === "space-mode" && (
              <DisapGame roomid={roomId} me={meId} RightPlayer={players.right} />
            )}
          </div>

          <button
            className="ml-auto mt-10 text-white text-[20px] bg-red w-[150px] h-[40px] rounded-[10px] hover:bg-[#FBACB3] transition-colors"
            onClick={handleLeave}
          >
            Leave
          </button>
        </div>
      )}

      {/* GAME OVER - Renders ONLY one of these */}
      {isGameOver && (
        didIWin ? (
          <Won 
            setLost={() => {}} // Won component likely doesn't need to set lost, passing no-op or adjust based on component definition
            setWon={setWinner} 
            me={meId} 
            other={otherPlayerName} 
          />
        ) : (
          <Lost 
            setLost={() => {}} 
            setWon={setWinner} 
            me={meId} 
            other={otherPlayerName} 
          />
        )
      )}
    </main>
  );
}
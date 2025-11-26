"use client";

import { LoadingPlayer, LeftPlayer } from "@/components/game/PlayersMatch";
import { useEffect, useState } from "react";
import socket from "@/components/socketG";
import axios from "@/lib/axios";
import Game from "@/components/game/fullGame";

export default function MatchPlayers() {
  const [playerId, setPlayerId] = useState<string>("");
  const [isPlayerFetched, setIsPlayerFetched] = useState(false);
  const [gameStart, setGameStart] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/users/me");
        if (data && data.id != null) {
          setPlayerId(data.id.toString());
          setIsPlayerFetched(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!isPlayerFetched || !playerId) return;

    socket.emit("player-status", playerId);

    const onPlayerStatus = (status: string) => {
      if (status === "not-looking") {
        socket.emit("looking-for-match", playerId);
      } else {
        setGameStart(true);
      }
    };
    socket.on("player-status", onPlayerStatus);


    return () => {
      socket.off("player-status", onPlayerStatus);
    };
  }, [isPlayerFetched, playerId]);

  if (!gameStart) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen gap-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <main className="pt-[56px] sm:p-10 sm:pt-[96px]">
          <div className="flex flex-col gap-8 sm:flex-row bg-white/5 backdrop-blur-xl items-center justify-between p-8 rounded-2xl border border-white/10">
            <LeftPlayer />
            <h1 className="text-5xl font-bold text-white">VS</h1>
            <LoadingPlayer setGame={setGameStart} />
          </div>
        </main>
      </div>
    );
  }

  if (gameStart && isPlayerFetched) {
    return <Game meId={playerId} />;
  }

  return null;
}

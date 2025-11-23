"use client";
import Image from "next/image";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import socket from "@/components/socketG";
import useCloseOutSide from "@/hookes/useCloseOutSide";

interface ChallengeDropdownProps {
  userId: number;
  onClose: () => void;
}

const GAME_MAPS = [
  {
    id: "football-mode",
    name: "Football",
    image: "/game/football-map-select.webp",
  },
  {
    id: "space-mode",
    name: "Space",
    image: "/game/space-map-select.webp",
  },
  {
    id: "default",
    name: "Ping Pong",
    image: "/game/default-map-select.webp",
  },
];

export default function ChallengeDropdown({ userId, onClose }: ChallengeDropdownProps) {
  const { divref } = useCloseOutSide({ setIsOpen: onClose });

  const handleSelectMap = (mapId: string) => {
    localStorage.setItem("map", mapId);
    
    socket.emit("invite-friend", {
      receiverId: userId,
      map: mapId,
    });
    
    toast.success("Challenge sent!");
    onClose();
  };

  return (
    <div
      ref={divref}
      className="absolute right-0 top-full mt-2 flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl p-4 z-50 min-w-[220px] border border-white/20"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-blue font-semibold">Choose Map</h3>
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {GAME_MAPS.map((map) => (
          <button
            key={map.id}
            className="flex gap-3 items-center bg-white/10 backdrop-blur-sm rounded-xl p-2 hover:bg-white/20 transition-all"
            onClick={() => handleSelectMap(map.id)}
          >
            <div className="rounded-full h-10 w-10 overflow-hidden flex-shrink-0">
              <Image
                className="h-full w-full object-cover"
                src={map.image}
                width={40}
                height={40}
                alt={map.name}
              />
            </div>
            <span className="font-medium text-white">{map.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import socket from "@/components/socketG";
import axios from "@/lib/axios";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";

interface InviteData {
  senderId: number;
  senderSocketId: string;
  senderUsername: string;
  senderAvatar: string;
  map: string;
}

interface InviteDisplayProps {
  invite: InviteData;
  onClose: () => void;
}

const InviteDisplay = ({ invite, onClose }: InviteDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState(1500);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft <= 0) {
      handleDecline();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 10);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAccept = () => {
    localStorage.setItem("map", invite.map);
    
    socket.emit("accept-invitation", { 
      senderUserId: invite.senderId,
      senderSocketId: invite.senderSocketId 
    });
    
    toast.success(`Joining game with ${invite.senderUsername}...`);
    onClose();
  };

  const handleDecline = () => {
    socket.emit("decline-invitation", { 
        senderUserId: invite.senderId,
        senderSocketId: invite.senderSocketId 
    });
    toast("You declined the game invitation", { icon: "👎" });
    onClose();
  };
  
  const getMapName = (map: string) => {
    switch (map) {
      case 'default':
        return 'Classic Pong';
      case 'football-mode':
        return 'Football Field';
      case 'cosmic':
        return 'Cosmic Arena';
      default:
        return 'Unknown Map';
    }
  };
  
  const mapName = getMapName(invite.map);
  const progressPercent = (timeLeft / 1500) * 100;

  return (
    <div className="fixed right-4 bottom-4 z-50 w-full max-w-sm animate-slide-in">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-900/60 rounded-xl p-4 text-white transition-all duration-300">
        
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <Gamepad2 size={24} className="text-blue-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white">Game Invite</h3>
            </div>
            <span className={`text-sm font-mono transition-colors duration-500 ${timeLeft < 500 ? 'text-red-400 animate-wiggle' : 'text-gray-300'}`}>
              {Math.ceil(timeLeft / 100)}s left
            </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Image 
            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 shadow-md" 
            src={invite.senderAvatar || "https://placehold.co/64x64/1e293b/ffffff?text=U"}
            width={64}
            height={64}
            alt={`${invite.senderUsername}'s avatar`}
          />
          <div className="text-left">
            <p className="text-base text-gray-300">
              <span className="font-extrabold text-blue-300">{invite.senderUsername}</span> invites you to play on the <span className="font-bold text-yellow-400">{mapName}</span> map!
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button 
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 text-base font-semibold transition-all duration-200 shadow-lg shadow-red-600/30 ring-2 ring-red-500/50 hover:ring-red-500 active:scale-[0.98]" 
            onClick={handleDecline}
          >
            Decline
          </button>
          <button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg px-4 py-2 text-base font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50 hover:ring-emerald-400 active:scale-[0.98]" 
            onClick={handleAccept}
          >
            Accept & Join
          </button>
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-700 rounded-full mt-2 overflow-hidden shadow-inner">
        <div
          className="absolute bg-green-400 h-full rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

const Invite = () => {
  const [invite, setInvite] = useState<InviteData | null>(null);
  const router = useRouter();

  useEffect(() => {
    socket.off("play-a-friend");
    socket.on("play-a-friend", () => {
      console.log('✅ play-a-friend event received. Starting game...');
      toast.success("Game starting!");
      setInvite(null);
      router.push("/game/match");
    });

    socket.off("game-invitation");
    socket.on("game-invitation", async (data: { 
      senderId: number; 
      senderSocketId: string;
      map: string;
    }) => {
      console.log('=== INVITATION RECEIVED ===');

      try {
        const response = await axios.get(`/users/${data.senderId}`);
        const sender = response.data;

        const inviteData: InviteData = {
          senderId: data.senderId,
          senderSocketId: data.senderSocketId,
          senderUsername: sender.username || `User ${data.senderId}`,
          senderAvatar: sender.avatar,
          map: data.map,
        };

        setInvite(inviteData);
        toast(`${inviteData.senderUsername} invited you to play!`, {
          icon: "🎮",
          duration: 15000,
        });
      } catch (error) {
        console.error("Failed to fetch sender data:", error);
        toast.error("Failed to load game invitation");
      }
    });

    socket.off("error");
    socket.on("error", (error: { message: string }) => {
      console.error('Socket error:', error);
      toast.error(error.message);
    });

    return () => {
      socket.off("game-invitation");
      socket.off("play-a-friend");
      socket.off("error");
    };
  }, [router]);

  return (
    <>
      {invite && (
        <InviteDisplay 
          key={invite.senderId}
          invite={invite} 
          onClose={() => setInvite(null)} 
        />
      )}
    </>
  );
};

export default Invite;
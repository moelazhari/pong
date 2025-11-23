'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import socket from "@/components/socketG";
import axios from "@/lib/axios";
import Image from "next/image";

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
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleDecline();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 0.01);
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
    toast("You declined the game invitation", { icon: "👎" });
    onClose();
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 animate-slide-in">
      <div className="flex mt-1 justify-between bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl gap-2 sm:gap-8 shadow-lg border border-white/30">
        <div className="flex items-center gap-4">
          <Image 
            className="w-12 h-12 rounded-full object-cover" 
            src={invite.senderAvatar} 
            width={48}
            height={48}
            alt={`${invite.senderUsername}'s avatar`}
          />
          <div className="text-left">
            <h3 className="text-sm sm:text-lg font-semibold">{invite.senderUsername}</h3>
            <p className="text-xs sm:text-sm text-gray-300">
              wants to play {invite.map} with you
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:gap-4 sm:text-base">
          <button 
            className="bg-red hover:bg-red-600 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 transition-colors" 
            onClick={handleDecline}
          >
            Decline
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 transition-colors" 
            onClick={handleAccept}
          >
            Accept
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
        <div
          className="absolute bg-green-500 h-full rounded-full transition-all duration-100"
          style={{ width: `${(timeLeft / 10) * 100}%` }}
        />
      </div>
    </div>
  );
};

const Invite = () => {
  const [invite, setInvite] = useState<InviteData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for successful game match
    socket.on("play-a-friend", () => {
      console.log('✅ play-a-friend event received');
      toast.success("Game starting!");
      router.push("/game/match");
    });

    // Listen for game invitations
    socket.on("game-invitation", async (data: { 
      senderId: number; 
      senderSocketId: string;
      map: string;
    }) => {
      console.log('=== INVITATION RECEIVED ===');
      console.log('Data:', data);

      try {
        // Fetch sender's full user data
        console.log('Fetching user data for ID:', data.senderId);
        const response = await axios.get(`/users/${data.senderId}`);
        console.log('User data received:', response.data);
        const sender = response.data;

        const inviteData: InviteData = {
          senderId: data.senderId,
          senderSocketId: data.senderSocketId,
          senderUsername: sender.username,
          senderAvatar: sender.avatar,
          map: data.map,
        };

        console.log('Setting invite:', inviteData);
        setInvite(inviteData);
        toast(`${sender.username} invited you to play!`, {
          icon: "🎮",
          duration: 10000,
        });
      } catch (error) {
        console.error("Failed to fetch sender data:", error);
        toast.error("Failed to load game invitation");
      }
    });

    // Listen for errors
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
          invite={invite} 
          onClose={() => setInvite(null)} 
        />
      )}
    </>
  );
};

export default Invite;
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Gamepad2, UserMinus, MoreVertical, X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Client } from "@/providers/QueryProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 
import ChallengeDropdown from "./ChallengeDropDown"; 

interface FriendCardProps {
  user: {
    id: number;
    username: string;
    avatar?: string;
    level?: number;
    status?: string;
  };
  // showActions is TRUE for the Friend List View (default styling)
  showActions?: boolean; 
  // NEW PROP: Controls visibility of Remove/Challenge buttons
  showPrimaryActions?: boolean; 
}

// =========================================================================
// 1. ACTION BUTTONS SUB-COMPONENT (Updated)
// =========================================================================

const CardActions = ({ user, removeFriend, handleMessage, showPrimaryActions = true }) => {
  const [showChallenge, setShowChallenge] = useState(false);
  const isRemoving = removeFriend.isPending;

  return (
    <div className="flex items-center gap-1.5 transition-opacity duration-200">
      
      {/* Message Button (Always visible in action view) */}
      <button
        onClick={handleMessage}
        className="p-2 text-gray-400 hover:text-blue hover:bg-blue/20 rounded-lg transition-all"
        title="Send Message"
        disabled={isRemoving}
      >
        <MessageSquare size={16} />
      </button>

      {/* Primary Actions (Challenge & Remove) - Conditional Rendering */}
      {showPrimaryActions && (
        <>
          {/* Challenge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChallenge(!showChallenge)}
              className={`p-2 rounded-lg transition-all ${showChallenge ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'}`}
              title="Challenge to a Game"
              disabled={isRemoving}
            >
              <Gamepad2 size={16} />
            </button>
            
            {showChallenge && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <ChallengeDropdown userId={user.id} onClose={() => setShowChallenge(false)} />
              </div>
            )}
          </div>

          {/* Remove Friend */}
          <button
            onClick={() => removeFriend.mutate()}
            disabled={isRemoving}
            className={`p-2 rounded-lg transition-all ${isRemoving 
                ? 'bg-red/10 text-red animate-pulse' 
                : 'text-gray-400 hover:text-red hover:bg-red/20'}`
            }
            title="Remove Friend"
          >
            {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <UserMinus size={16} />}
          </button>
        </>
      )}
    </div>
  );
};


// =========================================================================
// 2. MAIN FRIEND CARD COMPONENT (Updated)
// =========================================================================

export default function FriendCard({ user, showActions = true, showPrimaryActions = true }: FriendCardProps) {
  const router = useRouter(); 

  // --- Mutations & Handlers ---
  const removeFriend = useMutation({
    mutationFn: async () => {
      await axios.delete(`/friendship/${user.id}`); 
    },
    onSuccess: () => {
      Client.refetchQueries(["friends"]);
      toast.success(`${user.username} removed`);
    },
    onError: () => {
      toast.error("Action failed");
    },
  });

  const handleMessage = async () => {
    try {
      const { data } = await axios.get(`/channels/getChannelId/${user.id}`);
      router.push(`/chat/${data}`); 
    } catch (error: any) {
      toast.error("Cannot open chat");
    }
  };

  const statusColor = 
    user.status?.toLowerCase() === "online" ? "bg-green-500" :
    user.status?.toLowerCase() === "in game" ? "bg-purple-500" :
    "bg-gray-500";

  // We are forcing the compact, list-style view regardless of showActions
  // as the user specifically requested the "Friend Card in the Author User Profile"
  // to look like the compact list view.

  return (
    <div className="group relative bg-[#242636] hover:bg-[#2a2d3d] border border-white/5 hover:border-blue/20 rounded-2xl p-3 transition-all duration-300">
      <div className="flex items-center gap-3">
        
        {/* Avatar & Status */}
        <Link href={`/profile/${user.username}`} className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-black/20 group-hover:ring-blue/30 transition-all">
            <Image
              src={user.avatar || "/placeholder.svg"}
              alt={user.username}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#242636] ${statusColor} shadow-md`} />
        </Link>

        {/* Info */}
        <Link href={`/profile/${user.username}`} className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-blue transition-colors">
            {user.username}
          </h3>
          <p className="text-xs text-gray-400 truncate font-medium">
            Lvl {Math.floor(user.level || 1)} • <span className={`font-semibold ${statusColor.replace('bg-', 'text-')}`}>{user.status || "Offline"}</span>
          </p>
        </Link>

        {/* Actions - The CardActions component will now determine which buttons to show */}
        {showActions && (
          <CardActions 
            user={user} 
            removeFriend={removeFriend} 
            handleMessage={handleMessage} 
            showPrimaryActions={showPrimaryActions} // Pass the new prop
          />
        )}
      </div>
    </div>
  );
}
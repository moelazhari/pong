"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessagesSquare, Gamepad2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "@/lib/axios";
import ChallengeDropdown from "./ChallengeDropDown";

interface FriendCardProps {
  user: {
    id: number;
    username: string;
    avatar: string;
    status?: string;
  };
  showActions: boolean;
}

export default function FriendCard({ user, showActions }: FriendCardProps) {
  const router = useRouter();
  const [showChallenge, setShowChallenge] = useState(false);
  const [isLoadingDM, setIsLoadingDM] = useState(false);

  const handleOpenDM = async () => {
    setIsLoadingDM(true);
    try {
      const { data } = await axios.get(`/channels/getChannelId/${user.id}`);
      router.push(`/chat/${data}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open chat");
    } finally {
      setIsLoadingDM(false);
    }
  };

  return (
    <div className="relative mx-2">
      <div className="flex justify-between px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg hover:bg-white/15 transition-all">
        <Link href={`/profile/${user.username}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                className="w-12 h-12 rounded-full object-cover"
                src={user.avatar}
                width={48}
                height={48}
                alt={`${user.username}'s avatar`}
              />
              {user.status === "ONLINE" && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="truncate font-medium text-white">{user.username}</h3>
              {user.status && (
                <p className="text-xs text-gray-300 capitalize">
                  {user.status.toLowerCase()}
                </p>
              )}
            </div>
          </div>
        </Link>

        {showActions && (
          <div className="flex items-center gap-3 ml-2">
            <button
              onClick={handleOpenDM}
              disabled={isLoadingDM}
              className="hover:opacity-70 transition-opacity disabled:opacity-50"
              aria-label="Send message"
            >
              <MessagesSquare size={28} color="#7ac7c4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setShowChallenge(!showChallenge)}
              className="hover:opacity-70 transition-opacity relative"
              aria-label="Challenge to game"
            >
              <Gamepad2 size={32} color="#7ac7c4" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Dropdown positioned at bottom-right of card */}
      {showChallenge && (
        <ChallengeDropdown
          userId={user.id}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </div>
  );
}
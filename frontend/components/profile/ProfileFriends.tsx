"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import socket from "@/components/socketG";
import { Client } from "@/providers/QueryProvider";
import FriendCard from "@/components/friends/FriendCard";
import { Users, UserPlus } from "lucide-react";

interface ProfileFriendsProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function ProfileFriends({ userId, isCurrentUser }: ProfileFriendsProps) {
  const { data: response, isLoading } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/friendship/getFriends/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const handleUpdate = () => {
      Client.refetchQueries(["friends", userId]);
    };
    socket.on("friends", handleUpdate);
    return () => socket.off("friends", handleUpdate);
  }, [userId]);

  const friends = response?.friends || response || [];

  return (
    <div className="bg-[#1a1b26] rounded-[2rem] border border-white/5 shadow-2xl h-[600px] flex flex-col overflow-hidden relative">
      

      <div className="p-6 pb-4 border-b border-white/5 bg-[#1a1b26]/80 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue/10 rounded-xl border border-blue/20">
              <Users size={20} className="text-blue" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Friends</h2>
              <p className="text-xs text-gray-400 font-medium">
                {friends.length} Active {friends.length === 1 ? "Player" : "Players"}
              </p>
            </div>
          </div>
          {isCurrentUser && (
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-blue">
               <UserPlus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-black/10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
            <Users size={40} className="text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium text-sm">No Friends yet</p>
            {isCurrentUser && <p className="text-xs text-gray-600 mt-1">Search for players to add them</p>}
          </div>
        ) : (
          friends.map((friend: any) => (
            <FriendCard key={friend.id} user={friend} showActions={isCurrentUser} />
          ))
        )}
      </div>
      

      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#1a1b26] to-transparent pointer-events-none" />
    </div>
  );
}
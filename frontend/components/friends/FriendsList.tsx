"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import socket from "@/components/socketG";
import { Client } from "@/providers/QueryProvider";
import FriendCard from "./FriendCard";
import { User2 }  from "lucide-react";


interface FriendsListProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function FriendsList({ userId, isCurrentUser }: FriendsListProps) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      // Validate userId
      if (!userId || isNaN(userId)) {
        throw new Error('Invalid user ID');
      }
      
      const { data } = await axios.get(`/friendship/getFriends/${userId}`);
      return data;
    },
    enabled: !!userId && !isNaN(userId),
    staleTime: 60 * 1000, // 1 minute
  });

  // Listen for friend list updates
  useEffect(() => {
    if (!userId || isNaN(userId)) return;

    const handleUpdate = () => {
      Client.refetchQueries(["friends", userId]);
    };

    socket.on("friends", handleUpdate);

    return () => {
      socket.off("friends", handleUpdate);
    };
  }, [userId]);

  // Extract friends array from response
  const friends = response?.friends || response || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-red-400">Failed to load friends</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
          <p className="text-gray-400 text-sm">Loading friends...</p>
        </div>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <User2 size={48} color="#7ac7c4" strokeWidth={1.5} className="opacity-50" />
        <div className="text-center">
          <p className="text-gray-400 font-medium">No friends yet</p>
          {isCurrentUser && (
            <p className="text-sm text-gray-500 mt-1">
              Start adding friends to play together!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2  scrollbar p-3">
      {friends.map((friend: any) => (
        <FriendCard
          key={friend.id}
          user={friend}
          showActions={isCurrentUser}
        />
      ))}
    </div>
  );
}
"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import socket from "@/components/socketG";
import { Client } from "@/providers/QueryProvider";
import User from "./User";
import UserDetails from "./UserDetails";
import Achievements from "./Achievements";
import Matches from "./Matches";
import ProfileFriends from "./ProfileFriends";
import MidBottom from "./MidBottom";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

export default function ProfileComponent({ username }: { username: string }) {
  const isOwnProfile = username === "me";

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const endpoint = isOwnProfile ? "/users/me" : `/users/username/${username}`;
      const { data } = await axios.get(endpoint);
      return data;
    },
    retry: 1,
  });

  useEffect(() => {
    if (!user?.id) return;

    const handleProfileUpdate = (updatedUserId: number) => {
      if (updatedUserId === user.id) {
        Client.refetchQueries(["user", username]);
      }
    };

    socket.on("profile", handleProfileUpdate);
    return () => socket.off("profile", handleProfileUpdate);
  }, [user?.id, username]);

  if (isLoading) return <ProfileSkeleton />;

  if (error || !user) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">User not found</h2>
          <p className="text-gray-400">The profile you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full pt-14 sm:pt-24 pb-8 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto flex gap-8 justify-center">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden xl:flex w-[340px] flex-col gap-8">
          <Achievements wins={user.wins} />
          <Matches id={user.id} />
        </aside>

        {/* Main Content */}
        <div className="w-full max-w-[660px] flex flex-col gap-4">
          <User user={user} isMe={isOwnProfile} />
          <UserDetails
            Stats={<MidBottom user={user} />}
            Archievement={<Achievements wins={user.wins} />}
            Matches={<Matches id={user.id} />}
            Friends={<ProfileFriends userId={user.id} isCurrentUser={isOwnProfile} />}
          />
        </div>

        {/* Right Sidebar - Desktop only */}
        <aside className="hidden lg:flex w-[340px]">
          <ProfileFriends userId={user.id} isCurrentUser={isOwnProfile} />
        </aside>
      </div>
    </main>
  );
}
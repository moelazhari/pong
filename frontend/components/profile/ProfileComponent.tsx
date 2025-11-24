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
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import Stats from "./Stats";

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
      <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-red-400 mb-2">User not found</h2>
          <p className="text-gray-400">The profile you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full pt-14 sm:pt-24 pb-8 px-3 sm:px-6 lg:px-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sidebar - Desktop Only: Achievements & Matches */}
        <aside className="hidden xl:block xl:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <Achievements wins={user.wins} />
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <Matches id={user.id} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="xl:col-span-6 space-y-6">
          {/* User Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
            <User user={user} isMe={isOwnProfile} />
          </div>

          {/* Desktop: Stats Only */}
          <div className="hidden xl:block bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6">
            <Stats user={user} />
          </div>

          {/* Mobile/Tablet: Tabbed Interface */}
          <div className="xl:hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <UserDetails
              Stats={<Stats user={user} />}
              Archievement={<Achievements wins={user.wins} />}
              Matches={<Matches id={user.id} />}
              Friends={<ProfileFriends userId={user.id} isCurrentUser={isOwnProfile} />}
            />
          </div>
        </div>

        {/* Right Sidebar - Desktop Only: Friends */}
        <aside className="hidden lg:block xl:col-span-3">
          <div className="sticky top-24">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-[calc(100vh-8rem)]">
              <ProfileFriends userId={user.id} isCurrentUser={isOwnProfile} />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

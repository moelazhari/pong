"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, Shield, UserPlus, UserCheck, Settings, Swords, Trophy, Skull, Percent, UserX, X, Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import { Client } from "@/providers/QueryProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AvatarUploader from "@/components/ui/AvatarUploader";

// Helper Component: Renders the dynamic Friendship Action Buttons
const FriendshipActions = ({ userId }: { userId: number }) => {
  const { data: currentUser } = useQuery({ queryKey: ["user", "me"] });

  const statusQuery = useQuery({
    queryKey: ["friendStatus", userId],
    queryFn: async () => {
      // Backend: GET /friendship/status/:id (Uses path param for target ID)
      const { data } = await axios.get(`/friendship/status/${userId}`);
      return data;
    },
    enabled: !!userId,
  });

  const { data: status, isLoading, isError } = statusQuery;
  const refetchStatus = statusQuery.refetch;


  const addFriend = useMutation({
    mutationFn: () => axios.post("/friendship/sendRequest", { receiver: userId }),
    onSuccess: () => { 
        toast.success("Request sent!"); 
        refetchStatus(); 
    },
    onError: (error) => {
        const message = error.response?.data?.message || "Failed to send request.";
        toast.error(message);
    },
  });

  const removeFriend = useMutation({
    mutationFn: () => axios.delete(`/friendship/${userId}`),
    onSuccess: () => { 
        toast.success("Friendship removed."); 
        refetchStatus(); 
        Client.refetchQueries(["friends"]); 
    },
    onError: () => toast.error("Failed to remove friend."),
  });

  const acceptRequest = useMutation({
    mutationFn: () => axios.patch(`/friendship/acceptRequest`, { sender: userId }),
    onSuccess: () => { 
        toast.success("Request accepted!"); 
        refetchStatus(); 
        Client.refetchQueries(["friends"]); 
    },
    onError: () => toast.error("Failed to accept request."),
  });

  const declineRequest = removeFriend;

  if (isLoading) {
    return (
      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white animate-pulse">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }
  if (isError) return <div className="text-red">Error loading status</div>;

  // --- Core Status Logic ---
  const currentStatus = status?.status;
  const isPendingSender = status?.sender === currentUser?.id;

  // console.log("Current Backend Status:", currentStatus, "Is Sender:", isPendingSender); // Optional debug

  switch (currentStatus) {
    case "none": // Matches Fstatus.NONE
    case null:
    case undefined:
      return (
        <button
          onClick={() => addFriend.mutate()}
          disabled={addFriend.isPending}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all disabled:bg-gray-600/50 disabled:cursor-wait"
          title="Add Friend"
        >
          <UserPlus size={20} />
        </button>
      );

    case "pending": // Matches Fstatus.PENDING
      if (isPendingSender) {
        // Current user sent the request
        return (
          <button
            disabled
            className="p-3 bg-blue/10 rounded-xl border border-blue/20 text-blue/70 cursor-default"
            title="Request Pending (Sent)"
          >
            <UserCheck size={20} />
          </button>
        );
      } else {
        // Current user received the request (show Accept/Decline)
        return (
          <div className="flex gap-2">
            <button
              onClick={() => acceptRequest.mutate()}
              disabled={acceptRequest.isPending}
              className="p-3 bg-green-500 hover:bg-green-600 rounded-xl border border-green-500/50 text-white transition-all shadow-md shadow-green-500/20"
              title="Accept Request"
            >
              <UserCheck size={20} />
            </button>
            <button
              onClick={() => declineRequest.mutate()}
              disabled={declineRequest.isPending}
              className="p-3 bg-red/10 hover:bg-red/20 rounded-xl border border-red/20 text-red transition-all"
              title="Decline Request"
            >
              <X size={20} />
            </button>
          </div>
        );
      }

    case "accepted": // Matches Fstatus.ACCEPTED
      return (
        <button
          onClick={() => removeFriend.mutate()}
          disabled={removeFriend.isPending}
          className="p-3 bg-red/10 hover:bg-red/20 rounded-xl border border-red/20 text-red transition-all"
          title="Remove Friend"
        >
          <UserX size={20} />
        </button>
      );

    case "blocked": // Placeholder for blocked state
        return (
            <button
                disabled
                className="p-3 bg-gray-600/50 rounded-xl border border-gray-500/50 text-gray-400 cursor-default"
                title="User Blocked"
            >
                <Shield size={20} />
            </button>
        );

    default:
      console.warn("Unrecognized friendship status:", currentStatus);
      return null;
  }
};

const ProfileHeader = ({ user, isMe }: { user: any; isMe: boolean }) => {
  const router = useRouter();

  const updateAvatar = useMutation({
    mutationFn: async (imageUrl: string) => {
      await axios.patch("/users/updateMe", { avatar: imageUrl });
    },
    onSuccess: () => {
      Client.refetchQueries(["user", "me"]);
      toast.success("Profile picture updated");
    },
    onError: () => toast.error("Failed to update image"),
  });

  const getChannelId = useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await axios.get(`/channels/getChannelId/${userId}`);
      return data;
    },
    onSuccess: (data: number) => router.push(`/chat/${data}`),
    onError: () => toast.error("Could not open chat"),
  });

  const blockUser = useMutation({
    mutationFn: async (userId: number) => {
      await axios.post(`/users/block`, { userId });
    },
    onSuccess: () => {
      router.push("/profile");
      toast.success("User blocked");
    },
  });

  const totalGames = user.wins + user.loses;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;
  // XP Calculation
  const levelProgress = (user.level % 1) * 100; 
  const currentLevel = Math.floor(user.level);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#1a1b26] border border-white/5 shadow-2xl">
      
      {/* 1. Header Banner / Cover */}
      <div className="h-48 w-full relative bg-gradient-to-r from-blue/20 via-purple-500/10 to-red/20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue/20 rounded-full blur-[100px]" />
      </div>

      <div className="px-6 pb-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 -mt-20">
          
          {/* 2. Avatar Section (Overlapping) */}
          <AvatarUploader 
            currentAvatar={user.avatar} 
            isMe={isMe} 
            onUpload={(url) => updateAvatar.mutate(url)}
            isUploadingExternal={updateAvatar.isPending}
          />

          {/* 3. Main Info Section */}
          <div className="flex-1 w-full pt-20 lg:pt-24 space-y-4">
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              {/* Name & Status */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none mb-2">
                  {user.username}
                </h1>
                <p className={`text-sm font-medium flex items-center gap-2 ${
                  user.status === 'online' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                     user.status === 'online' ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                  {user.status || "Offline"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {!isMe ? (
                  <>
                    {/* Primary Action: Message */}
                    <button
                      onClick={() => getChannelId.mutate(user.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-xl font-bold hover:bg-blue/80 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue/20"
                      title="Send Message"
                    >
                      <MessageSquare size={18} />
                      <span>Message</span>
                    </button>
                    
                    {/* Dynamic Action: Add/Remove/Accept Friend */}
                    <FriendshipActions userId={user.id} />
                    
                    {/* Secondary Action: Block */}
                    <button
                      onClick={() => blockUser.mutate(user.id)}
                      className="p-3 bg-red/10 hover:bg-red/20 rounded-xl border border-red/20 text-red transition-all"
                      title="Block User"
                    >
                      <Shield size={20} />
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. Level & XP Bar (Prominent) */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-end mb-2 text-white">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current Rank</span>
                  <span className="text-xl font-bold text-blue">Level {currentLevel}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-mono">{Math.round(user.XP)} XP</span>
                </div>
              </div>
              
              {/* Progress Bar Container */}
              <div className="h-4 w-full bg-gray-800/50 rounded-full overflow-hidden border border-white/5 relative">
                {/* Glow Effect */}
                <div 
                  className="absolute top-0 left-0 h-full bg-blue shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${levelProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* 5. Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <StatCard label="Total Games" value={totalGames} icon={<Swords size={16} />} color="text-purple-400" />
              <StatCard label="Wins" value={user.wins} icon={<Trophy size={16} />} color="text-green-400" />
              <StatCard label="Loses" value={user.loses} icon={<Skull size={16} />} color="text-red-400" />
              <StatCard label="Win Rate" value={`${winRate}%`} icon={<Percent size={16} />} color="text-orange-400" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component for cleaner code
const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white/5 border border-white/5 p-3 sm:p-4 rounded-2xl flex flex-col justify-between hover:bg-white/10 transition-colors group">
    <div className="flex items-center gap-2 text-gray-400 mb-2">
      {icon}
      <span className="text-xs font-bold tracking-wider">{label.toUpperCase()}</span>
    </div>
    <span className={`text-xl sm:text-2xl font-black ${color} group-hover:scale-105 transition-transform origin-left`}>
      {value}
    </span>
  </div>
);

export default ProfileHeader;
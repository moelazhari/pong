"use client"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import socket from "@/components/socketG"
import { Client } from "@/providers/QueryProvider"
import ProfileHeader from "./ProfileHeader"
import ProfileStats from "./ProfileStats"
import ProfileFriends from "./ProfileFriends"
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton"

export default function ProfileComponent({ username }: { username: string }) {
  const isOwnProfile = username === "me"

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const endpoint = isOwnProfile ? "/users/me" : `/users/username/${username}`
      const { data } = await axios.get(endpoint)
      return data
    },
    retry: 1,
  })

  useEffect(() => {
    if (!user?.id) return
    const handleProfileUpdate = (updatedUserId: number) => {
      if (updatedUserId === user.id) {
        Client.refetchQueries(["user", username])
      }
    }
    socket.on("profile", handleProfileUpdate)
    return () => socket.off("profile", handleProfileUpdate)
  }, [user?.id, username])

  if (isLoading) return <ProfileSkeleton />

  if (error || !user) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-red-400 mb-2">User not found</h2>
          <p className="text-gray-400">The profile you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
        <ProfileHeader user={user} isMe={isOwnProfile} />
        <ProfileStats user={user} />
      </div>
      <div className="hidden lg:flex lg:col-span-1">
        <div className="w-full sticky top-24 h-fit">
          <ProfileFriends userId={user.id} isCurrentUser={isOwnProfile} />
        </div>
      </div>
    </div>
  )
}

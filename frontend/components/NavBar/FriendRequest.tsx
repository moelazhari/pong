"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useQuery, useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import axios from "@/lib/axios"
import { Client } from "@/providers/QueryProvider"
import useCloseOutSide from "@/hookes/useCloseOutSide"
import { UserPlus2, Check, X } from "lucide-react"
import socket from "@/components/socketG"

const FriendRequestCard = ({
  user,
  onAccept,
  onDecline,
  isLoading,
}: {
  user: any
  onAccept: () => void
  onDecline: () => void
  isLoading: boolean
}) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Image
        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
        src={user.avatar || "/placeholder.svg"}
        width={48}
        height={48}
        alt={user.username}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{user.username}</h3>
        <p className="text-xs text-gray-400">sent you a friend request</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={onDecline}
        disabled={isLoading}
        className="p-2 rounded-lg bg-red/20 hover:bg-red/30 text-red disabled:opacity-50 transition-all"
        aria-label="Decline"
      >
        <X size={18} strokeWidth={2.5} />
      </button>
      <button
        onClick={onAccept}
        disabled={isLoading}
        className="p-2 rounded-lg bg-blue/20 hover:bg-blue/30 text-blue disabled:opacity-50 transition-all"
        aria-label="Accept"
      >
        <Check size={18} strokeWidth={2.5} />
      </button>
    </div>
  </div>
)

const FriendRequestDropdown = ({
  users,
  setIsOpen,
}: {
  users: any[]
  setIsOpen: (v: boolean) => void
}) => {
  const { divref } = useCloseOutSide({ setIsOpen })

  const Accept = useMutation({
    mutationFn: async (senderId: number) => {
      const { data } = await axios.patch(`/friendship/acceptRequest`, { sender: senderId })
      return data
    },
    onSuccess: (data, senderId) => {
      const sender = users.find((u) => u.id === senderId)
      toast.success(`You're now friends with ${sender?.username || "this user"}!`)
      Client.refetchQueries(["friendrequests"])
      Client.refetchQueries(["friends"])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept request")
    },
  })

  const Decline = useMutation({
    mutationFn: async (senderId: number) => {
      await axios.delete(`/friendship/${senderId}`)
    },
    onSuccess: () => {
      toast.success("Friend request declined")
      Client.refetchQueries(["friendrequests"])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to decline request")
    },
  })

  const isLoading = Accept.isPending || Decline.isPending

  return (
    <div
      ref={divref}
      className="absolute top-full right-0 mt-2 w-80 max-h-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
    >
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-bold text-white">Friend Requests</h3>
      </div>
      <div className="p-3 overflow-y-auto scrollbar-thin max-h-80">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <UserPlus2 size={48} className="text-white/20 mb-3" />
            <p className="text-sm text-gray-400">No friend requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <FriendRequestCard
                key={user.id}
                user={user}
                onAccept={() => Accept.mutate(user.id)}
                onDecline={() => Decline.mutate(user.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const FriendRequest = () => {
  const [notif, setNotif] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ["friendrequests"],
    queryFn: async () => {
      const { data } = await axios.get("/friendship/friendrequests")
      if (data.length > 0) setNotif(true)
      return data
    },
  })

  useEffect(() => {
    const handleFriendRequest = () => {
      setNotif(true)
      Client.refetchQueries(["friendrequests"])
      toast("You have a new friend request!", { icon: "👋" })
    }

    socket.on("friendRequest", handleFriendRequest)
    return () => socket.off("friendRequest", handleFriendRequest)
  }, [])

  const handleClick = () => {
    setNotif(false)
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button
        aria-label="friend requests"
        onClick={handleClick}
        className="relative p-2 hover:bg-white/10 rounded-xl transition-all"
      >
        <UserPlus2 size={24} color="#7ac7c4" strokeWidth={2} />
        {notif && (
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red rounded-full animate-pulse ring-2 ring-gray-900" />
        )}
      </button>
      {isOpen && <FriendRequestDropdown users={data || []} setIsOpen={setIsOpen} />}
    </div>
  )
}

export default FriendRequest;
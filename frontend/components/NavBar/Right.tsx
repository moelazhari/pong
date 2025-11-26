"use client"
import FriendRequest from "./FriendRequest"
import AccountDropDown from "./AccountDropDown"
import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"

const Right = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await axios.get("/users/me")
      return data
    },
  })

  return (
    <div className="flex items-center gap-2 mr-4 lg:mr-6">
      <FriendRequest />
      <AccountDropDown isLoading={isLoading} src={data?.avatar} />
    </div>
  )
}

export default Right
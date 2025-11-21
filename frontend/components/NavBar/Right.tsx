"use client"

import FriendRequest from "./FriendRequest";
import MenuDropDown from "./MenuDropDown";
import AccountDropDown from "./AccountDropDown";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

const Right = () => {
  const {data, isLoading} = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const { data } = await axios.get("/users/me");
      return data;
    },
  });

  return (
    <div className="flex">
      <FriendRequest />
      <AccountDropDown isLoading={isLoading} src={data?.avatar} />
      <MenuDropDown src={data?.avatar} />
    </div>
  );
};

export default Right;
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { userDto } from "@/dto/userDto";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import useCloseOutSide from "@/hookes/useCloseOutSide";
import { useDebounce } from "@uidotdev/usehooks";

const User = ({ user }: { user: userDto }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white bg-opacity-20 backdrop-blur-lg drop-shadow-lg hover:bg-opacity-30 transition-all">
      <Image
        className="sm:w-[48px] sm:h-[48px] rounded-full self-center"
        src={user.avatar}
        width={36}
        height={36}
        alt="user image"
      />
      <h3 className="text-[12px] sm:text-[24px]">{user.username}</h3>
    </div>
  );
};

const SearchBarDropDown = ({ search }: { search: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      if (!search || search.length === 0) return null;
      
      const response = await axios.get(`/users/search?q=${search}`);
      return response.data;
    },
    enabled: search.length > 0,
  });

  return (
    <div className="absolute top-11 w-52 sm:w-72 max-h-56 p-4 flex flex-col gap-1 rounded-2xl bg-opacity-50 backdrop-blur-lg drop-shadow-lg overflow-auto scrollbar z-50">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : isError ? (
        <p className="text-center text-red">Error loading users</p>
      ) : data?.users?.length === 0 ? (
        <p className="text-center">No user found</p>
      ) : (
        data?.users?.map((user: userDto) => (
          <Link key={user.id} href={`/profile/${user.username}`}>
            <User user={user} />
          </Link>
        ))
      )}
    </div>
  );
};

const GlobalSearch = () => {
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { divref } = useCloseOutSide({ setIsOpen });

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const debouncedSearch = useDebounce(search, 500);

  return (
    <div ref={divref} className="md:block relative">
      <div className="flex justify-end items-center relative">
        <input
          className="h-8 w-full text-sm rounded-xl text-black px-3 pr-10 focus:outline-0 focus:border-[2px] hover:opacity-60"
          type="text"
          placeholder="Search"
          name="search"
          value={search}
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <Search
          className="absolute right-2 pointer-events-none"
          size={24}
          strokeWidth={3}
          color="#7ac7c4"
        />
      </div>
      {isOpen && search.length > 0 && (
        <SearchBarDropDown search={debouncedSearch} />
      )}
    </div>
  );
};

export default GlobalSearch;
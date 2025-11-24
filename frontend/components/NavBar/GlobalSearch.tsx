"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import useCloseOutSide from "@/hookes/useCloseOutSide";
import { useDebounce } from "@uidotdev/usehooks";

const UserResult = ({ user }: { user: any }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
    <Image
      className="w-10 h-10 rounded-full object-cover"
      src={user.avatar}
      width={40}
      height={40}
      alt={user.username}
    />
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-white truncate">{user.username}</h3>
      {user.status && (
        <p className="text-xs text-gray-400 capitalize">{user.status.toLowerCase()}</p>
      )}
    </div>
  </div>
);

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
    <div className="absolute top-full mt-2 w-full max-h-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
      <div className="p-3 overflow-y-auto scrollbar-thin max-h-80">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue" size={24} />
          </div>
        ) : isError ? (
          <p className="text-center text-red py-8">Error loading users</p>
        ) : data?.users?.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No users found</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data?.users?.map((user: any) => (
              <Link key={user.id} href={`/profile/${user.username}`}>
                <UserResult user={user} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GlobalSearch = () => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { divref } = useCloseOutSide({ setIsOpen });
  const debouncedSearch = useDebounce(search, 300);

  return (
    <div ref={divref} className="relative">
      <div className="relative">
        <input
          className="h-10 w-full text-sm rounded-xl bg-white/10 text-white placeholder-gray-400 px-4 pr-10 border border-white/10 focus:outline-none focus:border-blue/50 focus:bg-white/15 transition-all"
          type="text"
          placeholder="Search users..."
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          size={18}
        />
      </div>
      {isOpen && search.length > 0 && <SearchBarDropDown search={debouncedSearch} />}
    </div>
  );
};

export default GlobalSearch;
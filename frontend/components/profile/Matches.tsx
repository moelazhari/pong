"use client";
import { useQuery } from '@tanstack/react-query';
import axios from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { Swords, Trophy } from "lucide-react";

const Match = ({ match, id }: { match: any; id: number }) => {
  const isWinner = match.winner.id === id;
  
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3 lg:p-4 transition-all hover:scale-[1.02] ${
        isWinner
          ? "bg-gradient-to-r from-blue/20 to-blue/5 border-2 border-blue shadow-blue/50 shadow-lg"
          : "bg-gradient-to-r from-red/20 to-red/5 border-2 border-red shadow-red/50 shadow-lg"
      }`}
    >
      <div className="flex justify-between items-center gap-2">
        <Link
          className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
          href={`/profile/${match.winner.username}`}
        >
          <div className="relative">
            <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full overflow-hidden ring-2 ring-blue/50">
              <Image
                className="h-full w-full object-cover"
                src={match.winner.avatar}
                width={56}
                height={56}
                alt="winner"
              />
            </div>
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
              <Trophy size={12} className="text-white" />
            </div>
          </div>
          <h3 className="text-xs font-bold text-white truncate max-w-[60px]">{match.winner.username}</h3>
        </Link>

        <div className="flex flex-col items-center gap-1">
          <Swords size={20} className="text-white/50" />
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            5-{match.loserScore}
          </span>
        </div>

        <Link
          className="flex flex-col items-center gap-1 hover:scale-105 transition-transform"
          href={`/profile/${match.loser.username}`}
        >
          <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full overflow-hidden ring-2 ring-red/50">
            <Image
              className="h-full w-full object-cover"
              src={match.loser.avatar}
              width={56}
              height={56}
              alt="loser"
            />
          </div>
          <h3 className="text-xs font-bold text-white truncate max-w-[60px]">{match.loser.username}</h3>
        </Link>
      </div>
    </div>
  );
};

const DisplayMatchs = ({ id }: { id: number }) => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", id],
    queryFn: async () => {
      const { data } = await axios.get(`/gameHistory/getHistory/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 p-8">
        <Swords size={48} className="text-white/20 mb-4" />
        <p className="text-gray-400">No matches yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 lg:p-6 overflow-y-auto scrollbar-thin max-h-80">
      {matches.map((match: any) => (
        <Match key={match.id} match={match} id={id} />
      ))}
    </div>
  );
};

const MatchesHistory = ({ id }: { id: number }) => {
  return (
    <div className="h-full flex flex-col max-h-full">
      <div className="hidden lg:flex flex-shrink-0 bg-gradient-to-r from-red/20 to-red/5 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red/20 rounded-xl">
            <Swords size={20} color="#f87272" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Match History
          </h2>
        </div>
      </div>
      <DisplayMatchs id={id} />
    </div>
  );
};

export default MatchesHistory;
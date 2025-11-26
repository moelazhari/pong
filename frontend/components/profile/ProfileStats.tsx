"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { 
  Trophy, Swords, Target, TrendingUp, Award, Lock, 
  Crown, Zap, Shield, Skull, Crosshair, History 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Optional: for "2 hours ago"

const ProfileStats = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "matches" | "achievements">("overview");

  const { data: matches } = useQuery({
    queryKey: ["matches", user.id],
    queryFn: async () => {
      const { data } = await axios.get(`/gameHistory/getHistory/${user.id}`);
      return data;
    },
  });

  const games = user.wins + user.loses;
  const winRate = games ? Math.round((user.wins / games) * 100) : 0;

  // Configuration for Achievements
  const achievements = [
    { title: "ROOKIE", desc: "First Login", icon: Award, condition: true, color: "text-blue" },
    { title: "FIRST BLOOD", desc: "First Win", icon: Swords, condition: user.wins > 0, color: "text-red" },
    { title: "VETERAN", desc: "10 Wins", icon: Target, condition: user.wins >= 10, color: "text-green-400" },
    { title: "WARLORD", desc: "50 Wins", icon: Skull, condition: user.wins >= 50, color: "text-purple-400" },
    { title: "GODLIKE", desc: "100 Wins", icon: Crown, condition: user.wins >= 100, color: "text-yellow-400" },
    { title: "SHARPSHOOTER", desc: "50% Win Rate", icon: Crosshair, condition: winRate >= 50 && games > 5, color: "text-orange-400" },
  ];

  const tabs = [
    { id: "overview", label: "Stats", icon: TrendingUp },
    { id: "matches", label: "History", icon: History },
    { id: "achievements", label: "Awards", icon: Award },
  ];

  return (
    <div className="bg-[#1a1b26] rounded-[2rem] border border-white/5 shadow-2xl flex flex-col h-[600px] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* 1. Tabs Navigation - Centered & Styled */}
      <div className="flex items-center justify-center p-6 border-b border-white/5 z-10 bg-[#1a1b26]/50 backdrop-blur-md">
        <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                  ${isActive 
                    ? "bg-blue text-white shadow-lg shadow-blue/25" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="h-full flex flex-col justify-center">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Matches" 
                  value={games} 
                  subtitle="Games Played"
                  icon={Swords} 
                  color="text-blue" 
                  bg="bg-blue/10"
                  border="border-blue/20"
                />
                <StatCard 
                  title="Victories" 
                  value={user.wins} 
                  subtitle={`${winRate}% Win Rate`}
                  icon={Trophy} 
                  color="text-green-400" 
                  bg="bg-green-500/10"
                  border="border-green-500/20"
                />
                <StatCard 
                  title="Defeats" 
                  value={user.loses} 
                  subtitle={`${games > 0 ? 100 - winRate : 0}% Loss Rate`}
                  icon={Shield} 
                  color="text-red" 
                  bg="bg-red/10"
                  border="border-red/20"
                />
             </div>

             {/* Win Rate Bar */}
             <div className="mt-8 bg-black/20 rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between text-sm mb-3 font-bold text-gray-400">
                  <span>Performance</span>
                  <span>{winRate}% Success</span>
                </div>
                <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${winRate}%` }} className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <div style={{ width: `${100 - winRate}%` }} className="h-full bg-red shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500 font-mono">
                  <span>Wins</span>
                  <span>Loses</span>
                </div>
             </div>
          </div>
        )}

        {/* --- MATCHES TAB --- */}
        {activeTab === "matches" && (
          <div className="space-y-3">
            {!matches || matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                <History size={48} />
                <p>No battle history found</p>
              </div>
            ) : (
              matches.map((match: any) => {
                const isWinner = match.winner.id === user.id;
                const opponent = isWinner ? match.loser : match.winner;
                const myScore = isWinner ? 5 : match.loserScore; // Assuming 5 is winning score
                const opScore = isWinner ? match.loserScore : 5;

                return (
                  <div 
                    key={match.id}
                    className={`
                      relative flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-white/5
                      ${isWinner 
                        ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40" 
                        : "bg-red/5 border-red/20 hover:border-red/40"
                      }
                    `}
                  >
                    {/* Status Indicator Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isWinner ? 'bg-green-500' : 'bg-red'}`} />

                    {/* Content Grid */}
                    <div className="flex items-center justify-between w-full pl-4">
                      
                      {/* Left Side (Result) */}
                      <div className="flex flex-col">
                        <span className={`text-lg font-black ${isWinner ? 'text-green-400' : 'text-red'}`}>
                          {isWinner ? "VICTORY" : "DEFEAT"}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Ranked Match</span>
                      </div>

                      {/* Center (Score) */}
                      <div className="flex items-center gap-6">
                        <div className="text-3xl font-black text-white tracking-widest">
                          <span className={isWinner ? 'text-green-400' : 'text-gray-500'}>{myScore}</span>
                          <span className="text-gray-600 mx-2">:</span>
                          <span className={!isWinner ? 'text-red' : 'text-gray-500'}>{opScore}</span>
                        </div>
                      </div>

                      {/* Right (Opponent) */}
                      <Link href={`/profile/${opponent.username}`} className="flex items-center gap-3 group">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-white group-hover:text-blue transition-colors">
                            {opponent.username}
                          </p>
                          <p className="text-xs text-gray-500">Opponent</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-blue/50 transition-all">
                          <Image
                            src={opponent.avatar || "/placeholder.svg"}
                            alt={opponent.username}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- ACHIEVEMENTS TAB --- */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((item, idx) => (
              <div 
                key={idx}
                className={`
                  relative p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all
                  ${item.condition 
                    ? "bg-white/5 border-white/10 hover:border-white/30" 
                    : "bg-black/20 border-white/5 opacity-50 grayscale"
                  }
                `}
              >
                <div className={`p-3 rounded-full bg-black/30 ${item.condition ? item.color : "text-gray-600"}`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                {!item.condition && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ title, value, subtitle, icon: Icon, color, bg, border }: any) => (
  <div className={`flex flex-col items-center justify-center p-6 rounded-3xl border ${bg} ${border} transition-transform hover:scale-[1.02]`}>
    <Icon className={`w-8 h-8 mb-3 ${color}`} />
    <span className="text-4xl font-black text-white tracking-tight">{value}</span>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{title}</span>
    <span className={`text-xs mt-2 px-2 py-0.5 rounded-full bg-black/20 ${color} font-mono`}>{subtitle}</span>
  </div>
);

export default ProfileStats;
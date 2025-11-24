"use client";
import { useState } from "react";
import { BarChart3, Award, Swords, Users } from "lucide-react";

interface UserDetailsProps {
  Stats: React.ReactNode;
  Archievement: React.ReactNode;
  Matches: React.ReactNode;
  Friends: React.ReactNode;
}

type TabType = "stats" | "achievements" | "matches" | "friends";

export default function UserDetails({ 
  Stats, 
  Archievement, 
  Matches, 
  Friends 
}: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stats");

  const tabs = [
    { id: "stats" as TabType, label: "Stats", icon: BarChart3, gradient: "from-blue to-cyan-500" },
    { id: "achievements" as TabType, label: "Achievements", icon: Award, gradient: "from-yellow-500 to-orange-500" },
    { id: "matches" as TabType, label: "Matches", icon: Swords, gradient: "from-red to-pink-500" },
    { id: "friends" as TabType, label: "Friends", icon: Users, gradient: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-3 bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative overflow-hidden rounded-xl py-3 px-3 sm:px-4 transition-all duration-300 group ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} shadow-lg transform scale-105`
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Icon 
                  size={20} 
                  className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-white"} transition-colors`}
                  strokeWidth={2.5}
                />
                <span className={`hidden sm:inline font-semibold text-sm ${
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                } transition-colors`}>
                  {tab.label}
                </span>
              </div>
              
              {!isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area - FIXED: Now properly displays content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {activeTab === "stats" && Stats}
          {activeTab === "achievements" && Archievement}
          {activeTab === "matches" && Matches}
          {activeTab === "friends" && Friends}
        </div>
      </div>
    </div>
  );
}
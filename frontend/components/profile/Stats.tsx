"use client";
import { TrendingUp, Target, Trophy, Flame } from "lucide-react";
import PercentageCircle from "./PercentageCircle";
import PercentageLine from "./PercentageLine";

const Stats = ({ user }: { user: any }) => {
  const games = user.wins + user.loses;
  const winRate = games ? Math.round((user.wins / games) * 100) : 0;
  const loseRate = games ? Math.round((user.loses / games) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8">
      {/* Level & XP Card */}
      <div className="bg-gradient-to-r from-blue/20 to-cyan-500/10 rounded-2xl p-6 border border-blue/30 shadow-lg shadow-blue/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue/20 rounded-xl">
            <TrendingUp size={24} className="text-blue" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-white">Progress</h3>
        </div>
        
        <PercentageLine value={user.level} />
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-gray-400 text-sm mb-1">Level</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue to-cyan-400 bg-clip-text text-transparent">
              {Math.floor(user.level)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-gray-400 text-sm mb-1">Experience</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue bg-clip-text text-transparent">
              {user.XP}
            </p>
          </div>
        </div>
      </div>

      {/* Total Games Card */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Target size={24} className="text-purple-400" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-white">Total Games</h3>
        </div>
        
        <div className="text-center">
          <p className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {games}
          </p>
          <p className="text-gray-400 mt-2">matches played</p>
        </div>
      </div>

      {/* Win/Loss Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Wins */}
        <div className="bg-gradient-to-br from-blue/20 to-blue/5 rounded-2xl p-6 border border-blue/30 shadow-lg shadow-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue/20 rounded-xl">
              <Trophy size={24} className="text-blue" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white">Wins</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <PercentageCircle
              value={user.wins}
              percentage={winRate}
              color={"#7AC7C4"}
            />
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-blue">{user.wins}</p>
              <p className="text-sm text-gray-400 mt-1">{winRate}% win rate</p>
            </div>
          </div>
        </div>

        {/* Losses */}
        <div className="bg-gradient-to-br from-red/20 to-red/5 rounded-2xl p-6 border border-red/30 shadow-lg shadow-red/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red/20 rounded-xl">
              <Flame size={24} className="text-red" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white">Losses</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <PercentageCircle
              value={user.loses}
              percentage={loseRate}
              color={"#EA5581"}
            />
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-red">{user.loses}</p>
              <p className="text-sm text-gray-400 mt-1">{loseRate}% lose rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
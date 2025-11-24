import { Award, Trophy, Lock } from "lucide-react";

const DisplyAchievements = ({ wins }: { wins: number }) => {
  const achievements = [
    {
      title: "WELCOME!",
      description: "You logged in for the first time",
      icon: Award,
      unlocked: true,
      color: "from-blue to-cyan-400",
    },
    {
      title: "FIRST BLOOD",
      description: "You won your first game",
      icon: Trophy,
      unlocked: wins > 0,
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "UNSTOPPABLE",
      description: "Win 10 games",
      icon: Trophy,
      unlocked: wins >= 10,
      color: "from-red to-pink-500",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto scrollbar-thin max-h-80 lg:max-h-96">
      {achievements.map((achievement, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
            achievement.unlocked
              ? `bg-gradient-to-r ${achievement.color} shadow-lg hover:shadow-xl hover:scale-[1.02]`
              : "bg-white/5 opacity-60"
          }`}
        >
          <div className="flex gap-4 items-center relative z-10">
            <div className={`p-3 rounded-xl ${achievement.unlocked ? "bg-black/20" : "bg-white/10"}`}>
              {achievement.unlocked ? (
                <achievement.icon size={28} className="text-white" />
              ) : (
                <Lock size={28} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white truncate">{achievement.title}</h3>
              <p className="text-xs text-white/80 line-clamp-2">{achievement.description}</p>
            </div>
          </div>
          {!achievement.unlocked && (
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl" />
          )}
        </div>
      ))}
    </div>
  );
};

const Achievements = ({ wins }: { wins: number }) => {
  return (
    <div className="h-full flex flex-col max-h-full">
      <div className="hidden lg:flex flex-shrink-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/5 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
            <Award size={20} color="#fbbf24" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Achievements
          </h2>
        </div>
      </div>
      <DisplyAchievements wins={wins} />
    </div>
  );
};

export default Achievements;
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Gamepad2, Zap, Target, Sliders } from "lucide-react";
import RobotGame from "@/components/game/robotGame";


const DifficultyCard = ({ level, difficulty, setDifficulty, setGameStarted, icon: Icon, colorClass, description, imageSrc }) => {
    const isSelected = difficulty === level.value;
    const handleClick = () => {
        setDifficulty(level.value);
        setGameStarted(true);
    };

    return (
        <button
            className={`flex flex-col items-center p-6 h-full bg-gray-800/70 backdrop-blur-md rounded-2xl border transition-all duration-300 w-full max-w-xs
                ${colorClass.border} hover:scale-[1.05] shadow-lg ${colorClass.shadow} ${isSelected ? 'scale-[1.05] ring-4 ring-offset-2 ring-offset-gray-900' : 'hover:border-white/20'}`}
            onClick={handleClick}
        >
            <div className="w-full aspect-square rounded-lg overflow-hidden mb-4">
                <Image
                    width={260}
                    height={260}
                    alt={`${level.name} robot`}
                    src={imageSrc}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
                <Icon size={24} className={colorClass.text} />
                <h3 className={`text-2xl font-extrabold ${colorClass.text}`}>{level.name}</h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">{description}</p>
            
            <div className={`mt-auto px-4 py-2 text-sm font-semibold text-white rounded-full transition-all ${colorClass.bg}`}>
                Start {level.name} Match
            </div>
        </button>
    );
};


export default function Difficulty() {
  const [difficulty, setDifficulty] = useState<number>(12);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  if (gameStarted) {
    return <RobotGame difficulty={difficulty} />;
  }

  const difficulties = [
    {
      name: "Easy",
      value: 14,
      icon: Sliders,
      description: "Slow reaction time. Perfect for beginners to learn controls.",
      colors: {
        text: "text-green-400",
        border: "border-green-500/30",
        shadow: "shadow-green-900/40",
        bg: "bg-green-600 hover:bg-green-700"
      },
      image: "/game/easy-robot.webp",
    },
    {
      name: "Medium",
      value: 12,
      icon: Target,
      description: "Moderate challenge. The AI adapts, but makes tactical mistakes.",
      colors: {
        text: "text-yellow-400",
        border: "border-yellow-500/30",
        shadow: "shadow-yellow-900/40",
        bg: "bg-yellow-600 hover:bg-yellow-700"
      },
      image: "/game/robot.webp",
    },
    {
      name: "Hard",
      value: 10,
      icon: Zap,
      description: "Fast-paced and aggressive. Expect razor-sharp reflexes.",
      colors: {
        text: "text-red-400",
        border: "border-red-500/30",
        shadow: "shadow-red-900/40",
        bg: "bg-red-600 hover:bg-red-700"
      },
      image: "/game/hard-robot.webp",
    },
  ];

  return (
    <main className="min-h-screen grid place-content-center pt-20 pb-20 bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-10 p-8 sm:p-16 bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-6xl mx-auto">

        <div className="text-center">
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            AI Difficulty
          </h3>
          <p className="text-gray-400 text-lg">
            Choose how challenging you want your AI opponent to be.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {difficulties.map((level) => (
            <DifficultyCard
              key={level.name}
              level={level}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              setGameStarted={setGameStarted}
              icon={level.icon}
              colorClass={level.colors}
              description={level.description}
              imageSrc={level.image}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
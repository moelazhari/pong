"use client";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Users, Computer } from "lucide-react";

export default function Gamehome() {
  const Card = ({ href, title, description, icon: Icon, shadowColor, imageSrc }) => (
    <Link href={href} className="group block h-full">
      <div 
        className={`relative flex flex-col p-6 h-full bg-gray-800/70 backdrop-blur-md rounded-2xl border border-white/10 
          shadow-lg transform transition-all duration-300 overflow-hidden cursor-pointer
          hover:scale-[1.02] hover:border-white/20 ${shadowColor}`}
      >
        <div className="absolute inset-0 z-0 opacity-10 transition-opacity duration-300 group-hover:opacity-15">
          <Image
            priority
            fill
            alt={title}
            src={imageSrc}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>

        <div className="z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Icon size={32} className="text-white drop-shadow-lg" />
              <h2 className="text-2xl font-extrabold text-white">{title}</h2>
            </div>
            <p className="text-gray-400 mb-4">{description}</p>
          </div>
          
          <div className="mt-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full transition-all group-hover:bg-blue-500">
              Start Game
              <Gamepad2 size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen pt-20 pb-20 bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-8 lg:p-12">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white sm:text-5xl">
          Ready to Play?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Game Mode Cards (Online & Offline) */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card
              href="/game/maps"
              title="Online Multiplayer"
              description="Challenge random players globally and climb the leaderboards."
              icon={Users}
              shadowColor="hover:shadow-[0_0_40px_rgba(52,206,214,0.5)]"
              imageSrc="/game/online-game-select.webp"
            />
            <Card
              href="/game/ai-game"
              title="Offline AI Match"
              description="Practice your skills against a challenging AI opponent."
              icon={Computer}
              shadowColor="hover:shadow-[0_0_40px_rgba(160,21,198,0.5)]"
              imageSrc="/game/offline-game-select.webp"
            />
          </div>

          {/* Social Component Card
          <div className="md:col-span-1 flex justify-center">
            <ChallengeFriends />
          </div> */}
        </div>
        
        {/* Call to Action for Leaderboard / Social */}
        <div className="mt-16 text-center">
            <p className="text-gray-300 text-xl mb-4">View global rankings and stats.</p>
            <Link href="/leaderboard" passHref>
                <span className="px-8 py-3 text-lg font-bold text-white bg-gray-700 rounded-full border border-white/20 hover:bg-gray-600 transition-all shadow-xl hover:shadow-gray-700/50">
                    Go to Leaderboard
                </span>
            </Link>
        </div>
      </div>
    </main>
  );
}
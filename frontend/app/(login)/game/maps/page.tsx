"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gamepad2, CheckCircle2 } from "lucide-react";

export default function Maps() {
  const router = useRouter();
  const [selectedMap, setSelectedMap] = useState<string>("default");

  // Since local storage is used, I will keep the useEffect for state persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const map = localStorage.getItem("map");
        if (map) {
            setSelectedMap(map);
        }
    }
  }, []);

  const setMapToLocalStorage = (map: string) => {
    setSelectedMap(map);
    if (typeof window !== 'undefined') {
        localStorage.setItem("map", map);
    }
  };

  const maps = [
    {
      id: "football-mode",
      name: "Football Field",
      image: "/game/football-map-select.webp",
      shadow: "shadow-[0_0_25px_rgba(16,185,129,0.7)]",
    },
    {
      id: "space-mode",
      name: "Cosmic Arena",
      image: "/game/space-map-select.webp",
      shadow: "shadow-[0_0_25px_rgba(124,58,237,0.7)]",
    },
    {
      id: "default",
      name: "Classic Pong",
      image: "/game/default-map-select.webp",
      shadow: "shadow-[0_0_25px_rgba(79,70,229,0.7)]",
    },
  ];

  return (
    <main className="min-h-screen grid place-content-center pt-20 pb-20 bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-10 p-6 sm:p-12 md:p-16 bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center">
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            Select Your Arena
          </h3>
          <p className="text-gray-400 text-lg">
            Choose a theme for your next online match.
          </p>
        </div>

        {/* Map Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {maps.map((map) => {
            const isSelected = selectedMap === map.id;
            return (
              <button
                key={map.id}
                onClick={() => setMapToLocalStorage(map.id)}
                className="flex flex-col items-center group w-full text-left"
              >
                <div
                  className={`relative rounded-xl w-full aspect-video overflow-hidden transition-all duration-300 transform 
                    ${map.shadow}
                    ${isSelected 
                        ? `scale-105 border-4 ${map.shadow.replace('0.7', '1')}` // Stronger selection feedback
                        : "hover:scale-[1.03] hover:border-2 border-white/10"
                    }
                    ${isSelected ? 'border-transparent ring-4 ring-offset-2 ring-offset-gray-800 ring-current' : 'ring-2 ring-transparent'}
                  `}
                  style={{'--ring-current': map.shadow.split('(')[1].split(',')[0]}}
                >
                    <Image
                      width={600}
                      height={450}
                      alt={map.name}
                      src={map.image}
                      className={`w-full h-full object-cover object-center transition-transform duration-500 
                        ${isSelected ? "scale-105" : "group-hover:scale-110"}
                      `}
                    />
                    {isSelected && (
                      <div className="absolute top-3 right-3 p-1.5 bg-green-500 rounded-full shadow-lg">
                        <CheckCircle2 size={20} className="text-white" />
                      </div>
                    )}
                </div>
                <span className="mt-4 font-bold text-white text-xl">{map.name}</span>
              </button>
            );
          })}
        </div>

        {/* Play Button */}
        <button
          className="mt-6 flex gap-4 items-center text-xl sm:text-2xl bg-blue-600 hover:bg-blue-700 py-4 px-12 rounded-full font-extrabold text-white transition-all transform hover:scale-105 shadow-xl shadow-blue-600/40"
          onClick={() => router.push("/game/match")}
        >
          <span>Start Match</span>
          <Gamepad2 size={24} strokeWidth={2.5} />
        </button>
      </div>
    </main>
  );
}
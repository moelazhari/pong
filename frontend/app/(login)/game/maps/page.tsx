"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import Image from "next/image";

export default function Maps() {
  const router = useRouter();
  const [selectedMap, setSelectedMap] = useState<string>("default");

  useEffect(() => {
    const map = localStorage.getItem("map");
    if (map) {
      setSelectedMap(map);
    }
  }, []);

  const setmapToLocalStorage = (map: string) => {
    setSelectedMap(map);
    localStorage.setItem("map", map);
  };

  const maps = [
    {
      id: "football-mode",
      name: "Football",
      image: "/game/football-map-select.webp",
      shadow: "shadow-[0_20px_50px_rgba(89,203,76,1)]",
    },
    {
      id: "space-mode",
      name: "Space",
      image: "/game/space-map-select.webp",
      shadow: "shadow-[0_20px_50px_rgba(179,54,144,1)]",
    },
    {
      id: "default",
      name: "Ping Pong",
      image: "/game/default-map-select.webp",
      shadow: "shadow-[0px_20px_50px_0px_#86c3bb,0px_-10px_50px_0px_#d3455c]",
    },
  ];

  return (
    <main className="min-h-screen grid place-content-center pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center gap-8 p-8 sm:p-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <h3 className="text-gray-300 tracking-wide font-medium text-xl sm:text-3xl">
            Select the Map
          </h3>
        </div>

        {/* Map Selection */}
        <div className="flex justify-center gap-8 items-center flex-col sm:flex-row">
          {maps.map((map) => (
            <button
              key={map.id}
              onClick={() => setmapToLocalStorage(map.id)}
              className="flex flex-col items-center gap-4 group"
            >
              <div
                className={`rounded-xl max-w-[260px] overflow-hidden transition-all ${
                  selectedMap === map.id
                    ? `${map.shadow} scale-110`
                    : "hover:" + map.shadow
                }`}
              >
                <Image
                  width={260}
                  height={195}
                  alt={map.name}
                  src={map.image}
                  className={`w-full object-cover object-center transition-transform ${
                    selectedMap === map.id ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
              </div>
              <span className="font-bold text-white text-lg">{map.name}</span>
            </button>
          ))}
        </div>

        {/* Play Button */}
        <button
          className="flex gap-3 items-center text-2xl sm:text-3xl bg-red hover:bg-red/80 py-3 px-10 rounded-2xl font-bold text-white transition-all transform hover:scale-105 shadow-lg"
          onClick={() => router.push("/game/match")}
        >
          <span>Play</span>
          <Gamepad2 size={32} strokeWidth={2} />
        </button>
      </div>
    </main>
  );
}
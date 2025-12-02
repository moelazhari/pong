import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface score {
  left: number;
  right: number;
  leftPlayer: string;
  rightPlayer: string;
}

interface pScore {
  score: number;
  name: string;
}

function MePlayer({ score, name }: pScore) {
  const baseClasses = "flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2";
  
  if (name === "me") {
    const { data, isLoading } = useQuery({
      queryKey: ["score_me_right"], 
      queryFn: async () => {
        const { data } = await axios.get(`/users/me`);
        return data;
      },
    });
    if (isLoading) return <div className="p-4 rounded-xl bg-gray-700 text-white w-48 text-center">Loading Me...</div>;
    
    return (
      <div className={`${baseClasses} border-green-500/50`}>
        <h1 className="text-green-400 text-4xl sm:text-5xl font-extrabold px-4 py-1 bg-gray-900 rounded-lg shadow-inner order-2 sm:order-1">
            {score}
        </h1>
        
        <div className="flex flex-col items-center order-1 sm:order-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-green-400 shadow-md transform transition-transform duration-300">
            <Image
              src={data.avatar}
              width={100}
              height={100}
              alt={`Avatar of ${data.username}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="text-white font-extrabold text-sm sm:text-lg mt-1 truncate max-w-[100px]">{data.username}</h1>
        </div>
      </div>
    );
  } else {
    const { data, isLoading } = useQuery({
      queryKey: ["score_remote_right"],
      queryFn: async () => {
        const { data } = await axios.get('/users/' + name);
        return data;
      },
      onError: (error: any) => {
        console.log(error);
      } 
    });
    if (isLoading) return <div className="p-4 rounded-xl bg-gray-700 text-white w-48 text-center">Loading Player...</div>;
    
    return (
      <div className={`${baseClasses} border-green-500/50`}>
        <h1 className="text-green-400 text-4xl sm:text-5xl font-extrabold px-4 py-1 bg-gray-900 rounded-lg shadow-inner order-2 sm:order-1">
            {score}
        </h1>

        <div className="flex flex-col items-center order-1 sm:order-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-green-400 shadow-md transform transition-transform duration-300">
            <Image
              src={data.avatar}
              width={100}
              height={100}
              alt={`Avatar of ${data.username}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="text-white font-extrabold text-sm sm:text-lg mt-1 truncate max-w-[100px]">{data.username}</h1>
        </div>
      </div>
    );
  }
}

function OtherPlayer({ score, name }: pScore) {
  const baseClasses = "flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2";

  if (name == "robot") {
    return (
      <div className={`${baseClasses} border-red-500/50`}>
        <div className="flex flex-col items-center order-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-red-400 shadow-md transform transition-transform duration-300">
          <Image
            src="/game/robot.webp"
            width={100}
            height={100}
            alt="Robot Avatar"
            className="w-full h-full object-cover object-center"
          />
          </div>
          <h1 className="text-white font-extrabold text-sm sm:text-lg mt-1">Robot</h1>
        </div>
        
        <h1 className="text-red-400 text-4xl sm:text-5xl font-extrabold px-4 py-1 bg-gray-900 rounded-lg shadow-inner order-2">
            {score}
        </h1>
      </div>
    );
  } else {
    const { data, isLoading } = useQuery({
      queryKey: ["score_remote_left"],
      queryFn: async () => {
        const { data } = await axios.get(`/users/${name}`);
        return data;
      },
    });
    if (isLoading) return <div className="p-4 rounded-xl bg-gray-700 text-white w-48 text-center">Loading Player...</div>;
    
    return (
      <div className={`${baseClasses} border-blue-500/50`}>
        <div className="flex flex-col items-center order-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-blue-400 shadow-md transform transition-transform duration-300">
          <Image
            src={data.avatar}
            width={100}
            height={100}
            alt={`Avatar of ${data.username}`}
            className="w-full h-full object-cover object-center"
          />
          </div>
          <h1 className="text-white font-extrabold text-sm sm:text-lg mt-1 truncate max-w-[100px]">{data.username}</h1>
        </div>
        
        <h1 className="text-blue-400 text-4xl sm:text-5xl font-extrabold px-4 py-1 bg-gray-900 rounded-lg shadow-inner order-2">
            {score}
        </h1>
      </div>
    );
  }
}

function PlayersScore({ left, right, leftPlayer, rightPlayer }: score) {
  return (
    <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4">
      <OtherPlayer score={left} name={leftPlayer} />
      <div className="hidden sm:block text-5xl font-black text-gray-500 mx-12 drop-shadow-lg">VS</div> 
      <MePlayer score={right} name={rightPlayer} />
    </div>
  );
}

export default PlayersScore;
import React from "react";
import Image from "next/image";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WonOffline(){

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/game");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  const {data, isLoading} = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async ()=> {
      const {data} = await axios.get('/users/me')
      return data;
    }
    });
  if (isLoading) return <div className="grid place-content-center h-full w-full text-white text-3xl bg-gray-900">Loading...</div>;

  return (
    <main className="h-full w-full grid place-content-center p-4 sm:p-0 bg-gray-900/90">
      <div className='flex flex-col items-center gap-6 sm:gap-10 p-6 sm:px-16 sm:py-16 bg-gray-800/80 backdrop-blur-lg shadow-[0_0_50px_rgba(75,255,96,0.5)] rounded-3xl border-4 border-[#4bff60f5]'>
        
        <h1 className='text-7xl sm:text-8xl font-black text-[#4bff60f5] drop-shadow-lg animate-pulse'>
          VICTORY!
        </h1>
        
        <p className="text-xl text-gray-300">Congratulations, you dominated the match!</p>
        
        <div className='w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-8 border-gray-600 shadow-2xl'>
          <Image 
            width={400} 
            height={400} 
            alt="Your Avatar" 
            src={data.avatar} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <p className="text-lg text-gray-400 mt-4">
          Redirecting to main menu in 2 seconds...
        </p>
        
      </div>
    </main>
  );
};
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import socket from '@/components/socketG';
import axios from '@/lib/axios';

interface prop {
    setGame: (val: boolean) => void;
}

function LeftPlayer(){
    const {data, isLoading} = useQuery({
        queryKey: ['user', 'me'],
        queryFn: async ()=> {
          const {data} = await axios.get('/users/me')
          return data;
        }
      });
    if (isLoading) return <div className='p-8 rounded-2xl bg-gray-800 text-white shadow-2xl'>Loading Profile...</div>;
    else{
        return (
        <div className = 'flex flex-col items-center justify-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-green-500'>
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-green-400 shadow-xl">
                <Image src={data.avatar} width={200} height={200} alt="Your Avatar" className="w-full h-full object-cover"/>
            </div>
            <h1 className = 'pt-4 text-3xl md:text-4xl font-extrabold text-white'> {data.username} </h1>
            <p className="text-green-400 mt-1 text-sm tracking-widest">-- YOU --</p>
        </div>
    )
}
}

function LoadingPlayer({setGame}: prop){
        const [image, setImage] = useState<string>('/game/unknown.webp');
        const [name, setName] = useState<string>('SEARCHING...');
        const [isMatchFound, setIsMatchFound] = useState<boolean>(false);
    
        const images = [
            "/game/man.webp", "/game/man0.webp", "/game/man1.webp", "/game/man2.webp",
            "/game/man3.webp", "/game/man4.webp", "/game/man5.webp", "/game/man6.webp",
            "/game/man8.webp", "/game/woman.webp", "/game/woman1.webp", "/game/woman2.webp",
            "/game/woman3.webp", "/game/woman4.webp", "/game/woman5.webp",
        ];
    
        useEffect(() => {
            let interval: NodeJS.Timeout | null = null;
            if (!isMatchFound) {
                interval = setInterval(() => {
                    setImage(images[Math.floor(Math.random() * images.length)]);
                }, 200);
            }
            
            socket.on('refresh-page', () => {
                setGame(true);
            });
    
            socket.on('match-found', async (player: string) => {
                if (interval) clearInterval(interval);
                
                try {
                    const { data } = await axios.get(`/users/${player}`);
                    setName(data.username.toUpperCase());
                    setImage(data.avatar);
                    setIsMatchFound(true);
                    
                    setTimeout(() => {
                        setGame(true);
                    }, 1000); // Dramatic pause before starting
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setName("ERROR");
                }
            });
            
            return () => {
                socket.off('match-found');
                socket.off('refresh-page');
                if (interval) clearInterval(interval);
            };
        }, [isMatchFound, setGame]);
            
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-red-500">
                <div className={`w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${isMatchFound ? 'border-red-500 shadow-red-500/50' : 'border-blue-400 shadow-blue-400/50 animate-pulse'} shadow-xl transition-all duration-500`}>
                    <Image src={image} width={200} height={200} alt="Opponent Avatar" className="w-full h-full object-cover"/>
                </div>
              <h1 className = {`pt-4 text-3xl md:text-4xl font-extrabold transition-colors duration-500 ${isMatchFound ? 'text-red-400' : 'text-blue-400'}`}> {name} </h1>
              <p className="text-gray-400 mt-1 text-sm tracking-widest">
                {isMatchFound ? '-- MATCH FOUND --' : '-- OPPONENT --'}
              </p>
            </div>
        )
    }

    export {LeftPlayer, LoadingPlayer}
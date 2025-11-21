'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import socket from "@/components/socketG";
import axios from "@/lib/axios";

const InviteDisplay = ({ socketId, setDisplay, userid, map }) => {
  const [timeLeft, setTimeLeft] = useState(4);
  const [image, setImage] = useState("/game/unknown.webp");
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await axios.get(`/users/getId/${userid}`);
      setName(data.username);
      setImage(data.image);
    }
    fetchUser();
  }, [userid]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setDisplay(null);
      toast.dismiss();
    }
  }, [timeLeft, setDisplay]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 0.01);
    }, 10);
    return () => clearInterval(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("map", map);
    setDisplay(null);
    socket.emit("accept-invitation", { senderUsername: userid, senderSocketId: socketId });
    toast.dismiss();
  };

  const handleDecline = () => {
    setDisplay(null);
    toast("You declined the game invitation", { icon: "👎" });
  };

  return (
    <div className="absolute right-3 bottom-10 z-10">
      <div className="flex mt-1 justify-between bg-[rgb(78,113,163)] px-4 py-2 rounded-xl gap-2 sm:gap-8">
        <div className="flex items-center gap-4">
          <img className="sm:w-[48px] sm:h-[48px] rounded-full" src={image} alt="user image" />
          <div className="text-left">
            <h3 className="text-[12px] sm:text-[20px]">{name}</h3>
            <p className="text-[8px] sm:text-[10px]">wants to play with you</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] sm:gap-4 sm:text[24px]">
          <button className="bg-[rgb(248,72,72)] rounded-xl px-2 py-1 sm:px-4 sm:py-2" onClick={handleDecline}>
            Decline
          </button>
          <button className="bg-[rgba(86,245,65,0.75)] rounded-xl px-2 py-1 sm:px-4 sm:py-2" onClick={handleAccept}>
            Accept
          </button>
        </div>
      </div>
      <div className="relative h-2 rounded">
        <div
          className="absolute bg-[rgb(146,230,135)] h-[5px] rounded-xl"
          style={{ width: `${(timeLeft / 4) * 100}%` }}
        />
      </div>
    </div>
  );
};

const Invite = () => {
  const [display, setDisplay] = useState(null);
  const [socketId, setSocketId] = useState("");
  const [userId, setUserId] = useState(0);
  const [map, setMap] = useState("default");
  const router = useRouter();

  useEffect(() => {
    socket.on("play-a-friend", () => {
      router.push("/game/match");
    });
    socket.on("game-invitation", (data) => {
      setDisplay(data.sender);
      setMap(data.map);
      setSocketId(data.senderSocketId);
      setUserId(data.sender);
      toast(`${data.sender} invited you to play ${data.map}`);
    });

    return () => {
      socket.off("game-invitation");
      socket.off("play-a-friend");
      toast.dismiss();
    };
  }, [router]);

  useEffect(() => {
    let timer;
    if (display !== null) {
      timer = setTimeout(() => {
        setDisplay(null);
        toast.dismiss();
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [display]);

  return (
    <>
      <Toaster position="bottom-right" />
      {display !== null && <InviteDisplay userid={userId} socketId={socketId} setDisplay={setDisplay} map={map} />}
    </>
  );
};

export default Invite;

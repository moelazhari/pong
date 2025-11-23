"use client";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Client } from "@/providers/QueryProvider";
import { Loader2, ImagePlus } from "lucide-react";
import { useState } from "react";
import UserParametres from "@/components/profile/UserParametres";
import uploadImage from "@/lib/uploadImage";

const User = ({ user, isMe }: { user: any; isMe: boolean }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const updateBaner = useMutation({
    mutationKey: ["updateBaner"],
    mutationFn: async (userData: any) => {
      await axios.patch("/users/updateMe", userData);
    },
    onSuccess: () => {
      Client.refetchQueries(["user", "me"]);
    },
  });

  const handleChange = async (e: any) => {
    setIsLoading(true);
    try {
      const uploadedImage = await uploadImage(e.target.files[0]);
      await updateBaner.mutateAsync({ baner: uploadedImage });
    } catch (error) {
      console.error("Failed to upload banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden sm:rounded-3xl sm:shadow-2xl">
      {/* Banner with fixed height */}
      <div className="w-full h-48 sm:h-64 relative">
        <Image
          priority
          className="w-full h-full object-cover object-center"
          src={user.baner}
          alt="banner"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 660px, 660px"
        />
        
        {/* Edit banner button */}
        {isMe && (
          <label className="absolute right-4 top-4 cursor-pointer bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all">
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} strokeWidth={2} />
            ) : (
              <ImagePlus size={24} strokeWidth={2} className="text-white" />
            )}
            <input
              type="file"
              className="hidden"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleChange}
            />
          </label>
        )}
      </div>

      {/* User info overlay */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
        <div className="flex gap-4 items-end">
          <div className="rounded-full w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-4 border-white shadow-lg">
            <Image
              priority
              className="w-full h-full object-cover"
              src={user.avatar}
              alt={user.username}
              width={96}
              height={96}
            />
          </div>
          <div className="flex flex-col gap-1 pb-1">
            <h2 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg">
              {user.username}
            </h2>
            {!isMe && user.status && (
              <span
                className={`text-sm sm:text-base font-medium ${
                  user.status.toLowerCase() === "online"
                    ? "text-green-400"
                    : user.status.toLowerCase() === "in game"
                    ? "text-blue"
                    : "text-red-400"
                }`}
              >
                {user.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isMe && <UserParametres id={user.id} />}
    </div>
  );
};

export default User;
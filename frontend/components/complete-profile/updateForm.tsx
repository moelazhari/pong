"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, User, ArrowRight, Check, AlertCircle } from "lucide-react";
import axios from "@/lib/axios";
import { z } from "zod";
import AvatarUploader from "@/components/ui/AvatarUploader"; 
import { completeProfileSchema } from "@/models/user";

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

const UpdateForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      avatar: "/img/a.jpeg",
    },
  });

  const currentAvatar = watch("avatar");

  const updateUser = useMutation({
    mutationFn: async (userData: CompleteProfileFormData) => {
      const { data } = await axios.patch("users/me/profile", userData);
      return data;
    },
    onSuccess: () => {
      toast.success("Welcome to the game!");
      setTimeout(() => router.push("/profile"), 800);
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        setError("username", {
          message: "Username already taken",
        });
      } else {
        toast.error("Connection failed. Try again.");
      }
    },
  });

  const onSubmit = async (data: CompleteProfileFormData) => {
    await updateUser.mutateAsync(data);
  };

  const handleAvatarUpload = (url: string) => {
    setValue("avatar", url, { shouldValidate: true, shouldDirty: true });
  };

  const isLoading = isSubmitting || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-full">
      
      {/* 1. Avatar Section */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <AvatarUploader
          currentAvatar={currentAvatar}
          isMe={true}
          onUpload={handleAvatarUpload}
          isUploadingExternal={isLoading} 
        />
        <span className="text-xs text-blue font-bold tracking-widest uppercase bg-blue/10 px-3 py-1 rounded-full border border-blue/20">
          Upload Photo
        </span>
      </div>

      {/* 2. Username Input */}
      <div className="w-full mb-8">
        <label 
          htmlFor="username" 
          className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider"
        >
          Username
        </label>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`w-5 h-5 transition-colors ${
              errors.username ? "text-red" : "text-gray-500 group-focus-within:text-blue"
            }`} />
          </div>
          
          <input
            id="username"
            type="text"
            placeholder="Choose your alias"
            disabled={isLoading}
            autoComplete="off"
            className={`
              w-full pl-11 pr-4 py-4 rounded-xl text-white placeholder-gray-600 outline-none transition-all border
              ${errors.username 
                ? "bg-red/5 border-red/50 focus:ring-1 focus:ring-red/50" 
                : "bg-black/20 border-white/10 focus:border-blue/50 focus:bg-black/40 focus:ring-1 focus:ring-blue/50"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            {...register("username")}
          />
        </div>

        {/* Error / Validation Message */}
        <div className="h-6 mt-2 pl-1">
          {errors.username ? (
            <span className="text-red text-xs flex items-center gap-1 font-bold animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={12} />
              {errors.username.message}
            </span>
          ) : (
             <span className="text-gray-500 text-xs">
               Unique identifier for the game.
             </span>
          )}
        </div>
      </div>

      {/* 3. Action Button */}
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className={`
          w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
          ${isLoading 
            ? "bg-white/5 text-gray-400 cursor-wait border border-white/5"
            : !isValid 
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-blue hover:bg-blue/80 text-white shadow-lg shadow-blue/20 hover:shadow-blue/40 hover:-translate-y-1"
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Processing...</span>
          </>
        ) : updateUser.isSuccess ? (
          <>
            <Check size={20} />
            <span>Success!</span>
          </>
        ) : (
          <>
            <span>Enter Arena</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>

    </form>
  );
};

export default UpdateForm;
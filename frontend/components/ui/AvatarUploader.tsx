"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface AvatarUploaderProps {
  currentAvatar: string;
  isMe: boolean;
  onUpload: (url: string) => void;
  isUploadingExternal?: boolean; // In case parent wants to control loading state
}

export default function AvatarUploader({
  currentAvatar,
  isMe,
  onUpload,
  isUploadingExternal = false,
}: AvatarUploaderProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = localLoading || isUploadingExternal;

  if (!isMe) {
    // If it's not me, just return the image without upload logic
    return (
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden ring-4 ring-black/40 shadow-2xl shrink-0">
        <Image
          src={currentAvatar || "/placeholder.svg"}
          alt="User Avatar"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative group shrink-0">
      <CldUploadWidget
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
        uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET}
        onSuccess={(result: any) => {
          if (result?.info?.secure_url) {
            setLocalLoading(true);
            onUpload(result.info.secure_url);
            // We assume the parent will trigger a re-render or toast, 
            // but we turn off local loading after a short delay or let parent handle it
            setTimeout(() => setLocalLoading(false), 1000);
          }
        }}
        options={{
          multiple: false,
          maxFiles: 1,
          clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
          maxFileSize: 5000000,
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: false, 
        }}
      >
        {({ open }) => (
          <button
            onClick={() => !isLoading && open()}
            disabled={isLoading}
            className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden ring-4 ring-black/40 shadow-2xl transition-transform transform active:scale-95"
          >
            <Image
              src={currentAvatar || "/placeholder.svg"}
              alt="My Avatar"
              fill
              className={`object-cover transition-all duration-300 ${
                isLoading ? "opacity-50 blur-sm" : "group-hover:opacity-75"
              }`}
              priority
            />
            
            {/* Overlay for "My Profile" */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/60 p-2 rounded-full backdrop-blur-md">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-8 h-8 text-blue animate-spin" />
              </div>
            )}
          </button>
        )}
      </CldUploadWidget>
      
      <div className="absolute -bottom-2 -right-2 bg-blue text-white p-1.5 rounded-full border-4 border-[#0f172a] shadow-sm z-20">
         <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
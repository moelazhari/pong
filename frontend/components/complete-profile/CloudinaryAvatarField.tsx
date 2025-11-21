"use client";

import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus } from "lucide-react";
import { useController, Control } from "react-hook-form";

interface CloudinaryAvatarFieldProps {
  name: string;
  control: Control<any>;
  defaultPreview?: string;
}

export default function CloudinaryAvatarField({ 
  name, 
  control, 
  defaultPreview = "/img/a.jpeg" 
}: CloudinaryAvatarFieldProps) {
  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules: { required: "Please upload an avatar" }
  });

  const avatarUrl = value || defaultPreview;

  return (
    <div className="flex flex-col items-center">
      <CldUploadWidget
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
        uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET}
        onSuccess={(result) => {
          if (typeof result.info === "object" && "secure_url" in result.info) {
            onChange(result.info.secure_url);
          }
        }}
        onError={(error) => {
          console.error("Upload error:", error);
        }}
        options={{ 
          multiple: false,
          maxFiles: 1,
          sources: ['local', 'camera'],
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
          maxFileSize: 5000000,
          cropping: true,
          croppingAspectRatio: 1,
          croppingShowDimensions: true,
        }}
      >
        {({ open }) => (
          <div
            onClick={() => open()}
            className="relative cursor-pointer hover:opacity-80 transition-opacity duration-300 w-40 h-40"
          >
            <img
              src={avatarUrl}
              alt="avatar preview"
              className="rounded-full object-cover border-2 border-gray-300 w-40 h-40"
              draggable={false}
            />
            <div className="absolute bottom-4 right-0 bg-white rounded-full p-1 drop-shadow-lg">
              <ImagePlus size={28} strokeWidth={2} color="black" />
            </div>
          </div>
        )}
      </CldUploadWidget>
      {error && (
        <p className="text-red text-xs mt-2">{error.message}</p>
      )}
    </div>
  );
}
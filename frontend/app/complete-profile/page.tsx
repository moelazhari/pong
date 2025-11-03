"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, ImagePlus } from "lucide-react"
import uploadImage from "@/lib/uploadImage"
import axios from "@/lib/axios"
import { completeProfileSchema } from "@/models/user"

type UpdateFormData = z.infer<typeof completeProfileSchema>

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"]

const UpdateForm = () => {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState("/img/a.jpeg")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      image: undefined,
    },
  })

  const onImageChange = (file: File) => {
    setValue('image', file, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(file))
  }

  const updateUser = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      let uploadedImageUrl = undefined
      if (data.image) {
        uploadedImageUrl = await uploadImage(data.image)
      }
      const payload = { username: data.username, image: uploadedImageUrl }
      await axios.patch("me/profile", payload)
    },
    onSuccess: () => {
      router.push("/profile")
    },
  })

  const onSubmit = async (data: UpdateFormData) => {
    await updateUser.mutateAsync(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col  max-w-md w-full">
      <label className="relative cursor-pointer self-center hover:opacity-80 transition-opacity duration-300 mb-2">
        <Image
          priority
          src={imagePreview || "/placeholder.svg"}
          alt="avatar preview"
          width={160}
          height={160}
          className="rounded-full object-cover border-2 border-gray-300 w-40 h-40"
        />
        <ImagePlus
          size={28}
          strokeWidth={2}
          color="black"
          className="absolute bottom-4 right-0 bg-white rounded-full p-1 drop-shadow-lg"
        />
        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          {...register("image", {
            validate: {
              acceptedFormats: (fileOrFiles) => {
                console.log("sdfdfdsfdsfdsfdsfdsfds");
                const file = fileOrFiles instanceof FileList ? fileOrFiles[0] : fileOrFiles;
                if (!file) return true;
                return ACCEPTED_IMAGE_TYPES.includes(file.type) || "Invalid file type";
              },
              maxSize: (fileOrFiles) => {
                const file = fileOrFiles instanceof FileList ? fileOrFiles[0] : fileOrFiles;
                if (!file) return true;
                return file.size <= MAX_FILE_SIZE || "File size must be under 5MB";
              },
            },
          })}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onImageChange(e.target.files[0])
            }
          }}
        />
      </label>
      <p className="h-2 text-red mb-4 text-xs">{errors?.image?.message}</p>
      
      <label className={"text-xl mb-2"}>
          Enter Your Username
      </label>
      <input
        id="username"
        type="text"
        placeholder="Username"
        className={`text-black w-full px-3 py-2 border rounded mb-1 focus:outline-none focus:ring-2 focus:ring-blue ${errors.username? "border-red focus:ring-red" : "border-gray-300"}`}
            aria-invalid={errors.username ? "true" : "false"}
        {...register("username")}
      />
      <p className="h-2 text-red mb-4 text-xs">{errors?.username?.message}</p>

      <button
        type="submit"
        // disabled={isSubmitting}
        className="mt-12 h-12 rounded-2xl bg-blue px-12 hover:opacity-80 disabled:opacity-50 transition-opacity duration-200 flex items-center justify-center gap-2"
      >
        Save
        {isSubmitting && <Loader2 className="animate-spin" size={18} strokeWidth={1.2} />}
      </button>
    </form>
  )
}

export default function SignIn() {
  return (
    <main className="grid place-content-center h-screen w-full bg-bg bg-cover bg-center">
      <section className="flex flex-col items-center rounded-[50px] py-16 px-10 max-w-xl mx-auto bg-white bg-opacity-20 backdrop-blur-lg drop-shadow-lg">
        <h1 className="text-3xl font-bold mb-12">Complete your profile</h1>
        <UpdateForm />
      </section>
    </main>
  )
}

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import toast from 'react-hot-toast'
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import axios from "@/lib/axios"
import CloudinaryAvatarField from "@/components/complete-profile/CloudinaryAvatarField"
import { completeProfileSchema } from "@/models/user"

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>

const UpdateForm = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    setError,
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      avatar: "/img/a.jpeg",
    },
  })

  const updateUser = useMutation({
    mutationFn: async (userData: CompleteProfileFormData) => {
      const {data} = await axios.patch("users/me/profile", userData)
      console.log(data);
      return data
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!")
      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        setError("username", { 
          message: "Username already taken. Please choose another." 
        })
        toast.error("Username is already taken")
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || "Invalid data provided"
        toast.error(errorMsg)
        setError("root", { message: errorMsg })
      } else {
        toast.error("Failed to update profile. Please try again.")
        setError("root", { 
          message: "Failed to update profile. Please try again." 
        })
      }
    },
  })

 const onSubmit = async (data: CompleteProfileFormData) => {
    // Show loading toast
    const toastId = toast.loading("Updating your profile...")
    
    try {
      await updateUser.mutateAsync(data)
      toast.dismiss(toastId)
    } catch (error) {
      toast.dismiss(toastId)
    }
  }
  const isLoading = isSubmitting || updateUser.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-w-md w-full">

      {/* Cloudinary Avatar Upload */}
      <CloudinaryAvatarField 
        name="avatar"
        control={control}
        defaultPreview="/img/a.jpeg"
      />

      {/* Username Input */}
      <label htmlFor="username" className="text-xl mb-2 mt-6">
        Enter Your Username
      </label>
      <input
        id="username"
        type="text"
        placeholder="Username"
        disabled={isLoading}
        className={`text-black w-full px-3 py-2 border rounded mb-1 focus:outline-none focus:ring-2 transition-colors ${
          errors.username 
            ? "border-red-500 focus:ring-red-500" 
            : "border-gray-300 focus:ring-blue-500"
        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
        aria-invalid={errors.username ? "true" : "false"}
        aria-describedby={errors.username ? "username-error" : undefined}
        {...register("username")}
      />
      {errors.username && (
        <p id="username-error" className="text-red text-xs mb-4 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.username.message}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="mt-12 h-12 rounded-2xl bg-blue text-white px-12 hover:bg-blue-700 disabled:bg-blue/40 disabled:cursor-crosshair transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Saving...
          </>
        ) : updateUser.isSuccess ? (
          <>
            <CheckCircle2 size={18} />
            Saved!
          </>
        ) : (
          "Save Profile"
        )}
      </button>

      {/* Helper text */}
      <p className="text-center text-sm mt-4">
        {isLoading 
          ? "Please wait while we update your profile..."
          : "All fields are required to continue"}
      </p>
    </form>
  )
}

export default UpdateForm;

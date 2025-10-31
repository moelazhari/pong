"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signDto } from "@/dto/userDto";
import axios from "@/lib/axios";
import { signSchema } from "@/models/user";
import Image from 'next/image';

type FormData = {
  email: string
  password: string
}

function FormFields({isSignUp}: {isSignUp : boolean}) {
  const Router = useRouter();

  const singUp = useMutation({
  mutationFn: async (Data: signDto) => {
      console.log(Data);
      await axios.post("/auth/signup", Data);
    },
    onSuccess: () => {
      Router.push("/profile");
    },
    onError: (error: any) => {
      alert("Sign up failed: " + (error.response?.data?.message || "Unknown error"));
    }
  })

  const singIn = useMutation({
  mutationFn: async (Data: signDto) => {
    await axios.patch("/auth/signin", Data)
  },
  onSuccess: () => {
    Router.push("/profile");
  },
  onError: (error: any) => {
      alert("Sign in failed: " + (error.response?.data?.message || "Unknown error"));
  }
});

  const onSubmit = async (data: FormData) => {
    isSignUp ?  singUp.mutate(data) : singIn.mutate(data)
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-start"
        noValidate
      >
          <label htmlFor="email" className="block mb-2 font-semibold text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`text-black w-full px-3 py-2 border rounded mb-1 focus:outline-none focus:ring-2 focus:ring-blue ${errors.email ? "border-red focus:ring-red" : "border-gray-300"}`}
            aria-invalid={errors.email ? "true" : "false"}
            autoComplete="email"
          />
          <p className="h-2 text-red mb-4 text-xs">{errors?.email?.message}</p>

          <label htmlFor="password" className="block mb-2 font-semibold text-sm">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={`text-black w-full px-3 py-2 border rounded mb-1 focus:outline-none focus:ring-2 focus:ring-blue ${errors.password ? "border-red focus:ring-red" : "border-gray-300"}`}
            aria-invalid={errors.password ? "true" : "false"}
            autoComplete="new-password"
          />
          <p className="h-2 text-red mb-4 text-xs">{errors?.password?.message}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg mt-4 font-semibold transition-colors disabled:opacity-50"
        >
          {isSignUp ? "Sign Up" : "Sign In" }
          {isSubmitting && "Submitting..."  } 
        </button>
      </form>
)}

export default function SignForm() {
  const [isSignUp, setIsSignUP] = useState<boolean>(true);

  return (
    <section
      className="flex-1 place-content-center bg-bg bg-cover bg-no-repeat"
    >
      <div
        className="flex flex-col gap-6 max-w-md mx-auto rounded-3xl p-8 bg-white/20 backdrop-blur-lg drop-shadow-lg"
      >
        <h1 className="text-red text-7xl font-bold">
        Ping
        <span className="block text-blue mt-4 lg:inline"> Pong</span>
        </h1>
        <p className="mt-4">
          {isSignUp ? "We suggest using your email to Sing UP" : "Sign in to ping pong using your account"}
        </p>
        <FormFields isSignUp={isSignUp} />
        <div className="w-full border border-gray-500"></div>
        <div className="w-full flex flex-col gap-2">

          <a href={`${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/42`}>
            <button className="w-full flex items-center justify-center gap-2 bg-blue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
              <Image src="/icons/42.svg" width={20} height={20} alt="42" />
              Sign in with intra
            </button>
          </a>

          <a href={`${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/google`}>
            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-black text-sm font-medium px-4 py-2.5 rounded-lg border">
              <Image src="/icons/google.svg" width={20} height={20} alt="google" />
              Sign in with google
            </button>
          </a>
        </div>
        <p> { isSignUp ?  "Already have an account? " : "Don't have an account? " }
        <span className="text-blue cursor-pointer hover:underline"
              onClick={() => setIsSignUP(!isSignUp)}
        > { isSignUp ?  "Sign In" : "Sing Up" }</span>
        </p>
      </div>
    </section>
)}
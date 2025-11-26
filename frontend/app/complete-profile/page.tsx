"use client";

import UpdateForm from "@/components/complete-profile/updateForm";

export default function CompleteProfile() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '1s' }} 
        />
      </div>

      <section className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
            Profile Setup
          </h1>
          <p className="text-gray-400 font-medium">
            Choose your avatar and username to join the arena.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <UpdateForm />
        </div>
      </section>
    </main>
  );
}
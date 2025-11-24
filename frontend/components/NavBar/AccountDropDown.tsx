"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useCloseOutSide from "@/hookes/useCloseOutSide";
import { UserCircle2, Settings, LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

const DropDown = ({ src, setIsOpen }: { src: string; setIsOpen: (v: boolean) => void }) => {
  const { divref } = useCloseOutSide({ setIsOpen });
  const router = useRouter();

  const logout = useMutation({
    mutationFn: async () => {
      await axios.delete("/auth/logout");
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  const menuItems = [
    { href: "/profile", icon: UserCircle2, label: "Profile", color: "text-blue" },
    { href: "/settings", icon: Settings, label: "Settings", color: "text-gray-400" },
  ];

  return (
    <div
      ref={divref}
      className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
    >
      <div className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} strokeWidth={2} />
              <span className="text-sm font-medium text-white">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout.mutate()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red/10 transition-all group"
        >
          <LogOut size={20} className="text-red group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span className="text-sm font-medium text-red">Logout</span>
        </button>
      </div>
    </div>
  );
};

const AccountDropDown = ({ isLoading, src }: { isLoading: boolean; src: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-2">
        <UserCircle2 size={32} className="text-gray-400 animate-pulse" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-blue/50 transition-all">
          <Image
            className="w-full h-full object-cover"
            src={src}
            alt="avatar"
            width={36}
            height={36}
          />
        </div>
      </button>
      {isOpen && <DropDown src={src} setIsOpen={setIsOpen} />}
    </div>
  );
};

export default AccountDropDown;
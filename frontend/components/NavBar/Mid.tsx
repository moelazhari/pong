"use client";
import { BarChart2, Gamepad2, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Mid = () => {
  const currentRoute = usePathname();
  
  const navItems = [
    { href: "/leaderboard", icon: BarChart2, label: "Leaderboard" },
    { href: "/game", icon: Gamepad2, label: "Game" },
    { href: "/chat", icon: MessagesSquare, label: "Chat" },
  ];

  return (
    <div className="hidden md:flex gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentRoute.startsWith(item.href);
        
        return (
          <Link 
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`relative group px-4 py-2 rounded-xl transition-all ${
              isActive 
                ? "bg-blue/20 text-blue" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={28} strokeWidth={isActive ? 2.5 : 1.5} />
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default Mid;
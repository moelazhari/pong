"use client"

import { BarChart2, Gamepad2, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Mid = () => {
  const currentRoute = usePathname();
  const navigationRoutes: string[] = ["/leaderboard", "/game", "/chat"];

  return (
    <div className="hidden md:basis-1/3 md:flex md:justify-between">
      <Link aria-label="leaderboard" href={navigationRoutes[0]}>
        <div
          className={`grid place-content-center h-[55px] w-[56px] hover:opacity-50 ${
            currentRoute === navigationRoutes[0] ? "opacity-50" : ""
          }`}
        >
          <BarChart2 size={32} color="#7ac7c4" strokeWidth={3} />
        </div>
      </Link>
      <Link aria-label="game" href={navigationRoutes[1]}>
        <div
          className={`grid place-content-center h-[55px] w-[56px] hover:opacity-50 ${
            currentRoute === navigationRoutes[1] ? "opacity-50" : ""
          }`}
        >
          <Gamepad2 size={32} color="#7ac7c4" strokeWidth={1.5} />
        </div>
      </Link>
      <Link aria-label="chat" href={navigationRoutes[2]}>
        <div
          className={`grid place-content-center h-[55px] w-[56px] hover:opacity-50 ${
            currentRoute === navigationRoutes[2] ? "opacity-50" : ""
          }`}
        >
          <MessagesSquare size={32} color="#7ac7c4" strokeWidth={1.5} />
        </div>
      </Link>
    </div>
  );
};

export default Mid;
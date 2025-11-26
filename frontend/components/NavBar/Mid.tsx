"use client"
import { BarChart2, Gamepad2, MessagesSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Mid = () => {
  const currentRoute = usePathname()

  const navItems = [
    { href: "/leaderboard", icon: BarChart2, label: "Leaderboard" },
    { href: "/game", icon: Gamepad2, label: "Play Game" },
    { href: "/chat", icon: MessagesSquare, label: "Chat" },
  ]

  return (
    <div className="hidden md:flex gap-1 items-center bg-gray-900/50 rounded-full p-1 border border-white/10 shadow-inner">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentRoute.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all text-sm
              ${isActive 
                ? "bg-blue text-white shadow-md shadow-blue/20" 
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }
            `}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default Mid
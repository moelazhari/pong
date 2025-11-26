import Link from "next/link";
import { usePathname } from "next/navigation"
import { BarChart2, Gamepad2, MessagesSquare } from "lucide-react"

const MobileFooterNav = () => {
  const currentRoute = usePathname()

  const navItems = [
    { href: "/leaderboard", icon: BarChart2, label: "Leaderboard" },
    { href: "/game", icon: Gamepad2, label: "Play" },
    { href: "/chat", icon: MessagesSquare, label: "Chat" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden flex justify-around items-center h-14 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-t-lg z-50 p-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentRoute === item.href || (item.href !== '/' && currentRoute.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`
              relative flex flex-col items-center justify-center w-full h-full text-center transition-all
              ${isActive 
                ? "text-blue-400 scale-110" 
                : "text-gray-400 hover:text-white"
              }
            `}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-xs mt-0.5 font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default MobileFooterNav;
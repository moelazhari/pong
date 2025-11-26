"use client"

import Image from "next/image"
import { useState } from "react"
import { Menu, XCircle, BarChart2, Gamepad2, MessagesSquare, Settings, Home } from "lucide-react"
import GlobalSearch from "./GlobalSearch"
import useCloseOutSide from "@/hookes/useCloseOutSide"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"

interface Props {
  src: string
  setIsOpen: (isOpen: boolean) => void
}

const DropDown = ({ src, setIsOpen }: Props) => {
  const { divref } = useCloseOutSide({ setIsOpen })
  const router = useRouter()

  const logout = useMutation({
    mutationFn: async () => {
      await axios.delete("/auth/logout")
    },
    onSuccess: () => {
      router.push("/")
    },
  })

  const navigationRoutes = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/leaderboard", icon: BarChart2, label: "Leaderboard" },
    { href: "/game", icon: Gamepad2, label: "Game" },
    { href: "/chat", icon: MessagesSquare, label: "Chat" },
    { href: "/profile", icon: "avatar", label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div
      ref={divref}
      className="fixed inset-0 top-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-40 md:hidden flex flex-col"
    >
      <div className="p-4 border-b border-white/10">
        <GlobalSearch />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigationRoutes.map((item) => {
          const Icon = item.icon
          const isAvatar = item.icon === "avatar"

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/10 transition-all group"
              onClick={() => setIsOpen(false)}
            >
              {isAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                  <Image
                    className="w-full h-full object-cover"
                    src={src || "/placeholder.svg"}
                    alt="profile"
                    width={32}
                    height={32}
                  />
                </div>
              ) : (
                <Icon size={24} className="text-blue group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              )}
              <span className="text-base font-medium text-white">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            logout.mutate()
            setIsOpen(false)
          }}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red/10 transition-all group"
        >
          <div className="text-red group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <span className="text-base font-medium text-red">Logout</span>
        </button>
      </div>
    </div>
  )
}

const MenuDropDown = ({ src }: { src: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <div className="relative grid md:hidden place-content-center h-[55px] w-[56px] hover:opacity-50">
        <button aria-label="menu" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <XCircle size={28} color="#EA5581" strokeWidth={1.5} />
          ) : (
            <Menu size={32} color="#7ac7c4" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {isOpen && <DropDown src={src} setIsOpen={setIsOpen} />}
    </>
  )
}

export default MenuDropDown;

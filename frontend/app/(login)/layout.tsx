import "@/app/globals.css";
import NavBar  from "@/components/NavBar/NavBar";
import Invite from "@/components/game/Invite";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <main className="min-h-screen w-full pt-24 pb-8 px-3 sm:px-6 lg:px-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
        <NavBar />
        <Invite/>
        {children}
    </main> 
  )
}
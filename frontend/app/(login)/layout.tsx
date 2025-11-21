import "@/app/globals.css";
import NavBar  from "@/components/NavBar/NavBar";
import Invite from "@/components/game/Invite";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <main className="h-screen bg-bg bg-cover bg-no-repeat">
        <NavBar />
        <Invite/>
        {children}
    </main> 
  )
}
import Link from "next/link";
import Image from "next/image";

export default function Gamehome() {
  return (
    <main className="min-h-screen grid place-content-center pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="font-bold text-2xl flex flex-wrap gap-10 items-center justify-center px-10 py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl sm:gap-20 sm:text-4xl sm:p-28">
        {/* Online Game */}
        <div className="relative flex flex-col gap-4 group">
          <Link href="/game/maps">
            <div className="rounded-xl max-w-[340px] overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(52,206,214,0.5)] group-hover:scale-105">
              <Image
                priority
                width={340}
                height={290}
                alt="Online game"
                src="/game/online-game-select.webp"
                className="object-cover object-center transition-transform group-hover:scale-110"
              />
            </div>
          </Link>
          <span className="absolute bottom-2 left-2 text-white font-bold text-shadow-lg">
            Online Game
          </span>
        </div>

        {/* Offline Game */}
        <div className="relative flex flex-col gap-4 group">
          <Link href="/game/ai-game">
            <div className="rounded-xl max-w-[340px] overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(160,21,198,0.5)] group-hover:scale-105">
              <Image
                priority
                width={340}
                height={290}
                alt="Offline game"
                src="/game/offline-game-select.webp"
                className="object-cover object-center transition-transform group-hover:scale-110"
              />
            </div>
          </Link>
          <span className="absolute bottom-2 left-2 text-white font-bold text-shadow-lg">
            Offline Game
          </span>
        </div>
      </div>
    </main>
  );
}
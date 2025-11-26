import Image from "next/image";
import GlobalSearch from "./GlobalSearch";
import Link from "next/link";
import { Search } from "lucide-react"

const Left = ({ isMobileSearchOpen, setIsMobileSearchOpen }: { isMobileSearchOpen: boolean, setIsMobileSearchOpen: (v: boolean) => void }) => {
    
    const showLogo = !isMobileSearchOpen;
    
    return (
        <div className="ml-4 lg:ml-6 flex items-center gap-4">
            {showLogo && (
                <Link href="/" aria-label="Home">
                    <Image 
                        className="w-24 sm:w-32" 
                        priority  
                        src="/img/website_logo.svg" 
                        alt="logo" 
                        width={128} 
                        height={40} 
                    />
                </Link>
            )}

            <div className="hidden sm:block w-40 md:w-64 lg:w-72">
                <GlobalSearch />
            </div>
            
            {!isMobileSearchOpen && (
                <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="sm:hidden p-2 rounded-full text-gray-400 hover:text-white transition-colors"
                    aria-label="Open Search"
                >
                    <Search size={24} />
                </button>
            )}
        </div>
    );
};

export default Left;
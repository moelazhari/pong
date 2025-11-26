"use client"
import {useState} from "react"
import Left from "./Left"
import Mid from "./Mid"
import MobileFooterNav from "./MobileFooterNav"
import Right from "./Right"
import GlobalSearch from "./GlobalSearch"

const NavBar = () => {
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    
    // Determine the content of the main header bar based on mobile search state
    const HeaderContent = () => {
        // When mobile search is open, show the full-width GlobalSearch component
        if (isMobileSearchOpen) {
            return (
                <div className="flex flex-1 items-center px-4 h-full">
                    <GlobalSearch 
                        isMobile={true} 
                        onMobileClose={() => setIsMobileSearchOpen(false)}
                    />
                </div>
            );
        } else {
            // Otherwise, show the standard Left, Mid, and Right components
            return (
                <>
                    <Left 
                        isMobileSearchOpen={isMobileSearchOpen} 
                        setIsMobileSearchOpen={setIsMobileSearchOpen} 
                    />
                    <Mid />
                    <Right 
                        isMobileSearchOpen={isMobileSearchOpen} 
                    />
                </>
            );
        }
    }
    
    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 flex items-center h-16 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg z-50 ${isMobileSearchOpen ? 'justify-start' : 'justify-between'}`}>
                {HeaderContent()}
            </nav>
            
            <MobileFooterNav />
        </>
    )
}

export default NavBar;

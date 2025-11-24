import Image from "next/image";
import GlobalSearch from "./GlobalSearch";

const Left = () => {
  return (
    <div className="ml-4 lg:ml-6 flex items-center gap-4">
      <Image 
        className="w-24 sm:w-32" 
        priority  
        src="/img/website_logo.svg" 
        alt="logo" 
        width={128} 
        height={40} 
      />
      <div className="hidden md:block w-64 lg:w-72">
        <GlobalSearch />
      </div>
    </div>
  );
};

export default Left;
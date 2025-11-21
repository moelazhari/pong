import Image from "next/image";
import GlobalSearch from "./GlobalSearch";

const Left = () => {
  return (
    <div className="ml-[1rem] flex items-center">
      <Image className="w-[128px]" priority  src="/img/website_logo.svg" alt="logo" width={0} height={0} />
      <div className="hidden md:block w-72">
        <GlobalSearch />
      </div>
    </div>
  );
};

export default Left;
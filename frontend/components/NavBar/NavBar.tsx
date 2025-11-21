import Left from "./Left";
import Mid from "./Mid";
import Right from "./Right";

const NavBar = () => {
  return (
    <nav className="fixed flex justify-between items-center h-[56px] w-screen border-b border-blue z-30">
      <Left />
      <Mid />
      <Right />
    </nav>
  );
};

export default NavBar;

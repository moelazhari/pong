import Left from "./Left";
import Mid from "./Mid";
import Right from "./Right";

const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 flex justify-between items-center h-16 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg z-50">
      <Left />
      <Mid />
      <Right />
    </nav>
  );
};

export default NavBar;
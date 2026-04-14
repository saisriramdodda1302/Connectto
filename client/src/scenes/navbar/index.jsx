import { useState } from "react";
import {
  Search,
  MessageSquare,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const NavBar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.value.user);
  const mode = useSelector((state) => state.value.mode);

  const fullName = user ? `${user.firstname} ${user.lastname}` : "Guest";

  return (
    <nav className="flex justify-between items-center px-[6%] py-4 bg-white dark:bg-[#1A1A1A] border-b border-neutral-100 dark:border-neutral-800 shadow-sm transition-colors duration-300">
      <FlexBetween gap="1.75rem">
        <h1
          className="font-bold text-[clamp(1rem,2rem,2.25rem)] text-blue-500 hover:text-blue-400 cursor-pointer transition"
          onClick={() => navigate("/home")}
        >
          Connectto
        </h1>
        <div className="hidden lg:flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-md gap-4 px-6 py-2 transition-colors duration-300">
          <input
            placeholder="Search..."
            className="bg-transparent outline-none border-none py-1 text-neutral-800 dark:text-gray-100 w-full"
          />
          <button>
            <Search className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </FlexBetween>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-8">
        <button onClick={() => dispatch(setMode())}>
          {mode === "dark" ? (
            <Moon className="w-6 h-6 text-neutral-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-6 h-6 text-neutral-700 dark:text-gray-300" />
          )}
        </button>
        <MessageSquare onClick={() => navigate("/chat")} className="w-6 h-6 text-neutral-700 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition" />
        <Bell className="w-6 h-6 text-neutral-700 dark:text-gray-300 cursor-pointer" />
        <HelpCircle className="w-6 h-6 text-neutral-700 dark:text-gray-300 cursor-pointer" />
        
        <select
          className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-gray-200 rounded-md px-4 py-2 outline-none cursor-pointer transition-colors duration-300"
          onChange={(e) => {
            if (e.target.value === "logout") {
              dispatch(setLogout());
            }
          }}
          value={fullName}
        >
          <option value={fullName}>{fullName}</option>
          <option value="logout">Log Out</option>
        </select>
      </div>

      {/* Mobile Nav Toggle */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
          <Menu className="w-8 h-8 text-neutral-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Mobile Menu */}
      {!isMobileMenuToggled ? null : (
        <div className="fixed right-0 bottom-0 h-full z-50 max-w-[500px] min-w-[300px] bg-white dark:bg-[#1A1A1A] shadow-xl flex flex-col pt-4 transition-colors duration-300 border-l border-neutral-100 dark:border-neutral-800">
          <div className="flex justify-end pr-6 pb-8">
            <button onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
              <X className="w-8 h-8 text-neutral-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-12">
            <button onClick={() => dispatch(setMode())}>
              {mode === "dark" ? (
                <Moon className="w-8 h-8 text-neutral-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-8 h-8 text-neutral-700 dark:text-gray-300" />
              )}
            </button>
            <MessageSquare onClick={() => navigate("/chat")} className="w-8 h-8 text-neutral-700 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition" />
            <Bell className="w-8 h-8 text-neutral-700 dark:text-gray-300 cursor-pointer" />
            <HelpCircle className="w-8 h-8 text-neutral-700 dark:text-gray-300 cursor-pointer" />
            <select
              className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-gray-200 rounded-md px-4 py-2 outline-none cursor-pointer w-48 text-center text-lg transition-colors duration-300"
              onChange={(e) => {
                if (e.target.value === "logout") {
                  dispatch(setLogout());
                }
              }}
              value={fullName}
            >
              <option value={fullName}>{fullName}</option>
              <option value="logout">Log Out</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

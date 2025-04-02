import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "./sidebar";

const Navbar = ({ user, loading }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0].toUpperCase()).join("") : "U";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/sign-in");
  };

  return (
    <div className="sticky top-0 w-full bg-white border-b p-5 py-2 flex justify-between items-center z-50 text-sm">
      
      <div className="flex items-center">
        <SidebarTrigger />
        <div className="flex gap-2 items-center">
        <h1 className="text-sm font-heading font-bold text-primary ">Dashboard</h1>
        {user?.role && (
          <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
            {user.role === "USER" ? "Passenger" : user.role}
          </span>
        )}
        </div>
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-sm">{loading ? 'loading...': user?.name}</span>
            <div className="h-10 w-10 text-sm flex items-center justify-center rounded-full bg-primary text-white font-bold">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => navigate("/settings")}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default Navbar;
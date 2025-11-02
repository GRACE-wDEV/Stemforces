import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  User,
  LogOut,
  Home,
  Brain,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation links config
  const navLinks = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      hover: "hover:text-gray-600 hover:border-b hover:border-gray-600",
      show: true,
    },
    {
      to: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      hover: "hover:text-amber-600 hover:border-b hover:border-amber-600",
      show: true,
    },
    {
      to: "/profile",
      label: user ? user.name : "Profile",
      icon: User,
      hover: "hover:text-green-600 hover:border-b hover:border-green-600",
      show: !!user,
    },
    {
      to: "/admin",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      hover: "hover:text-purple-600 hover:border-b hover:border-purple-600",
      show: !!user && user.role === "admin",
    },
    {
      to: "/signup",
      label: "Sign Up",
      icon: UserPlus,
      hover: "hover:text-blue-600 hover:border-b hover:border-blue-600",
      show: !user,
    },
    {
      to: "/login",
      label: "Login",
      icon: LogIn,
      hover: "hover:text-red-600 hover:border-b hover:border-red-600",
      show: !user,
    },
    {
      to: "/logout",
      label: "Logout",
      icon: LogOut,
      hover: "hover:text-red-600 hover:border-b hover:border-red-600",
      onClick: handleLogout,
      show: !!user,
      asButton: true,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 border rounded-full flex items-center justify-center bg-gradient-to-tr">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-semibold font-caveat leading-1">Stemforces</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {navLinks
              .filter(link => link.show)
              .map(({ to, label, icon: Icon, hover, onClick, asButton }) =>
                asButton ? (
                  <button
                    key={to}
                    onClick={onClick}
                    className={`flex items-center font-freckle text-lg space-x-1 px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 ${hover} transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ) : (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center font-freckle text-lg space-x-1 px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 ${hover} transition-colors`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                )
              )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Trophy,
  User,
  LogOut,
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Swords,
  Calendar,
  Award,
  Flame,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch user streak
  const { data: streakData } = useQuery({
    queryKey: ['navbar-streak'],
    queryFn: async () => {
      const res = await api.get('/auth/me/stats');
      return res.data.data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: true
  });

  // Handle both camelCase and snake_case from backend
  const currentStreak = streakData?.currentStreak ?? streakData?.current_streak ?? 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  // Clean, minimal navigation structure
  const mainNavLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/browse", label: "Quiz", icon: BookOpen },
    { to: "/daily-challenge", label: "Daily", icon: Calendar },
    { to: "/battle", label: "Battle", icon: Swords },
    { to: "/achievements", label: "Achievements", icon: Award },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const authLinks = user ? [
    { to: "/profile", label: user.name || "Profile", icon: User },
    ...(user.role === "admin" ? [{ to: "/admin", label: "Admin", icon: LayoutDashboard }] : []),
  ] : [];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-primary)] shadow-sm' 
          : 'bg-[var(--bg-primary)] border-b border-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Stemforces
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* eslint-disable-next-line no-unused-vars */}
            {mainNavLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive(to)
                    ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* User Stats (if logged in) */}
            {user && (
              <div className="hidden lg:flex items-center gap-3 mr-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-tertiary)] rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{currentStreak}</span>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Auth Links - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  {/* eslint-disable-next-line no-unused-vars */}
                  {authLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive(to)
                          ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-primary)] bg-[var(--bg-primary)]">
          <div className="px-4 py-3 space-y-1">
            {/* Main Nav Links */}
            {/* eslint-disable-next-line no-unused-vars */}
            {mainNavLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(to)
                    ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-[var(--border-primary)] my-2" />

            {/* Auth Links */}
            {user ? (
              <>
                {/* eslint-disable-next-line no-unused-vars */}
                {authLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive(to)
                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

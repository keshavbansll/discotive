import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Target,
  Briefcase,
  Trophy,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
  { icon: Map, label: "Roadmap", path: "/app/roadmap" },
  { icon: Target, label: "Score", path: "/app/score" },
  { icon: Briefcase, label: "Opportunities", path: "/app/opportunities" },
  { icon: Trophy, label: "Leaderboard", path: "/app/leaderboard" },
];

const MainLayout = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Force true dark mode for the OS
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-white selection:text-black">
      {/* PC SIDEBAR - True Minimalist Black */}
      <aside className="hidden md:flex w-72 bg-[#0a0a0a] border-r border-white/10 flex-col z-20">
        <div className="p-8 pb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-extrabold text-xl shadow-lg">
            D
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tighter">
              DISCOTIVE
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-bold">
              Workspace
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/app" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm",
                  active
                    ? "bg-white text-black shadow-md"
                    : "text-slate-500 hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/app/settings"
            className={cn(
              "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm",
              location.pathname.startsWith("/app/settings")
                ? "bg-white text-black"
                : "text-slate-500 hover:text-white hover:bg-white/5",
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative w-full bg-[#0a0a0a]">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 md:h-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-10 z-30 sticky top-0">
          <div className="md:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">
              D
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter">
              DISCOTIVE
            </h1>
          </div>

          <div className="hidden md:flex items-center bg-[#121212] rounded-full px-6 py-3 w-[24rem] lg:w-[28rem] border border-white/10 focus-within:border-white/40 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search milestones, skills..."
              className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder-slate-500 text-white"
            />
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"></span>
            </button>

            <div className="flex items-center space-x-3 md:space-x-4 md:border-l border-white/10 pl-2 md:pl-8 cursor-pointer group">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-white">John Doe</p>
                <p className="text-xs text-slate-500 font-medium">
                  Founder Track
                </p>
              </div>
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center text-black text-sm md:text-base font-extrabold group-hover:scale-105 transition-transform">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 z-50 px-2 pb-6 pt-3 flex items-center justify-around">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/app" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-12 relative group"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                  active ? "text-white" : "text-slate-500",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 mb-1.5 transition-all duration-300",
                    active && "stroke-[2.5px] scale-110",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] transition-all duration-300",
                    active ? "font-bold opacity-100" : "font-medium opacity-70",
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;

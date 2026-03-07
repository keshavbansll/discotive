import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Briefcase,
  Trophy,
  Settings,
  Bell,
  Search,
  LineChart,
  Users,
  FolderOpen,
} from "lucide-react";
import { cn } from "../components/ui/BentoCard";

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/app" },
  { icon: Target, label: "Execution Timeline", path: "/app/roadmap" },
  { icon: Trophy, label: "Discotive Score", path: "/app/score" },
  { icon: LineChart, label: "Financial Ledger", path: "/app/finance" },
  { icon: Users, label: "Network & Hubs", path: "/app/network" },
  { icon: Briefcase, label: "Opportunities", path: "/app/opportunities" },
  { icon: FolderOpen, label: "Asset Vault", path: "/app/vault" },
];

const MainLayout = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.body.style.backgroundColor = "#0a0a0a";
    document.body.style.color = "#ffffff";
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-white selection:text-black font-sans">
      <aside className="hidden md:flex w-72 bg-[#0a0a0a] border-r border-white/5 flex-col z-20">
        <div className="p-8 pb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-extrabold text-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            D
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tighter">
              DISCOTIVE
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-bold">
              Operating System
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/app" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group relative overflow-hidden",
                  active
                    ? "text-white bg-white/5"
                    : "text-slate-500 hover:text-white hover:bg-white/5",
                )}
              >
                {/* Active Indicator Line */}
                {active && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full shadow-[0_0_10px_white]" />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    active ? "scale-110" : "group-hover:scale-110",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link
            to="/app/settings"
            className={cn(
              "flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group",
              location.pathname.startsWith("/app/settings")
                ? "text-white bg-white/5"
                : "text-slate-500 hover:text-white hover:bg-white/5",
            )}
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative w-full bg-[#0a0a0a]">
        <header className="h-16 md:h-24 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-10 z-30 sticky top-0">
          <div className="md:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">
              D
            </div>
          </div>

          <div className="hidden md:flex items-center bg-[#121212] rounded-full px-6 py-3.5 w-[24rem] lg:w-[32rem] border border-white/10 focus-within:border-white/40 focus-within:bg-white/5 transition-all group">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Command + K to search your entire ledger..."
              className="bg-transparent border-none outline-none ml-3 w-full text-sm placeholder-slate-600 text-white font-medium"
            />
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white] border-2 border-[#0a0a0a]"></span>
            </button>

            <div className="flex items-center space-x-4 md:border-l border-white/10 pl-2 md:pl-8 cursor-pointer group">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-white group-hover:text-slate-300 transition-colors">
                  John Doe
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Founder Track
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-white text-sm md:text-base font-extrabold group-hover:border-white/40 group-hover:bg-white group-hover:text-black transition-all duration-300">
                JD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 custom-scrollbar relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

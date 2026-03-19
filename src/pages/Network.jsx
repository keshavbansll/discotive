import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../hooks/useUserData";
import {
  Search,
  Filter,
  ChevronDown,
  X,
  MapPin,
  Check,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  Target,
  Users,
  Swords,
  GraduationCap,
  Globe,
} from "lucide-react";
import { cn } from "../components/ui/BentoCard";

// ============================================================================
// 1. CONFIGURATIONS & TAXONOMY
// ============================================================================
const DOMAINS = {
  "Engineering & Tech": [
    "Software Engineering",
    "AI/ML Engineer",
    "Web Development",
    "Protocol Dev",
    "DevOps",
  ],
  "Business & Strategy": [
    "Founder",
    "Product Management",
    "Growth & Marketing",
    "Operations",
  ],
  "Design & Art": [
    "UI/UX Design",
    "Product Design",
    "3D Art",
    "Graphic Design",
  ],
  "Filmmaking & Media": [
    "Director",
    "Cinematic Colorist",
    "Editor",
    "Content Creator",
  ],
};

const SCOPES = ["Global Arena", "Academic Institutions"];
const TABS = ["The Watchlist", "Global Arena", "My Alliance", "Alumni"];

// ============================================================================
// 2. SUB-COMPONENT: FILTER DROPDOWN
// ============================================================================
const MultiSelectDropdown = ({
  title,
  options,
  selected,
  onChange,
  isOpen,
  onToggle,
  placeholder = "Search...",
}) => {
  const [query, setQuery] = useState("");
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleOption = (opt) => {
    if (selected.includes(opt))
      onChange(selected.filter((item) => item !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="relative w-full sm:w-64">
      <p className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-2 px-1">
        {title}
      </p>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 bg-[#0a0a0a] border px-4 py-3 rounded-xl font-bold text-sm text-white transition-colors",
          isOpen ? "border-[#555]" : "border-[#222] hover:border-[#444]",
        )}
      >
        <span className="truncate">
          {selected.length > 0 ? `${selected.length} Selected` : "All"}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#666] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#333] rounded-xl shadow-2xl overflow-hidden z-40"
          >
            <div className="p-2 border-b border-[#222]">
              <div className="flex items-center bg-[#111] rounded-lg px-3 py-2">
                <Search className="w-3 h-3 text-[#666] mr-2" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-[#444]"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {filteredOptions.length === 0 ? (
                <p className="text-xs text-[#555] p-2 text-center">
                  No options found.
                </p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-[#111] text-[#888] hover:text-white transition-colors text-left"
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {selected.includes(opt) && (
                      <Check className="w-3 h-3 text-white shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 3. SUB-COMPONENT: OPERATOR CARD (4 Tiers)
// ============================================================================
const OperatorCard = ({ user, currentUser, isWatchlist }) => {
  const isMe = user.id === currentUser?.id;
  const isCompetitor = !isMe && user._domain === currentUser?._domain; // Auto-Hostility logic

  // Dynamic Tier Styling based on Level
  let tierClasses = "bg-[#111] border-[#222]"; // Lvl 1-3 Default
  let badgeLabel = null;

  if (user._level >= 10) {
    tierClasses =
      "bg-black border-[#444] shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] overflow-hidden relative z-10 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] before:bg-[length:250%_250%,100%_100%] hover:before:animate-[shimmer_2s_infinite]";
    badgeLabel = (
      <span className="px-2 py-1 rounded bg-white text-black text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
        <Activity className="w-3 h-3" /> Monopoly
      </span>
    );
  } else if (user._level >= 7) {
    tierClasses =
      "bg-[#0a0a0a] border-amber-500/30 hover:border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.05)]";
    badgeLabel = (
      <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Outlier
      </span>
    );
  } else if (user._level >= 4) {
    tierClasses =
      "bg-white/5 border-white/10 hover:border-white/30 backdrop-blur-md";
  }

  // Head-to-Head Math for Watchlist
  const myScore = currentUser?._score || 0;
  const theirScore = user._score;
  const iAmWinning = myScore >= theirScore;

  return (
    <div
      className={cn(
        "rounded-[2rem] border p-6 flex flex-col relative transition-all duration-500 group overflow-hidden h-[340px]",
        tierClasses,
      )}
    >
      {/* Top Row: Level & Tags */}
      <div className="flex justify-between items-start mb-6 relative z-20">
        <div className="font-extrabold text-2xl tracking-tighter text-white/90">
          <span className="text-xs text-[#666] uppercase tracking-widest block mb-[-4px]">
            LVL
          </span>
          {user._level}
        </div>
        <div className="flex flex-col items-end gap-2">
          {badgeLabel}
          {isMe && (
            <span className="px-2 py-1 rounded bg-[#222] text-[#888] text-[8px] font-bold uppercase tracking-widest">
              You
            </span>
          )}
          {isCompetitor && (
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Swords className="w-3 h-3" /> Competitor
            </span>
          )}
        </div>
      </div>

      {/* Center: Identity */}
      <div className="flex items-center gap-4 mb-4 relative z-20">
        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-sm font-extrabold text-[#888] shrink-0">
          {user._initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold text-white text-lg tracking-tight truncate">
            {user._firstName} {user._lastName}
          </h3>
          <p className="text-xs font-mono text-[#666] truncate">
            @{user._username}
          </p>
        </div>
      </div>

      {/* Bottom: Domain & Niche */}
      <div className="mt-auto relative z-20">
        <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest truncate">
          {user._domain}
        </p>
        <p className="text-sm font-bold text-[#ccc] truncate">{user._niche}</p>
      </div>

      {/* --- THE HOVER REVEAL OVERLAY --- */}
      <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl p-6 flex flex-col translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-30">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
            Active Trajectory
          </p>
          <p className="text-sm font-bold text-white leading-relaxed line-clamp-3 mb-4">
            {user._goal || "Establishing baseline metrics."}
          </p>

          <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
            Core Arsenal
          </p>
          <div className="flex flex-wrap gap-2">
            {user._skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-[#222] text-[#ccc] text-[9px] font-bold uppercase tracking-wider rounded border border-[#333]"
              >
                {skill}
              </span>
            ))}
            {user._skills.length === 0 && (
              <span className="text-xs text-[#555] font-mono">[ UNKNOWN ]</span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-[#222]">
          <Link
            to={`/user/${user._username}`}
            className="flex-1 text-center py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-[#ccc] transition-colors"
          >
            View Profile
          </Link>
          {!isMe && (
            <button
              className="p-2 bg-[#111] border border-[#333] rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition-colors"
              title="Add to Alliance"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* --- WATCHLIST HEAD-TO-HEAD UI --- */}
      {isWatchlist && !isMe && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 flex z-40 bg-[#222]">
          <div
            className={cn(
              "h-full transition-all",
              iAmWinning ? "bg-red-500" : "bg-green-500",
            )}
            style={{ width: `${(theirScore / (myScore + theirScore)) * 100}%` }}
          />
          <div
            className={cn(
              "h-full transition-all",
              iAmWinning ? "bg-green-500" : "bg-red-500",
            )}
            style={{ width: `${(myScore / (myScore + theirScore)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. MAIN NETWORK COMPONENT
// ============================================================================
const Network = () => {
  const { userData, loading: userLoading } = useUserData();

  // -- Real Data State --
  const [dbUsers, setDbUsers] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // -- Engine State --
  const [activeTab, setActiveTab] = useState("The Watchlist");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);

  // -- Master Filter State --
  const [filters, setFilters] = useState({
    scope: "Global Arena",
    institutions: [],
    domain: "All Domains",
    niches: [],
  });

  const isFiltered = useMemo(() => {
    return (
      filters.scope !== "Global Arena" ||
      filters.institutions.length > 0 ||
      filters.domain !== "All Domains" ||
      filters.niches.length > 0 ||
      searchQuery !== ""
    );
  }, [filters, searchQuery]);

  // -- Fetch Real Data from Firestore --
  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const rawUsers = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          rawUsers.push({
            id: doc.id,
            ...data,
            _firstName: data.identity?.firstName || "Unknown",
            _lastName: data.identity?.lastName || "",
            _email: data.identity?.email || "",
            _username:
              data.identity?.username ||
              data.identity?.email?.split("@")[0] ||
              "user",
            _initials:
              `${data.identity?.firstName?.charAt(0) || ""}${data.identity?.lastName?.charAt(0) || ""}`.toUpperCase(),
            _domain: data.vision?.passion || "Uncategorized",
            _niche: data.vision?.niche || "Unspecified",
            _location: data.location?.displayLocation || null,
            _institution: data.baseline?.institution || null,
            _score: data.discotiveScore || 0,
            _level: Math.min(
              Math.floor((data.discotiveScore || 0) / 1000) + 1,
              10,
            ), // Max Level 10
            _goal: data.vision?.goal3Months || "",
            _skills:
              data.skills?.alignedSkills?.length > 0
                ? data.skills.alignedSkills
                : data.skills?.rawSkills || [],
          });
        });

        // Sort by score descending globally
        setDbUsers(rawUsers.sort((a, b) => b._score - a._score));
      } catch (error) {
        console.error("Network Sync Failed:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchNetwork();
  }, []);

  const currentUserObj = dbUsers.find(
    (u) => u._email === userData?.identity?.email,
  );

  // -- The Deterministic Filter & Tab Engine --
  const filteredNetwork = useMemo(() => {
    return dbUsers.filter((u) => {
      // 1. Tab Logic
      if (activeTab === "The Watchlist") {
        // Show Competitors (Same domain, different user). Since no mock data, might be empty.
        if (
          u.id === currentUserObj?.id ||
          u._domain !== currentUserObj?._domain
        )
          return false;
      } else if (activeTab === "My Alliance") {
        // Placeholder for future Alliance logic. Empty for now.
        return false;
      } else if (activeTab === "Alumni") {
        // Placeholder for Alumni.
        return false;
      } // "Global Arena" shows everyone

      // 2. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${u._firstName} ${u._lastName}`
          .toLowerCase()
          .includes(q);
        const matchesUsername = u._username.toLowerCase().includes(q);
        const matchesNiche = u._niche.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesNiche) return false;
      }

      // 3. Dropdown Filters
      if (
        filters.scope === "Academic Institutions" &&
        filters.institutions.length > 0
      ) {
        if (!u._institution || !filters.institutions.includes(u._institution))
          return false;
      }
      if (filters.domain !== "All Domains") {
        if (u._domain !== filters.domain) return false;
        if (filters.niches.length > 0 && !filters.niches.includes(u._niche))
          return false;
      }
      return true;
    });
  }, [dbUsers, filters, activeTab, searchQuery, currentUserObj]);

  const totalPages = Math.ceil(filteredNetwork.length / limit) || 1;
  const paginatedNetwork = filteredNetwork.slice(
    (page - 1) * limit,
    page * limit,
  );

  const handleDropdownToggle = (id) =>
    setActiveDropdown((prev) => (prev === id ? null : id));
  const clearProtocols = () => {
    setFilters({
      scope: "Global Arena",
      institutions: [],
      domain: "All Domains",
      niches: [],
    });
    setSearchQuery("");
    setPage(1);
    setActiveDropdown(null);
  };

  if (isFetching || userLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Activity className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#030303] min-h-screen text-white selection:bg-white selection:text-black pb-20 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 pt-12 space-y-12">
        {/* --- HEADER --- */}
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-2 leading-none">
            Networking Hub.
          </h1>
          <p className="text-lg md:text-xl text-[#888] font-medium tracking-tight">
            Connect, collaborate, and benchmark your progress.
          </p>
        </div>

        {/* --- TAB & SEARCH ENGINE --- */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-[#222] pb-6">
          {/* Tabs */}
          <div className="flex gap-6 text-sm font-bold overflow-x-auto w-full xl:w-auto custom-scrollbar pb-2 xl:pb-0">
            {TABS.map((tab) => {
              let Icon = Globe;
              if (tab === "The Watchlist") Icon = Swords;
              if (tab === "My Alliance") Icon = Users;
              if (tab === "Alumni") Icon = GraduationCap;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={cn(
                    "pb-6 -mb-[25px] whitespace-nowrap transition-colors flex items-center gap-2",
                    activeTab === tab
                      ? "text-white border-b-2 border-white"
                      : "text-[#666] hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" /> {tab}
                </button>
              );
            })}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center bg-[#0a0a0a] rounded-xl px-4 py-3 border border-[#222] focus-within:border-[#555] transition-colors w-full sm:w-72 group">
              <Search className="w-4 h-4 text-[#444] group-focus-within:text-white shrink-0" />
              <input
                type="text"
                placeholder="Query by name, @username, niche..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent border-none outline-none text-xs px-3 text-white placeholder-[#444] font-medium"
              />
            </div>
          </div>
        </div>

        {/* --- CASCADING FILTER ROW --- */}
        <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-[2rem] shadow-2xl relative z-30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 border-b border-[#222] pb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] flex items-center gap-2">
                <Filter className="w-4 h-4" /> Global Filters
              </h3>
              <div className="px-3 py-1 bg-[#111] rounded border border-[#333] text-[10px] font-mono text-[#888]">
                {filteredNetwork.length} Operators Found
              </div>
            </div>
            {isFiltered && (
              <button
                onClick={clearProtocols}
                className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
              <div className="relative w-full sm:w-56">
                <p className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-2 px-1">
                  Scope
                </p>
                <button
                  onClick={() => handleDropdownToggle("scope")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#050505] border border-[#222] rounded-xl text-sm font-bold text-white"
                >
                  {filters.scope}{" "}
                  <ChevronDown className="w-4 h-4 text-[#666]" />
                </button>
                <AnimatePresence>
                  {activeDropdown === "scope" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0a0a0a] border border-[#333] rounded-xl z-40 overflow-hidden shadow-2xl"
                    >
                      {SCOPES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setFilters((f) => ({
                              ...f,
                              scope: s,
                              institutions: [],
                            }));
                            setActiveDropdown(null);
                            setPage(1);
                          }}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-[#888] hover:text-white hover:bg-[#111]"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative w-full sm:w-56">
                <p className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-2 px-1">
                  Macro Domain
                </p>
                <button
                  onClick={() => handleDropdownToggle("domain")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#050505] border border-[#222] rounded-xl text-sm font-bold text-white"
                >
                  <span className="truncate">{filters.domain}</span>{" "}
                  <ChevronDown className="w-4 h-4 text-[#666]" />
                </button>
                <AnimatePresence>
                  {activeDropdown === "domain" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0a0a0a] border border-[#333] rounded-xl z-40 overflow-hidden shadow-2xl"
                    >
                      {["All Domains", ...Object.keys(DOMAINS)].map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setFilters((f) => ({
                              ...f,
                              domain: d,
                              niches: [],
                            }));
                            setActiveDropdown(null);
                            setPage(1);
                          }}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-[#888] hover:text-white hover:bg-[#111] truncate"
                        >
                          {d}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {(filters.scope === "Academic Institutions" ||
                filters.domain !== "All Domains") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#111] overflow-hidden"
                >
                  {filters.scope === "Academic Institutions" && (
                    <MultiSelectDropdown
                      title="Select Institutions"
                      options={[
                        "JECRC Foundation",
                        "IIT Bombay",
                        "Stanford",
                        "MIT",
                      ]}
                      selected={filters.institutions}
                      onChange={(arr) => {
                        setFilters((f) => ({ ...f, institutions: arr }));
                        setPage(1);
                      }}
                      isOpen={activeDropdown === "institutions"}
                      onToggle={() => handleDropdownToggle("institutions")}
                      placeholder="Search university..."
                    />
                  )}
                  {filters.domain !== "All Domains" && (
                    <MultiSelectDropdown
                      title="Micro Niche"
                      options={DOMAINS[filters.domain] || []}
                      selected={filters.niches}
                      onChange={(arr) => {
                        setFilters((f) => ({ ...f, niches: arr }));
                        setPage(1);
                      }}
                      isOpen={activeDropdown === "niches"}
                      onToggle={() => handleDropdownToggle("niches")}
                      placeholder="Search niche..."
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- LIMIT CONTROLS --- */}
        <div className="flex justify-between items-end mb-4 px-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">
              Show per page
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#111] border border-[#333] text-white text-xs font-bold px-2 py-1 rounded outline-none cursor-pointer"
            >
              {[10, 15, 30].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- THE GRID / EMPTY STATE --- */}
        {paginatedNetwork.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-[#222] rounded-[2rem] bg-[#050505]">
            <Target className="w-12 h-12 text-[#333] mb-4" />
            <h3 className="text-xl font-extrabold text-white mb-2">
              No Operators Found.
            </h3>
            <p className="text-[#666] text-sm max-w-sm">
              {activeTab === "The Watchlist"
                ? "No rivals detected in your immediate trajectory. Explore the Global Arena to find peers."
                : "No profiles match your current filter parameters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedNetwork.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <OperatorCard
                  user={user}
                  currentUser={currentUserObj}
                  isWatchlist={activeTab === "The Watchlist"}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#222] pt-8">
            <span className="text-[10px] font-mono text-[#666] tracking-widest">
              PAGE {page} OF {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-[#111] border border-[#333] rounded-lg text-white hover:bg-[#222] disabled:opacity-50 transition-colors text-xs font-bold flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-[#111] border border-[#333] rounded-lg text-white hover:bg-[#222] disabled:opacity-50 transition-colors text-xs font-bold flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;

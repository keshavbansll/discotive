import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../hooks/useUserData";
import {
  MapPin,
  Link2,
  Github,
  Twitter,
  Linkedin,
  Target,
  Activity,
  ShieldCheck,
  Swords,
  Users,
  GraduationCap,
  FolderLock,
  Briefcase,
  PieChart,
} from "lucide-react";
import { cn } from "../components/ui/BentoCard";

// --- SUB-COMPONENT: EMPTY STATE DONUT CHART ---
const EmptyDistributionChart = () => (
  <div className="relative w-48 h-48 mx-auto">
    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#111"
        strokeWidth="12"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#222"
        strokeWidth="12"
        strokeDasharray="5 5"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="#111"
        strokeWidth="1"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <PieChart className="w-5 h-5 text-[#444] mb-1" />
      <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest text-center">
        No Data
      </span>
    </div>
  </div>
);

// --- SUB-COMPONENT: SLEEK ACTIVITY PULSE ---
const EmptyActivityPulse = () => {
  return (
    <div className="flex items-end justify-between h-32 w-full gap-1.5 opacity-40">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-[#222] rounded-t-sm transition-all hover:bg-white"
          style={{ height: `${Math.max(10, Math.random() * 50)}%` }}
        />
      ))}
    </div>
  );
};

const PublicProfile = () => {
  const { username } = useParams();
  const { userData, loading: currentUserLoading } = useUserData();

  const [profileData, setProfileData] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- REAL-TIME DATABASE FETCH ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("identity.username", "==", username),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          const score = data.discotiveScore || 0;

          setProfileData({ id: doc.id, ...data });

          const rankQuery = query(
            collection(db, "users"),
            where("discotiveScore", ">", score),
          );
          const rankSnapshot = await getCountFromServer(rankQuery);
          setRank(rankSnapshot.data().count + 1);
        } else {
          setProfileData(null);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  if (loading || currentUserLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Activity className="w-6 h-6 text-[#666] animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-center px-6">
        <Target className="w-16 h-16 text-[#222] mb-6" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Profile Not Found
        </h1>
        <p className="text-[#666] text-sm mb-8">
          The user @{username} does not exist on Discotive.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-[#ccc] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // --- DATA EXTRACTION ---
  const isMe = userData?.identity?.username === username;
  const isGuest = !userData;

  const score = profileData.discotiveScore || 0;
  const level = Math.min(Math.floor(score / 1000) + 1, 10);

  const firstName = profileData.identity?.firstName || "Unknown";
  const lastName = profileData.identity?.lastName || "";
  const initials =
    `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();

  const domain = profileData.vision?.passion || "Uncategorized";
  const niche = profileData.vision?.niche || "Unspecified";

  const location =
    profileData.location?.displayLocation ||
    profileData.footprint?.location ||
    null;
  const institution = profileData.baseline?.institution || null;
  const degree = profileData.baseline?.degree || null;
  const major = profileData.baseline?.major || null;
  const gradYear = profileData.baseline?.gradYear || null;

  const goal3Months =
    profileData.vision?.goal3Months ||
    "Establishing baseline execution parameters.";
  const endgame = profileData.vision?.endgame || "Scaling monopoly.";
  const skills =
    profileData.skills?.alignedSkills?.length > 0
      ? profileData.skills.alignedSkills
      : profileData.skills?.rawSkills || [];
  const links = profileData.footprint?.socials || {};

  // --- PREMIUM TIER STYLING (Level 1-10) ---
  let tierBorder = "border-[#222]";
  let tierAvatar = "bg-[#111] border-[#333] text-[#888]";
  let topBarClass = "bg-[#111] text-[#888]";
  let clearanceText = "STANDARD CLEARANCE • VERIFIED";

  if (level >= 10) {
    tierBorder = "border-[#555] shadow-[0_0_60px_rgba(255,255,255,0.05)]";
    tierAvatar =
      "bg-black border-white/50 text-white shadow-[0_0_30px_rgba(255,255,255,0.15)]";
    topBarClass = "bg-white text-black";
    clearanceText = "APEX CLEARANCE • MONOPOLY";
  } else if (level >= 7) {
    tierBorder = "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.05)]";
    tierAvatar = "bg-[#0a0a0a] border-amber-500/50 text-amber-500";
    topBarClass = "bg-amber-500 text-black";
    clearanceText = "OUTLIER CLEARANCE • VERIFIED";
  } else if (level >= 4) {
    tierBorder = "border-white/20";
    tierAvatar = "bg-[#0a0a0a] border-white/30 text-white";
    topBarClass = "bg-[#222] text-white";
    clearanceText = "OPERATOR CLEARANCE • VERIFIED";
  }

  return (
    <div className="bg-[#030303] min-h-screen text-white selection:bg-white selection:text-black pb-32 font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10 pt-16">
        {/* =========================================================
            THE MASTER SHEET (Unified Container)
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "bg-[#0a0a0a] rounded-[2rem] border overflow-hidden flex flex-col",
            tierBorder,
          )}
        >
          {/* --- TOP STATUS BAR --- */}
          <div className="flex justify-between items-center px-8 py-3 border-b border-[#222] bg-[#050505]">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={cn(
                  "w-4 h-4",
                  level >= 10
                    ? "text-white"
                    : level >= 7
                      ? "text-amber-500"
                      : "text-green-500",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase tracking-widest",
                  level >= 10
                    ? "text-white"
                    : level >= 7
                      ? "text-amber-500"
                      : "text-green-500",
                )}
              >
                {clearanceText}
              </span>
            </div>

            {/* Networking Actions for Guests/Other Users */}
            {!isMe && (
              <div className="flex items-center gap-3">
                {isGuest ? (
                  <Link
                    to="/login"
                    className="text-[10px] font-bold text-black bg-white px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-[#ccc] transition-colors"
                  >
                    Join to Connect
                  </Link>
                ) : (
                  <>
                    <button className="text-[10px] font-bold text-[#888] bg-[#111] border border-[#333] px-3 py-1.5 rounded-full uppercase tracking-widest hover:text-white hover:bg-[#222] transition-colors flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Ally
                    </button>
                    <button className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                      <Swords className="w-3 h-3" /> Target
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* --- HERO SECTION --- */}
          <div className="flex flex-col md:flex-row items-center md:items-start p-8 md:p-12 border-b border-[#222] gap-8 md:gap-12 bg-[#050505]">
            {/* Circular Avatar & Level Pill */}
            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-4xl md:text-5xl font-extrabold shrink-0 border-[3px] shadow-2xl transition-transform hover:scale-105",
                  tierAvatar,
                )}
              >
                {initials}
              </div>
              <div
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-lg",
                  topBarClass,
                )}
              >
                Level {level} Operator
              </div>
            </div>

            {/* Core Details */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                {firstName} {lastName}
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-3 text-[#888] font-medium text-sm mb-6 justify-center md:justify-start">
                <span>@{username}</span>

                {/* Social Links inline */}
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  {Object.entries(links).map(([platform, url]) => {
                    if (!url) return null;
                    let Icon = Link2;
                    if (platform === "github") Icon = Github;
                    if (platform === "twitter") Icon = Twitter;
                    if (platform === "linkedin") Icon = Linkedin;
                    return (
                      <a
                        key={platform}
                        href={url.startsWith("http") ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm font-medium text-[#ccc]">
                {location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#666]" /> {location}
                  </span>
                )}
                {institution && (
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#666]" />
                    {institution}{" "}
                    {degree && major ? `— ${degree} in ${major}` : ""}{" "}
                    {gradYear ? `(Class of ${gradYear})` : ""}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#666]" />
                  {domain} <span className="text-[#444] px-1">|</span> {niche}
                </span>
              </div>
            </div>

            {/* Metrics Flex Box */}
            <div className="flex gap-10 md:gap-12 w-full md:w-auto justify-center md:justify-end items-center md:items-start pt-4">
              <div className="text-center md:text-right">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2">
                  Global Rank
                </p>
                <p className="font-extrabold text-white text-4xl tracking-tighter">
                  #{rank || "--"}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2">
                  Score
                </p>
                <p className="font-extrabold text-white text-4xl tracking-tighter">
                  {score.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* --- INTERNAL GRID STRUCTURE --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* LEFT COLUMN (Vision & Moat) */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[#222] flex flex-col">
              {/* Execution Focus */}
              <div className="p-8 border-b border-[#222] flex-1">
                <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Execution Focus
                </h2>

                <div className="mb-8">
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">
                    Current Target
                  </p>
                  <p className="text-base font-bold text-white leading-relaxed">
                    {goal3Months}
                  </p>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">
                    Macro Vision
                  </p>
                  <p className="text-sm font-medium text-[#888] leading-relaxed">
                    {endgame}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-3">
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-[#111] text-[#ccc] text-xs font-medium rounded-lg border border-[#222]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#555] italic">
                        No skills configured.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Moat Distribution Donut */}
              <div className="p-8 flex flex-col items-center justify-center flex-1 bg-[#050505]/50">
                <h2 className="text-xs w-full font-bold text-[#666] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <PieChart className="w-4 h-4" /> Moat Distribution
                </h2>
                <div className="py-4">
                  <EmptyDistributionChart />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Activity & Vault) */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Activity Pulse */}
              <div className="p-8 border-b border-[#222] flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Activity Pulse
                  </h2>
                  <span className="text-xs font-medium text-[#555]">
                    Last 30 Days
                  </span>
                </div>

                <div className="w-full pt-4">
                  <EmptyActivityPulse />
                </div>
                <div className="flex justify-between mt-4 border-t border-[#222] pt-4">
                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                    0 Entries Logged
                  </span>
                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                    Awaiting Data
                  </span>
                </div>
              </div>

              {/* Public Assets (Vault) */}
              <div className="p-8 flex flex-col justify-center flex-1 bg-[#050505]/50 min-h-[300px]">
                <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <FolderLock className="w-4 h-4" /> Public Assets (Vault)
                </h2>

                <div className="flex flex-col items-center justify-center text-center opacity-60 py-8">
                  <FolderLock className="w-10 h-10 text-[#444] mb-4" />
                  <p className="text-sm font-bold text-[#888] mb-1">
                    No verified assets available.
                  </p>
                  <p className="text-xs text-[#555]">
                    User has not synced public proof of work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicProfile;

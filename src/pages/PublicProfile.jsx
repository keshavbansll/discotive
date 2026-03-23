import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  doc,
  updateDoc,
  increment,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useUserData } from "../hooks/useUserData";
import { mutateScore } from "../lib/scoreEngine";
import { pdf } from "@react-pdf/renderer";
import { DCIExportTemplate } from "../components/DCIExportTemplate";
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
  Download,
  Share2,
  ChevronDown,
  X,
  FileImage,
  FileText,
  FileJson,
  CheckCircle2,
  Clock,
  UserPlus,
  Sparkles,
  Eye,
  Zap,
  Terminal,
  Check,
  Crown,
} from "lucide-react";
import { cn } from "../components/ui/BentoCard";

// ============================================================================
// 1. INTERACTIVE DATA VISUALIZATION ENGINES
// ============================================================================

const ChartTooltip = ({ tooltip }) => {
  if (!tooltip.show) return null;
  return (
    <div
      className="fixed z-[999] pointer-events-none px-3 py-2 bg-[#111] border border-[#333] rounded-lg shadow-xl transition-opacity duration-150"
      style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
    >
      <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">
        {tooltip.label}
      </p>
      <p className="text-sm font-extrabold text-[#eaeaea]">{tooltip.value}</p>
    </div>
  );
};

const ExecutionRadarChart = ({ profileData, assetsCount, setTooltip }) => {
  const score = profileData?.discotiveScore?.current || 0;
  const alliesCount = profileData?.allies?.length || 0;
  const skillsCount = profileData?.skills?.alignedSkills?.length || 0;
  const views = profileData?.profileViews || 0;

  const rawValues = [score, skillsCount, alliesCount, assetsCount, views];
  const dataPoints = [
    Math.min((score / 5000) * 100, 100),
    Math.min((skillsCount / 10) * 100, 100),
    Math.min((alliesCount / 20) * 100, 100),
    Math.min((assetsCount / 5) * 100, 100),
    Math.min((views / 100) * 100, 100),
  ];

  const labels = [
    "Execution",
    "Capabilities",
    "Network",
    "Proof of Work",
    "Reach",
  ];
  const points = dataPoints.map((val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return {
      x: 50 + (val / 100) * 40 * Math.cos(angle),
      y: 50 + (val / 100) * 40 * Math.sin(angle),
      val: rawValues[i],
      label: labels[i],
    };
  });

  const polygonString = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative w-full aspect-square max-w-[220px] mx-auto group cursor-crosshair">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full transition-transform duration-500 hover:scale-105"
      >
        {[20, 40].map((r) => (
          <polygon
            key={r}
            points={[0, 1, 2, 3, 4]
              .map((i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
              })
              .join(" ")}
            fill="none"
            stroke="#222"
            strokeWidth="0.5"
          />
        ))}
        <polygon
          points={polygonString}
          fill="rgba(255,255,255,0.05)"
          stroke="#fff"
          strokeWidth="1.5"
          className="transition-all duration-300 group-hover:fill-white/10"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#fff"
            className="cursor-pointer hover:fill-[#D4AF37] transition-colors"
            onMouseEnter={(e) =>
              setTooltip({
                show: true,
                x: e.clientX,
                y: e.clientY,
                label: p.label,
                value: p.val,
              })
            }
            onMouseMove={(e) =>
              setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
            }
            onMouseLeave={() =>
              setTooltip({ show: false, x: 0, y: 0, label: "", value: "" })
            }
          />
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none text-[8px] font-bold text-[#666] uppercase tracking-widest">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2">
          {labels[0]}
        </span>
        <span className="absolute top-[35%] right-0 translate-x-3">
          {labels[1]}
        </span>
        <span className="absolute bottom-[10%] right-[10%] translate-x-2">
          {labels[2]}
        </span>
        <span className="absolute bottom-[10%] left-[10%] -translate-x-2">
          {labels[3]}
        </span>
        <span className="absolute top-[35%] left-0 -translate-x-3">
          {labels[4]}
        </span>
      </div>
    </div>
  );
};

const MoatDistributionChart = ({ profileData, setTooltip }) => {
  const skills = profileData?.skills?.alignedSkills || [];
  const tech = skills.length > 0 ? 40 + skills.length * 5 : 0;
  const strat = skills.length > 0 ? 30 + skills.length * 2 : 0;
  const exec = skills.length > 0 ? 100 - tech - strat : 0;

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 opacity-50">
        <PieChart className="w-8 h-8 text-[#444] mb-2" />
        <span className="text-[10px] font-mono text-[#666]">NO DATA</span>
      </div>
    );
  }

  const handleHover = (e, label, value) => {
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      label,
      value: `${value}% Focus`,
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 mb-6 group">
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full transform -rotate-90 rounded-full hover:scale-105 transition-transform duration-500 cursor-crosshair"
        >
          <circle r="16" cx="16" cy="16" fill="#111" />
          <circle
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth="32"
            strokeDasharray={`${tech} 100`}
            onMouseEnter={(e) => handleHover(e, "Core Capabilities", tech)}
            onMouseMove={(e) =>
              setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
            }
            onMouseLeave={() =>
              setTooltip((prev) => ({ ...prev, show: false }))
            }
            className="hover:opacity-80 transition-opacity"
          />
          <circle
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke="#F59E0B"
            strokeWidth="32"
            strokeDasharray={`${strat} 100`}
            strokeDashoffset={`-${tech}`}
            onMouseEnter={(e) => handleHover(e, "Strategy & Planning", strat)}
            onMouseMove={(e) =>
              setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
            }
            onMouseLeave={() =>
              setTooltip((prev) => ({ ...prev, show: false }))
            }
            className="hover:opacity-80 transition-opacity"
          />
          <circle
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke="#10B981"
            strokeWidth="32"
            strokeDasharray={`${exec} 100`}
            strokeDashoffset={`-${tech + strat}`}
            onMouseEnter={(e) => handleHover(e, "Execution Velocity", exec)}
            onMouseMove={(e) =>
              setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }))
            }
            onMouseLeave={() =>
              setTooltip((prev) => ({ ...prev, show: false }))
            }
            className="hover:opacity-80 transition-opacity"
          />
          <circle r="12" cx="16" cy="16" fill="#0c0c0c" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-[#eaeaea]">
            {skills.length}
          </span>
        </div>
      </div>
      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-sm"></div> Core
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#F59E0B] rounded-sm"></div> Strategy
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#10B981] rounded-sm"></div> Exec
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPARE TERMINAL (AI WHATSAPP STYLE)
// ============================================================================
const CompareTerminal = ({ isOpen, onClose, targetUser, currentUser }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex justify-center items-end sm:items-center p-0 sm:p-6 pl-0 md:pl-64">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl h-[85vh] sm:h-[75vh] bg-[#0a0a0a] border border-[#222] sm:rounded-[2rem] rounded-t-[2rem] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-5 border-b border-[#222] bg-[#0f0f0f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#111] border border-[#D4AF37] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white">
                Discotive AI
              </h2>
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">
                Analyzing Matchup...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#1a1a1a] rounded-full text-[#888] hover:text-white transition-colors border border-[#333]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#050505] flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="self-end max-w-[80%] bg-[#1a1a1a] border border-[#333] text-white px-5 py-3 rounded-2xl rounded-tr-sm"
          >
            <p className="text-sm font-medium leading-relaxed">
              Run tactical comparison between me and{" "}
              <span className="font-bold text-[#D4AF37]">
                @{targetUser?.identity?.username}
              </span>
            </p>
            <div className="text-[9px] text-[#888] text-right mt-1 font-mono">
              Just now
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="self-start max-w-[80%] bg-[#0f0f0f] border border-[#222] px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
          >
            <div
              className="w-2 h-2 bg-[#555] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-[#555] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-[#555] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </motion.div>
        </div>
        <div className="p-4 bg-[#0f0f0f] border-t border-[#222] shrink-0">
          <div className="w-full bg-[#050505] border border-[#222] rounded-xl px-5 py-3 text-sm text-[#555] font-medium flex justify-between items-center">
            <span>Awaiting execution engine...</span>
            <Activity className="w-4 h-4 text-[#555] animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 4. MAIN PUBLIC PROFILE COMPONENT & ENGINE
// ============================================================================
const PublicProfile = () => {
  const { handle } = useParams();
  const username = handle?.startsWith("@")
    ? handle.slice(1).toLowerCase()
    : handle?.toLowerCase();

  const { userData, loading: currentUserLoading } = useUserData();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interactive UI States
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    label: "",
    value: "",
  });

  // Refs
  const exportMenuRef = useRef(null);

  const showToast = (message, type = "default") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- REAL-TIME DATABASE FETCH & VIRAL VIEW ENGINE ---
  useEffect(() => {
    const fetchAndTrackProfile = async () => {
      setLoading(true);

      if (!username) {
        setProfileData(null);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "users"),
          where("identity.username", "==", username),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setProfileData(null);
          setLoading(false);
          return;
        }

        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        const tId = docSnap.id;
        const score = data.discotiveScore?.current || 0;

        setProfileData({ id: tId, ...data });
        setTargetId(tId);

        const rankQuery = query(
          collection(db, "users"),
          where("discotiveScore.current", ">", score),
        );
        const rankSnapshot = await getCountFromServer(rankQuery);
        setRank(rankSnapshot.data().count + 1);

        const viewKey = `discotive_viewed_${tId}`;
        const hasViewed = localStorage.getItem(viewKey);
        const isOwner = auth.currentUser?.uid === tId;

        if (!hasViewed && !isOwner) {
          await updateDoc(doc(db, "users", tId), {
            profileViews: increment(1),
          });
          mutateScore(tId, 1, "Public Profile View");
          localStorage.setItem(viewKey, "true");
          setProfileData((prev) => ({
            ...prev,
            profileViews: (prev.profileViews || 0) + 1,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrackProfile();
  }, [username]);

  // --- DATA EXTRACTION ---
  const isMe = userData?.identity?.username === username;
  const isGuest = !userData;

  const score = profileData?.discotiveScore?.current || 0;
  const level = Math.min(Math.floor(score / 1000) + 1, 10);
  const views = profileData?.profileViews || 0;
  const streak = profileData?.telemetry?.loginStreak || 0;

  const firstName = profileData?.identity?.firstName || "Unknown";
  const lastName = profileData?.identity?.lastName || "";
  const initials =
    `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();

  const domain = profileData?.vision?.passion || "Uncategorized";
  const niche = profileData?.vision?.niche || "Unspecified";
  const location =
    profileData?.location?.displayLocation ||
    profileData?.footprint?.location ||
    null;

  const institution = profileData?.baseline?.institution || null;
  const degree = profileData?.baseline?.degree || null;
  const major = profileData?.baseline?.major || null;

  const skills =
    profileData?.skills?.alignedSkills?.length > 0
      ? profileData.skills.alignedSkills
      : [];
  const links = profileData?.footprint?.socials || {};

  const alliesCount = profileData?.allies?.length || 0;
  const assetsCount = profileData?.verifiedAssetsCount || 0;

  // --- NETWORKING HANDLERS ---
  const handleConnectAction = async (type) => {
    if (isGuest) return navigate("/");
    try {
      const myRef = doc(db, "users", userData.id);
      const targetRef = doc(db, "users", targetId);

      if (type === "ally") {
        await writeBatch(db)
          .update(myRef, { outboundRequests: arrayUnion(targetId) })
          .update(targetRef, { inboundRequests: arrayUnion(userData.id) })
          .commit();
        showToast("Alliance Request Sent", "green");
      } else if (type === "target") {
        await updateDoc(myRef, { watchlist: arrayUnion(targetId) });
        showToast("Operator added to Watchlist", "green");
      } else if (type === "compare") {
        setIsCompareOpen(true);
      }
    } catch (err) {
      showToast("Network action failed", "error");
    }
  };

  // --- THE DCI COMPILER ENGINE (ATS-Native PDF) ---
  const handleExport = async (format) => {
    setExportMenuOpen(false);
    showToast(`Compiling DCI ${format.toUpperCase()}...`, "default");

    try {
      if (format === "pdf") {
        // Compile the pure vector/text PDF asynchronously
        const blob = await pdf(
          <DCIExportTemplate
            data={{
              firstName,
              lastName,
              username,
              email: profileData?.identity?.email || "No Public Email",
              domain,
              niche,
              rank,
              score,
              goal: profileData?.vision?.goal3Months,
              endgame: profileData?.vision?.endgame,
              institution,
              degree,
              major,
              gradYear: profileData?.baseline?.gradYear,
              streak,
            }}
            initials={initials}
            level={level}
            skills={skills}
            assetsCount={assetsCount}
            alliesCount={alliesCount}
          />,
        ).toBlob();

        // Create a secure download link for the binary
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${firstName}_${lastName}_DCI.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        // Raw Data Export
        const csvContent =
          "data:text/csv;charset=utf-8," +
          "Key,Value\n" +
          `Name,${firstName} ${lastName}\n` +
          `Email,${profileData?.identity?.email || "N/A"}\n` +
          `Domain,${domain}\n` +
          `Niche,${niche}\n` +
          `Discotive Score,${score}\n` +
          `Global Rank,${rank}\n` +
          `Skills,"${skills.join(", ")}"\n`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${username}_raw_data.csv`);
        document.body.appendChild(link);
        link.click();
      }
      showToast("DCI Exported Successfully", "green");
    } catch (err) {
      console.error(err);
      showToast("DCI Compilation Failed", "error");
    }
  };

  // --- SHARP ACADEMY AWARD RANK & TIER STYLING (No Blurs) ---
  let tierBorder = "border-[#333]";
  let tierAvatar = "bg-[#0c0c0c] border-[#333] text-[#888]";
  let topBarClass = "bg-[#111] text-[#888]";
  let clearanceText = "STANDARD CLEARANCE • VERIFIED";
  let CrownIcon = null;

  // Sharp Golden, Silver, Bronze Tiers
  if (rank === 1) {
    tierBorder = "border-[#D4AF37]"; // Oscar Gold
    tierAvatar = "bg-[#0c0c0c] border-[#D4AF37] text-[#D4AF37]";
    topBarClass = "bg-[#D4AF37] text-black";
    clearanceText = "APEX ALPHA • GLOBAL #1";
    CrownIcon = (
      <Crown className="w-5 h-5 text-[#D4AF37] absolute -top-5 -right-3 rotate-12 z-30" />
    );
  } else if (rank === 2) {
    tierBorder = "border-[#C0C0C0]"; // Sharp Silver
    tierAvatar = "bg-[#0c0c0c] border-[#C0C0C0] text-[#C0C0C0]";
    topBarClass = "bg-[#C0C0C0] text-black";
    clearanceText = "APEX BETA • GLOBAL #2";
    CrownIcon = (
      <Crown className="w-5 h-5 text-[#C0C0C0] absolute -top-5 -right-3 rotate-12 z-30" />
    );
  } else if (rank === 3) {
    tierBorder = "border-[#CD7F32]"; // Sharp Bronze
    tierAvatar = "bg-[#0c0c0c] border-[#CD7F32] text-[#CD7F32]";
    topBarClass = "bg-[#CD7F32] text-black";
    clearanceText = "APEX GAMMA • GLOBAL #3";
    CrownIcon = (
      <Crown className="w-5 h-5 text-[#CD7F32] absolute -top-5 -right-3 rotate-12 z-30" />
    );
  }
  // Standard Operator Levels
  else if (level >= 10) {
    tierBorder = "border-[#e5e5e5]";
    tierAvatar = "bg-[#0c0c0c] border-[#e5e5e5] text-white";
    topBarClass = "bg-white text-black";
    clearanceText = "APEX CLEARANCE • MONOPOLY";
  } else if (level >= 7) {
    tierBorder = "border-[#D4AF37]";
    tierAvatar = "bg-[#0c0c0c] border-[#D4AF37] text-[#D4AF37]";
    topBarClass = "bg-[#D4AF37] text-black";
    clearanceText = "OUTLIER CLEARANCE • VERIFIED";
  } else if (level >= 4) {
    tierBorder = "border-[#666]";
    tierAvatar = "bg-[#0c0c0c] border-[#666] text-white";
    topBarClass = "bg-[#222] text-white";
    clearanceText = "OPERATOR CLEARANCE • VERIFIED";
  }

  // --- HELPER FOR SHARP STATS BOX BORDER & TEXT ---
  let statsBorder = "border-[#222]";
  let rankColor = "text-white";
  if (rank === 1) {
    statsBorder = "border-[#D4AF37]"; // Sharp Gold
    rankColor = "text-[#D4AF37]";
  } else if (rank === 2) {
    statsBorder = "border-[#C0C0C0]"; // Sharp Silver
    rankColor = "text-[#C0C0C0]";
  } else if (rank === 3) {
    statsBorder = "border-[#CD7F32]"; // Sharp Bronze
    rankColor = "text-[#CD7F32]";
  }

  // --- LOADING / 404 STATES ---
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
          Operator Not Found
        </h1>
        <p className="text-[#666] text-sm mb-8">
          The coordinate @{username} does not exist on the Discotive chain.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-[#ccc] transition-colors"
        >
          Return to Hub
        </Link>
      </div>
    );
  }

  // ============================================================================
  // THE UI ARCHITECTURE
  // ============================================================================
  return (
    <div className="bg-[#030303] h-screen overflow-y-auto overflow-x-hidden custom-scrollbar text-white selection:bg-white selection:text-black pb-32 font-sans relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      {/* GLOBAL HOVER TOOLTIP */}
      <ChartTooltip tooltip={tooltip} />

      {/* EXPANDED PROFILE CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10 pt-16">
        {/* MUTED OUTER WRAPPER (No colorful borders here!) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#080808] rounded-[2rem] border border-[#222] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* --- TOP COMMAND BAR --- */}
          <div className="flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#222] bg-[#050505]">
            <div className="flex items-center gap-4">
              {/* DISCOTIVE LOGO (Routes Home) */}
              <Link
                to="/"
                className="flex items-center justify-center w-8 h-8 bg-white text-black font-extrabold rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                D
              </Link>
              <div className="w-px h-6 bg-[#333] hidden md:block"></div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={cn(
                    "w-4 h-4",
                    level >= 10
                      ? "text-white"
                      : level >= 7
                        ? "text-[#D4AF37]"
                        : "text-green-500",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-widest hidden md:inline-block",
                    level >= 10
                      ? "text-white"
                      : level >= 7
                        ? "text-[#D4AF37]"
                        : "text-green-500",
                  )}
                >
                  {clearanceText}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* EXPORT DROPDOWN */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="text-[10px] font-bold text-white bg-[#111] border border-[#333] px-4 py-2 rounded-md uppercase tracking-widest hover:bg-[#222] transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Export{" "}
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
                <AnimatePresence>
                  {exportMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 flex flex-col gap-1">
                        <button
                          onClick={() => handleExport("png")}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1a1a1a] rounded-lg text-left transition-colors"
                        >
                          <FileImage className="w-4 h-4 text-[#888]" /> Save as
                          PNG{" "}
                          <span className="text-[9px] text-[#666] ml-auto uppercase tracking-widest">
                            A4 Print
                          </span>
                        </button>
                        <button
                          onClick={() => handleExport("pdf")}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1a1a1a] rounded-lg text-left transition-colors"
                        >
                          <FileText className="w-4 h-4 text-[#888]" /> Download
                          PDF{" "}
                          <span className="text-[9px] text-[#666] ml-auto uppercase tracking-widest">
                            A4 Print
                          </span>
                        </button>
                        <div className="h-px w-full bg-[#222] my-1"></div>
                        <button
                          onClick={() => handleExport("csv")}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1a1a1a] rounded-lg text-left transition-colors"
                        >
                          <FileJson className="w-4 h-4 text-[#888]" /> Export
                          Raw CSV
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NETWORKING ACTIONS */}
              {!isMe && (
                <>
                  <button
                    onClick={() => handleConnectAction("ally")}
                    className="text-[10px] font-bold text-[#888] bg-[#111] border border-[#333] px-4 py-2 rounded-md uppercase tracking-widest hover:text-white hover:bg-[#222] transition-colors flex items-center gap-2 hidden sm:flex"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Ally
                  </button>
                  <button
                    onClick={() => handleConnectAction("target")}
                    className="text-[10px] font-bold text-red-500 bg-[#111] border border-red-500/20 px-4 py-2 rounded-md uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors flex items-center gap-2 hidden sm:flex"
                  >
                    <Target className="w-3.5 h-3.5" /> Target
                  </button>
                  <button
                    onClick={() => handleConnectAction("compare")}
                    className="text-[10px] font-bold text-[#D4AF37] bg-[#111] border border-[#D4AF37]/30 px-4 py-2 rounded-md uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> VS AI
                  </button>
                </>
              )}
            </div>
          </div>

          {/* --- HERO SECTION --- */}
          <div className="flex flex-col xl:flex-row items-center xl:items-start p-8 md:p-12 border-b border-[#222] gap-10 bg-[#050505] relative overflow-hidden">
            {/* Avatar block with Crown & Sharp Academy Border */}
            <div className="flex flex-col items-center gap-4 relative z-10 shrink-0">
              <div className="relative">
                {CrownIcon}
                <div
                  className={cn(
                    "w-36 h-36 md:w-40 md:h-40 rounded-2xl flex items-center justify-center text-5xl md:text-6xl font-extrabold border-[3px] rotate-2 transition-transform hover:rotate-0 duration-300",
                    tierAvatar,
                  )}
                >
                  {initials}
                </div>
              </div>
              <div
                className={cn(
                  "px-5 py-2 rounded-md text-xs font-extrabold uppercase tracking-widest -mt-6 z-20 border",
                  tierBorder,
                  topBarClass,
                )}
              >
                Level {level}
              </div>
            </div>

            {/* Identity Block */}
            <div className="flex-1 text-center xl:text-left flex flex-col justify-center h-full relative z-10 w-full">
              <div className="flex flex-col xl:flex-row justify-between xl:items-start w-full gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-[#888] font-mono text-base mb-4">
                    @{username}
                  </p>
                </div>

                {/* Core Stats Row (Sharp Border and Colored Text) */}
                <div
                  className={cn(
                    "flex gap-6 md:gap-8 justify-center xl:justify-end bg-[#0a0a0a] border rounded-xl p-5 shrink-0 transition-colors",
                    statsBorder,
                  )}
                >
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1.5">
                      Global Rank
                    </p>
                    <p className={cn("font-extrabold text-3xl", rankColor)}>
                      #{rank || "--"}
                    </p>
                  </div>
                  <div className="w-px bg-[#222]"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1.5">
                      Discotive Score
                    </p>
                    <p className={cn("font-extrabold text-3xl", rankColor)}>
                      {score.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px bg-[#222]"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1.5">
                      Views
                    </p>
                    <p className="font-extrabold text-[#eaeaea] text-3xl flex items-center gap-1.5 justify-center">
                      <Eye className="w-5 h-5 text-[#888]" /> {views}
                    </p>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Location */}
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-6 gap-y-4 text-sm font-medium text-[#ccc] mt-8">
                <span className="flex items-center gap-2 bg-[#111] px-4 py-2 rounded-md border border-[#222]">
                  <Briefcase className="w-4 h-4 text-[#888]" /> {domain}{" "}
                  <span className="text-[#444] px-1">|</span> {niche}
                </span>
                {location && (
                  <span className="flex items-center gap-2 text-[#888]">
                    <MapPin className="w-4 h-4 text-[#555]" /> {location}
                  </span>
                )}
                {/* Social Links */}
                <div className="flex items-center gap-3 xl:ml-auto bg-[#111] px-4 py-2 rounded-md border border-[#222]">
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
                        className="text-[#888] hover:text-white transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* --- INTERNAL ECOSYSTEM GRID (Wider Format) --- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 bg-[#050505] flex-1">
            {/* LEFT: Radar & Network Engine (Col-Span 4) */}
            <div className="col-span-1 xl:col-span-4 border-b xl:border-b-0 xl:border-r border-[#222] p-8 flex flex-col gap-10 bg-[#030303]">
              <div>
                <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Execution Telemetry
                </h2>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex items-center justify-center">
                  <ExecutionRadarChart
                    profileData={profileData}
                    assetsCount={assetsCount}
                    setTooltip={setTooltip}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-5 text-center hover:border-[#444] transition-colors cursor-default">
                  <FolderLock className="w-6 h-6 text-[#888] mx-auto mb-3" />
                  <p className="text-3xl font-extrabold text-white">
                    {assetsCount}
                  </p>
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mt-2">
                    Verified Assets
                  </p>
                </div>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-5 text-center hover:border-[#444] transition-colors cursor-default">
                  <Users className="w-6 h-6 text-[#888] mx-auto mb-3" />
                  <p className="text-3xl font-extrabold text-white">
                    {alliesCount}
                  </p>
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mt-2">
                    Network Allies
                  </p>
                </div>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 text-center col-span-2 flex justify-between items-center hover:border-[#444] transition-colors cursor-default">
                  <div className="text-left">
                    <p className="text-2xl font-extrabold text-white flex items-center gap-2">
                      {streak}{" "}
                      <Zap className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                    </p>
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest mt-1">
                      Consistency Streak
                    </p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-[#222]" />
                </div>
              </div>
            </div>

            {/* RIGHT: Vision, Skills, Milestones & Vault (Col-Span 8) */}
            <div className="col-span-1 xl:col-span-8 p-8 xl:p-12 flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vision Engine */}
                <div className="flex flex-col gap-5">
                  <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-4 h-4 text-white" /> Operator
                    Trajectory
                  </h2>
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex-1 hover:border-[#444] transition-colors">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">
                      Current Execution Target
                    </p>
                    <p className="text-base font-bold text-white leading-relaxed mb-8">
                      {profileData?.vision?.goal3Months ||
                        "Establishing baseline execution parameters."}
                    </p>
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2">
                      Macro Endgame
                    </p>
                    <p className="text-sm font-medium text-[#888] leading-relaxed">
                      {profileData?.vision?.endgame ||
                        "Scaling monopoly and compounding leverage."}
                    </p>
                  </div>
                </div>

                {/* Moat Distribution (Pie Chart) */}
                <div className="flex flex-col gap-5">
                  <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-white" /> Moat
                    Distribution
                  </h2>
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex-1 flex items-center justify-center hover:border-[#444] transition-colors">
                    <MoatDistributionChart
                      profileData={profileData}
                      setTooltip={setTooltip}
                    />
                  </div>
                </div>
              </div>

              {/* Capabilities & Academics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-white" /> Capabilities
                  </h2>
                  <div className="flex flex-wrap gap-2.5 bg-[#0a0a0a] p-6 rounded-xl border border-[#222] min-h-[120px] content-start">
                    {skills.length > 0 ? (
                      skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-[#111] text-[#ccc] text-xs font-bold rounded-md border border-[#333] hover:border-[#666] transition-colors cursor-default"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#555] font-mono">
                        [ NULL_INVENTORY ]
                      </span>
                    )}
                  </div>
                </div>

                {institution && (
                  <div>
                    <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-white" /> Academic
                      Baseline
                    </h2>
                    <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col justify-center min-h-[120px]">
                      <p className="text-lg font-extrabold text-white">
                        {institution}
                      </p>
                      <p className="text-sm text-[#888] font-medium mt-1">
                        {degree} in {major}
                      </p>
                      {profileData?.baseline?.gradYear && (
                        <p className="text-xs font-bold text-[#D4AF37] mt-3 tracking-widest uppercase">
                          Class of {profileData.baseline.gradYear}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Milestones Row */}
              <div>
                <h2 className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Milestones
                  Completed
                </h2>
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Discotive Protocol
                        </p>
                        <p className="text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                          Account Creation
                        </p>
                      </div>
                    </div>
                    {level >= 2 && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Momentum Built
                          </p>
                          <p className="text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                            Level 2 Reached
                          </p>
                        </div>
                      </div>
                    )}
                    {level >= 5 && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Advanced Clearance
                          </p>
                          <p className="text-[10px] font-mono text-[#666] uppercase tracking-widest mt-1">
                            Top 50% Ranked
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MODALS & TOASTS --- */}
      <AnimatePresence>
        {exportMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 flex flex-col gap-1">
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1a1a1a] rounded-lg text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" /> Download DCI{" "}
                <span className="text-[9px] text-[#666] ml-auto uppercase tracking-widest">
                  .PDF
                </span>
              </button>
              <div className="h-px w-full bg-[#222] my-1"></div>
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1a1a1a] rounded-lg text-left transition-colors"
              >
                <FileJson className="w-4 h-4 text-[#888]" /> Export Raw Data{" "}
                <span className="text-[9px] text-[#666] ml-auto uppercase tracking-widest">
                  .CSV
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicProfile;

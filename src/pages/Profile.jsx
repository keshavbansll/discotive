import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../hooks/useUserData";
import {
  ShieldCheck,
  MapPin,
  Terminal,
  Briefcase,
  Zap,
  Crosshair,
  GitCommit,
  Copy,
  ExternalLink,
  Award,
  Activity,
  Edit3,
  X,
  Check,
  Loader2,
  GraduationCap,
  Link2,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { cn } from "../components/ui/BentoCard";

const Profile = () => {
  const { userData, loading, refreshUserData } = useUserData();

  // --- UI & MODAL STATES ---
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Populate form data when modal opens
  useEffect(() => {
    if (!editModal || !userData) return;

    if (editModal === "hero") {
      setFormData({
        firstName: userData.identity?.firstName || "",
        lastName: userData.identity?.lastName || "",
        passion: userData.vision?.passion || "",
        niche: userData.vision?.niche || "",
        location:
          userData.location?.displayLocation ||
          userData.footprint?.location ||
          "",
      });
    } else if (editModal === "baseline") {
      setFormData({
        institution: userData.baseline?.institution || "",
        course: userData.baseline?.degree || "",
        year: userData.baseline?.gradYear || "",
        goal3Months: userData.vision?.goal3Months || "",
      });
    } else if (editModal === "skills") {
      const currentSkills =
        userData.skills?.alignedSkills?.length > 0
          ? userData.skills.alignedSkills
          : userData.skills?.rawSkills || [];
      setFormData({ skills: currentSkills.join(", ") });
    } else if (editModal === "footprint") {
      setFormData({
        github: userData.footprint?.socials?.github || "",
        twitter: userData.footprint?.socials?.twitter || "",
        linkedin: userData.footprint?.socials?.linkedin || "",
      });
    }
  }, [editModal, userData]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyId = () => {
    if (userData?.id) {
      navigator.clipboard.writeText(userData.id);
      showToast("[ ID COPIED TO CLIPBOARD ]");
    }
  };

  // --- FIREBASE SAVE LOGIC ---
  const handleSave = async () => {
    if (!userData?.id) return;
    setIsSaving(true);

    try {
      const userRef = doc(db, "users", userData.id);
      let updates = {};

      if (editModal === "hero") {
        updates = {
          "identity.firstName": formData.firstName,
          "identity.lastName": formData.lastName,
          "vision.passion": formData.passion,
          "vision.niche": formData.niche,
          "location.displayLocation": formData.location,
        };
      } else if (editModal === "baseline") {
        updates = {
          "baseline.institution": formData.institution,
          "baseline.degree": formData.course,
          "baseline.gradYear": formData.year,
          "vision.goal3Months": formData.goal3Months,
        };
      } else if (editModal === "skills") {
        const skillArray = formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        updates = { "skills.alignedSkills": skillArray };
      } else if (editModal === "footprint") {
        updates = {
          "footprint.socials.github": formData.github,
          "footprint.socials.twitter": formData.twitter,
          "footprint.socials.linkedin": formData.linkedin,
        };
      }

      await updateDoc(userRef, updates);
      if (refreshUserData) await refreshUserData();
      showToast("Profile Updated Successfully");
      setEditModal(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error updating databank.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Activity className="w-6 h-6 text-[#666] animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  // --- REAL DATA EXTRACTION ---
  const firstName = userData.identity?.firstName || "Unknown";
  const lastName = userData.identity?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const username = userData.identity?.username || "user";
  const initials =
    `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();

  const primaryRole = userData.vision?.passion
    ? `${userData.vision.passion} | ${userData.vision.niche || ""}`
    : "Role Undefined";
  const location =
    userData.location?.displayLocation ||
    userData.footprint?.location ||
    "Location Undefined";

  const institution = userData.baseline?.institution || "No Institution Logged";
  const course = userData.baseline?.degree || "Program Undefined";
  const year = userData.baseline?.gradYear
    ? `Class of ${userData.baseline.gradYear}`
    : "Year Undefined";

  const activeDeployment =
    userData.vision?.goal3Months || "Awaiting Deployment Orders";
  const score = userData.discotiveScore || 0;
  const level = Math.min(Math.floor(score / 1000) + 1, 10);

  const skills =
    userData.skills?.alignedSkills?.length > 0
      ? userData.skills.alignedSkills
      : userData.skills?.rawSkills || [];

  const links = userData.footprint?.socials || {};

  return (
    <div className="bg-[#030303] min-h-screen text-white selection:bg-white selection:text-black pb-32 relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 pt-12 space-y-12">
        {/* --- TOP ACTIONS --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#222] bg-[#0a0a0a]">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-500 tracking-wide">
              Level {level} Clearance • Verified
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleCopyId}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] border border-[#222] text-white font-bold text-sm rounded-full hover:bg-[#111] hover:border-[#333] transition-colors group"
            >
              <Copy className="w-4 h-4 text-[#666] group-hover:text-white transition-colors" />{" "}
              Copy ID
            </button>
            <Link
              to={`/${username}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-extrabold text-sm rounded-full hover:bg-[#ccc] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <ExternalLink className="w-4 h-4" /> Public Profile
            </Link>
          </div>
        </div>

        {/* --- HERO: THE IDENTITY CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-[#222] rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-10 items-center md:items-start group/card hover:border-[#444] transition-colors relative"
        >
          {/* Edit Hero Button */}
          <button
            onClick={() => setEditModal("hero")}
            className="absolute top-6 right-6 p-3 bg-[#111] border border-[#333] rounded-full text-[#666] hover:text-white hover:bg-[#222] transition-all opacity-0 group-hover/card:opacity-100 focus:opacity-100 z-20"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Avatar Base */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-[#050505] border-4 border-[#111] flex items-center justify-center shadow-2xl z-10 relative group-hover/card:border-[#333] transition-all duration-500">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white">
                {initials}
              </span>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-extrabold px-6 py-2 rounded-full border-4 border-[#0a0a0a] whitespace-nowrap z-20 shadow-lg">
              Operator
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left z-10 w-full mt-4 md:mt-0 flex flex-col justify-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-4 leading-none">
              {fullName}
            </h1>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-bold text-[#888] mb-10">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#555]" /> {primaryRole}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#555]" /> {location}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-5 hover:border-[#444] transition-colors">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Momentum
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tighter">
                  {score}
                </p>
              </div>
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-5 hover:border-[#444] transition-colors">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-blue-500" /> Global Rank
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tighter">
                  TBD
                </p>
              </div>
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-5 hover:border-[#444] transition-colors hidden md:block">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-green-500" /> Vault
                  Nodes
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tighter">
                  0
                </p>
              </div>
              <div className="bg-[#050505] border border-[#222] rounded-2xl p-5 hover:border-[#444] transition-colors hidden md:block">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-purple-500" /> Network
                </p>
                <p className="text-3xl font-extrabold text-white tracking-tighter">
                  0
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- BOTTOM GRID: VISION & BASELINE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Baseline & Domains (Left Column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 md:p-10 hover:border-[#333] transition-colors h-full flex flex-col relative group/section">
              <button
                onClick={() => setEditModal("baseline")}
                className="absolute top-8 right-8 p-2.5 bg-[#111] border border-[#333] rounded-full text-[#666] hover:text-white hover:bg-[#222] transition-all opacity-0 group-hover/section:opacity-100 focus:opacity-100 z-20"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <h3 className="text-xs font-bold text-[#888] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-white" /> Execution Baseline
              </h3>

              <div className="space-y-6 flex-1">
                <div className="p-6 bg-[#050505] rounded-2xl border border-[#222] hover:border-[#444] transition-colors">
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2">
                    Current Institution
                  </p>
                  <p className="font-extrabold text-white text-xl tracking-tight mb-1">
                    {institution}
                  </p>
                  <p className="text-sm font-bold text-[#888]">
                    {course} • {year}
                  </p>
                </div>

                <div className="p-6 bg-[#050505] rounded-2xl border border-[#222] hover:border-[#444] transition-colors">
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2">
                    Active Deployment Focus
                  </p>
                  <p className="font-bold text-white text-lg tracking-tight mb-1">
                    {activeDeployment}
                  </p>
                </div>

                <div className="pt-4 relative group/skills">
                  <button
                    onClick={() => setEditModal("skills")}
                    className="absolute -top-2 right-0 p-2 bg-[#111] border border-[#333] rounded-full text-[#666] hover:text-white hover:bg-[#222] transition-all opacity-0 group-hover/skills:opacity-100 focus:opacity-100"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4">
                    Core Competencies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 bg-[#111] border border-[#333] rounded-xl text-sm font-bold text-[#ccc]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-[#555] italic">
                        No skills logged in databank.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The Ledger & Vision (Right Column) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 md:p-10 hover:border-[#333] transition-colors flex flex-col relative group/section">
              <h3 className="text-xs font-bold text-[#888] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-white" /> Immutable Ledger
              </h3>

              <div className="space-y-0 flex-1">
                <div className="flex flex-col items-center justify-center text-center py-12 opacity-60">
                  <GitCommit className="w-12 h-12 text-[#444] mb-4" />
                  <p className="text-lg font-bold text-white mb-2">
                    Ledger Clean
                  </p>
                  <p className="text-sm font-bold text-[#888] max-w-xs">
                    Deploy milestones on the Execution Map to log real-time
                    trajectory updates here.
                  </p>
                  <Link
                    to="/app/roadmap"
                    className="mt-6 px-6 py-2.5 bg-[#111] border border-[#333] rounded-full text-sm font-bold text-white hover:bg-white hover:text-black transition-colors"
                  >
                    Open Execution Map
                  </Link>
                </div>
              </div>
            </div>

            {/* Digital Footprint (Moved here for better grid balance) */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 md:p-10 hover:border-[#333] transition-colors relative group/section">
              <button
                onClick={() => setEditModal("footprint")}
                className="absolute top-8 right-8 p-2.5 bg-[#111] border border-[#333] rounded-full text-[#666] hover:text-white hover:bg-[#222] transition-all opacity-0 group-hover/section:opacity-100 focus:opacity-100 z-20"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <h3 className="text-xs font-bold text-[#888] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-white" /> Digital Footprint
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#050505] p-4 rounded-2xl border border-[#111]">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[#888]">
                    <Github className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-0.5">
                      GitHub
                    </p>
                    {links.github ? (
                      <a
                        href={
                          links.github.startsWith("http")
                            ? links.github
                            : `https://${links.github}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-white hover:underline truncate block"
                      >
                        {links.github
                          .replace("https://", "")
                          .replace("github.com/", "")}
                      </a>
                    ) : (
                      <p className="text-xs text-[#444] font-bold">
                        [ UNLINKED ]
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#050505] p-4 rounded-2xl border border-[#111]">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[#888]">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-0.5">
                      X (Twitter)
                    </p>
                    {links.twitter ? (
                      <a
                        href={
                          links.twitter.startsWith("http")
                            ? links.twitter
                            : `https://${links.twitter}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-white hover:underline truncate block"
                      >
                        {links.twitter
                          .replace("https://", "")
                          .replace("twitter.com/", "")
                          .replace("x.com/", "")}
                      </a>
                    ) : (
                      <p className="text-xs text-[#444] font-bold">
                        [ UNLINKED ]
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#050505] p-4 rounded-2xl border border-[#111]">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[#888]">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-0.5">
                      LinkedIn
                    </p>
                    {links.linkedin ? (
                      <a
                        href={
                          links.linkedin.startsWith("http")
                            ? links.linkedin
                            : `https://${links.linkedin}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-white hover:underline truncate block"
                      >
                        {links.linkedin
                          .replace("https://", "")
                          .replace("linkedin.com/in/", "")}
                      </a>
                    ) : (
                      <p className="text-xs text-[#444] font-bold">
                        [ UNLINKED ]
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- EDIT MODALS --- */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#222] rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-[#222]">
                <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-[#888]" />
                  Update Parameters
                </h2>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 bg-[#111] rounded-full text-[#666] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
                {editModal === "hero" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        Macro Role (e.g. Founder)
                      </label>
                      <input
                        type="text"
                        value={formData.passion}
                        onChange={(e) =>
                          setFormData({ ...formData, passion: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        Micro Niche (e.g. AI SaaS)
                      </label>
                      <input
                        type="text"
                        value={formData.niche}
                        onChange={(e) =>
                          setFormData({ ...formData, niche: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                  </>
                )}

                {editModal === "baseline" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        Institution / Company
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution: e.target.value,
                          })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                          Degree / Program
                        </label>
                        <input
                          type="text"
                          value={formData.course}
                          onChange={(e) =>
                            setFormData({ ...formData, course: e.target.value })
                          }
                          placeholder="e.g. B.Tech CSE"
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                          Grad Year
                        </label>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={(e) =>
                            setFormData({ ...formData, year: e.target.value })
                          }
                          placeholder="e.g. 2029"
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        Active Deployment (90-Day Goal)
                      </label>
                      <textarea
                        rows="2"
                        value={formData.goal3Months}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            goal3Months: e.target.value,
                          })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors resize-none"
                      />
                    </div>
                  </>
                )}

                {editModal === "skills" && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                      Core Arsenal (Comma Separated)
                    </label>
                    <textarea
                      rows="4"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      placeholder="React, Firebase, UI/UX..."
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors resize-none"
                    />
                  </div>
                )}

                {editModal === "footprint" && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="text"
                        value={formData.github}
                        onChange={(e) =>
                          setFormData({ ...formData, github: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        X (Twitter) URL
                      </label>
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) =>
                          setFormData({ ...formData, twitter: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) =>
                          setFormData({ ...formData, linkedin: e.target.value })
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#555] transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 md:p-8 border-t border-[#222] flex gap-4 bg-[#050505]">
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 px-6 py-3.5 bg-[#111] border border-[#333] text-white font-bold text-sm rounded-xl hover:bg-[#222] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3.5 bg-white text-black font-extrabold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Deploy Updates"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 bg-[#111] border border-[#333] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold tracking-wide">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

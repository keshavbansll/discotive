import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderLock,
  UploadCloud,
  ShieldCheck,
  Github,
  FileText,
  Plus,
  Activity,
  Search,
  Filter,
  Terminal,
  ShieldAlert,
  Cpu,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Check,
  X,
  Upload,
  FileImage,
  FileIcon,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useUserData } from "../hooks/useUserData";
import { cn } from "../components/ui/BentoCard";

// --- 1. BACKGROUND ENGINE ---
const BackgroundScanner = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      initial={{ top: "-10%" }}
      animate={{ top: "110%" }}
      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      className="absolute left-0 right-0 h-[1px] bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    />
  </div>
);

// --- 2. UTILITY FUNCTIONS ---
const getFileIcon = (fileName) => {
  if (!fileName) return <FileText className="w-5 h-5" />;
  const ext = fileName.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext))
    return <FileImage className="w-5 h-5 text-purple-400" />;
  if (ext === "pdf") return <FileIcon className="w-5 h-5 text-red-500" />;
  if (["doc", "docx"].includes(ext))
    return <FileText className="w-5 h-5 text-blue-500" />;
  return <FileText className="w-5 h-5 text-slate-400" />;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- 3. MAIN COMPONENT ---
const Vault = () => {
  const { userData, loading: userLoading } = useUserData();

  // -- Master State (Strict No-Mock Policy) --
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState("All Assets");

  // -- Engine Controls --
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "Recently Synced",
    desc: true,
  });
  const [isSortOpen, setIsSortOpen] = useState(false);

  // -- Notifications --
  const [toast, setToast] = useState(null);

  // -- Deployment Modal State --
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // -- Form Data --
  const [file, setFile] = useState(null);
  const [assetName, setAssetName] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [assetNote, setAssetNote] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Constants
  const SORT_OPTIONS = [
    "Recently Synced",
    "Oldest First",
    "Name (A-Z)",
    "Size (Heaviest First)",
  ];
  const ASSET_CATEGORIES = [
    "Certificate",
    "Pitch Deck",
    "Resume",
    "Blueprint",
    "Media",
    "Other",
  ];
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const FREE_TIER_LIMIT = 5;

  // Global Key Listener for Modal Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isUploadModalOpen && uploadStep !== 3) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUploadModalOpen, uploadStep]);

  // -- Handlers --
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setToast({ message: "[ ASSET ID COPIED ]", id });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSortToggle = (option) => {
    if (sortConfig.key === option) {
      setSortConfig({ key: option, desc: !sortConfig.desc });
    } else {
      setSortConfig({ key: option, desc: true });
    }
    setIsSortOpen(false);
  };

  // Drag & Drop Logic
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError("");

    const droppedFile = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > MAX_FILE_SIZE) {
      setUploadError(
        `Protocol Rejected: File exceeds 2MB limit. (${formatBytes(droppedFile.size)})`,
      );
      return;
    }

    setFile(droppedFile);
    if (!assetName) setAssetName(droppedFile.name.split(".")[0]);
  };

  const startUpload = () => {
    if (!file || !assetName || !assetCategory) {
      setUploadError("Asset Name and Category are required for deployment.");
      return;
    }
    if (assets.length >= FREE_TIER_LIMIT) {
      setUploadError(
        `Storage Limit Reached: Free tier maximum is ${FREE_TIER_LIMIT} assets.`,
      );
      return;
    }

    setUploadError("");
    setUploadStep(3);

    // Simulated Deployment Engine
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setAssets([
            {
              id: `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
              title: assetName,
              category: assetCategory,
              note: assetNote,
              fileName: file.name,
              size: formatBytes(file.size),
              date: "Just now",
              status: "Pending Scan",
            },
            ...assets,
          ]);
          closeModal();
        }, 1000);
      } else {
        setUploadProgress(progress);
      }
    }, 400);
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setTimeout(() => {
      setUploadStep(1);
      setFile(null);
      setUploadError("");
      setAssetName("");
      setAssetNote("");
      setAssetCategory("");
      setUploadProgress(0);
      setIsDragging(false);
    }, 300); // Wait for exit animation
  };

  return (
    <div className="bg-[#030303] min-h-screen text-white selection:bg-white selection:text-black pb-32 relative font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />
      <BackgroundScanner />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 pt-12 space-y-16">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-xs font-bold text-[#666] uppercase tracking-[0.3em] mb-4"
            >
              <FolderLock className="w-4 h-4" /> 256-Bit Encrypted
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-2 leading-none"
            >
              Asset Vault.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#888] font-medium text-lg md:text-xl tracking-tight max-w-2xl"
            >
              Immutable proof of work. Sync your execution ledger.
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-extrabold text-sm hover:bg-[#ccc] transition-colors shadow-[0_0_40px_rgba(255,255,255,0.15)] group shrink-0"
          >
            <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />{" "}
            Sync New Asset
          </motion.button>
        </div>

        {/* --- TELEMETRY STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-6 md:p-8 hover:border-[#444] transition-colors"
          >
            <p className="text-[9px] md:text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> Total Synced
            </p>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
              {assets.length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-6 md:p-8 hover:border-green-500/30 transition-colors group"
          >
            <p className="text-[9px] md:text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 group-hover:text-green-500 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" /> Network Verified
            </p>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white group-hover:text-green-400 transition-colors">
              {assets.filter((a) => a.status === "Verified").length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-6 md:p-8 hover:border-[#444] transition-colors"
          >
            <p className="text-[9px] md:text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Ledger Hits
            </p>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
              0
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white text-black rounded-[2rem] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between"
          >
            <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Moat Strength
            </p>
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-4xl md:text-5xl font-extrabold tracking-tighter">
                  0
                </p>
                <span className="text-xl font-bold tracking-tight">%</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-black" style={{ width: "0%" }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- GRID & CONTROLS --- */}
        <div className="pt-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 border-b border-[#222] pb-6">
            <div className="flex gap-8 text-sm font-bold overflow-x-auto w-full lg:w-auto custom-scrollbar pb-2 lg:pb-0">
              {["All Assets", "Documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-6 -mb-[25px] whitespace-nowrap transition-colors",
                    activeTab === tab
                      ? "text-white border-b-2 border-white"
                      : "text-[#666] hover:text-white",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-xl text-xs font-bold text-white hover:bg-[#111] transition-colors"
                >
                  <span className="text-[#888]">Sort:</span> {sortConfig.key}
                  {sortConfig.desc ? (
                    <ArrowDown className="w-3 h-3 text-[#666]" />
                  ) : (
                    <ArrowUp className="w-3 h-3 text-[#666]" />
                  )}
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[calc(100%+8px)] right-0 w-full sm:w-48 bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl z-40 overflow-hidden"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSortToggle(opt)}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-[#888] hover:text-white hover:bg-[#111] flex items-center justify-between"
                        >
                          {opt}
                          {sortConfig.key === opt &&
                            (sortConfig.desc ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUp className="w-3 h-3" />
                            ))}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center bg-[#0a0a0a] rounded-xl px-4 py-2.5 border border-[#222] focus-within:border-[#555] transition-colors w-full sm:w-64 group">
                <Search className="w-4 h-4 text-[#444] group-focus-within:text-white shrink-0" />
                <input
                  type="text"
                  placeholder="Query vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs px-3 text-white placeholder-[#444] font-medium"
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto p-2.5 bg-[#0a0a0a] border border-[#222] rounded-xl hover:bg-[#111] transition-colors flex items-center justify-center"
              >
                <Filter className="w-4 h-4 text-[#888]" />
              </button>
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-transparent border-2 border-dashed border-[#222] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#050505] hover:border-[#444] transition-all group w-full max-w-md"
              >
                <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border border-[#222] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-[#666] group-hover:text-white transition-colors" />
                </div>
                <p className="font-extrabold text-white text-xl mb-3 tracking-tight">
                  Sync Proof of Work
                </p>
                <p className="text-sm text-[#666] font-medium leading-relaxed">
                  Deposit blueprints, credentials, or pitch decks to establish
                  your baseline.
                </p>
              </motion.div>
              <p className="mt-10 text-xs font-mono text-[#333] uppercase tracking-[0.4em]">
                [ VAULT EMPTY : NO ASSETS DETECTED ]
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {assets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 hover:border-[#555] transition-all duration-300 group flex flex-col min-h-[280px] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#050505] border border-[#222] flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-black transition-colors duration-300">
                      {getFileIcon(asset.fileName)}
                    </div>
                    {asset.status === "Verified" ? (
                      <div className="px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-[0.2em] flex items-center gap-1.5 bg-[#050505] text-green-500 border border-[#222]">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-[0.2em] flex items-center gap-1.5 bg-[#050505] text-amber-500 border border-[#222] animate-pulse">
                        <ShieldAlert className="w-3 h-3" /> Pending Scan
                      </div>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-extrabold text-white text-xl tracking-tight line-clamp-1 flex-1">
                        {asset.title}
                      </h4>
                      <button
                        onClick={() => handleCopyId(asset.id)}
                        title="Copy Asset ID"
                        className="p-1.5 rounded-md hover:bg-[#222] transition-colors text-[#666] hover:text-white"
                      >
                        {toast?.id === asset.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-[#666]">
                      <span>{asset.date}</span>
                      <span className="w-1 h-1 rounded-full bg-[#333]" />
                      <span>{asset.size}</span>
                    </div>
                    <p className="mt-4 text-sm text-[#888] line-clamp-2 leading-relaxed">
                      {asset.note}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[#222] flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] bg-[#050505] px-3 py-2 rounded-lg border border-[#222] whitespace-nowrap">
                      {asset.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- TOAST --- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 bg-[#111] border border-[#333] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL (Strict Container to Prevent Duplication) --- */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={uploadStep !== 3 ? closeModal : undefined}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222] rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#222] shrink-0">
                <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  {uploadStep === 1
                    ? "Select Protocol"
                    : uploadStep === 2
                      ? "Asset Details"
                      : "Deploying..."}
                </h2>
                {uploadStep !== 3 && (
                  <button
                    onClick={closeModal}
                    className="p-2 bg-[#111] rounded-full text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                {uploadError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs font-bold leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{" "}
                    {uploadError}
                  </div>
                )}

                {uploadStep === 1 && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setUploadStep(2)}
                      className="w-full flex items-center justify-between p-6 rounded-2xl bg-[#111] border border-[#222] hover:border-white/50 hover:bg-[#1a1a1a] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-[#333] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white mb-1">
                            Standard Document
                          </h4>
                          <p className="text-[10px] text-[#666] uppercase tracking-widest">
                            PDF, DOCX, Images
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#444] group-hover:text-white transition-colors" />
                    </button>

                    <div className="w-full flex items-center justify-between p-6 rounded-2xl bg-[#050505] border border-[#111] opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-[#444]">
                          <Github className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-[#888] mb-1">
                            GitHub Repository
                          </h4>
                          <p className="text-[10px] text-[#444] uppercase tracking-widest">
                            Locked for Beta
                          </p>
                        </div>
                      </div>
                      <Lock className="w-4 h-4 text-[#444]" />
                    </div>
                  </div>
                )}

                {uploadStep === 2 && (
                  <div className="space-y-6">
                    <div
                      className={cn(
                        "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 relative",
                        isDragging
                          ? "border-amber-500 bg-amber-500/10 scale-[1.02]"
                          : file
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-[#333] bg-[#111] hover:border-[#555] hover:bg-[#1a1a1a]",
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileDrop}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />

                      {file ? (
                        <div className="text-center px-4">
                          <div className="w-10 h-10 mx-auto rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-2">
                            <Check className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px] mx-auto">
                            {file.name}
                          </p>
                          <p className="text-[10px] font-mono text-[#666] mt-1">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center px-4 pointer-events-none">
                          <Upload
                            className={cn(
                              "w-6 h-6 mx-auto mb-3 transition-colors",
                              isDragging ? "text-amber-500" : "text-[#555]",
                            )}
                          />
                          <p
                            className={cn(
                              "text-xs font-bold transition-colors",
                              isDragging ? "text-amber-400" : "text-[#888]",
                            )}
                          >
                            {isDragging
                              ? "Drop to secure asset"
                              : "Drag & drop file here, or click to browse"}
                          </p>
                          <p className="text-[9px] font-mono text-[#555] uppercase tracking-widest mt-2">
                            Max Size: 2MB
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 px-1">
                          Asset Name
                        </label>
                        <input
                          type="text"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          placeholder="e.g., Q3 Financial Audit"
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2 px-1">
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={assetCategory}
                            onChange={(e) => setAssetCategory(e.target.value)}
                            className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="" disabled>
                              Select category...
                            </option>
                            {ASSET_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <label className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em]">
                            Execution Note
                          </label>
                          <span
                            className={cn(
                              "text-[9px] font-mono",
                              assetNote.length >= 100
                                ? "text-red-500"
                                : "text-[#555]",
                            )}
                          >
                            {assetNote.length} / 100
                          </span>
                        </div>
                        <textarea
                          value={assetNote}
                          onChange={(e) => setAssetNote(e.target.value)}
                          maxLength={100}
                          rows="2"
                          placeholder="Brief context about this asset..."
                          className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#555] transition-colors resize-none custom-scrollbar"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-[#222] mt-4 shrink-0">
                      <button
                        onClick={() => setUploadStep(1)}
                        className="px-6 py-3 bg-[#111] border border-[#222] text-white font-bold rounded-xl hover:bg-[#222] transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={startUpload}
                        disabled={!file || !assetName || !assetCategory}
                        className="flex-1 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#ccc] transition-colors text-sm disabled:opacity-50 flex justify-center items-center"
                      >
                        Initiate Upload
                      </button>
                    </div>
                  </div>
                )}

                {uploadStep === 3 && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-8">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          className="text-[#111] stroke-current"
                          strokeWidth="4"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                        />
                        <circle
                          className="text-white stroke-current transition-all duration-300 ease-out"
                          strokeWidth="4"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                          strokeDasharray="289.027"
                          strokeDashoffset={
                            289.027 - (289.027 * uploadProgress) / 100
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xl font-extrabold">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">
                      Deploying to Vault
                    </h3>
                    <p className="text-xs font-mono text-[#666] uppercase tracking-widest animate-pulse">
                      {uploadProgress < 50
                        ? "Encrypting packet..."
                        : uploadProgress < 90
                          ? "Transmitting to node..."
                          : "Generating Cryptographic Hash..."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;

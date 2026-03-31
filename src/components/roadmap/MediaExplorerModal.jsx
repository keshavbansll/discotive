/**
 * @fileoverview MediaExplorerModal — Mac OS Finder style dynamic vault explorer.
 * Prevents data exhaustion by only calling Firebase when folders are opened.
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Video,
  Headphones,
  Target,
  Database,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  List,
  X,
  Loader2,
} from "lucide-react";
import { fetchVideos } from "../../lib/discotiveLearn";
import { cn } from "../ui/BentoCard";

const CATEGORIES = [
  { id: "assets", label: "Assets", icon: Database },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "podcasts", label: "Podcasts", icon: Headphones },
  { id: "assessments", label: "Assessments", icon: Target },
  { id: "videos", label: "Videos", icon: Video },
];

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i,
  );
  return match ? match[1] : url;
};

export const MediaExplorerModal = ({ isOpen, onClose, onSelect }) => {
  const [path, setPath] = useState(["videos"]); // Start in videos
  const [cache, setCache] = useState({ youtube: null });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setPath(["videos"]);
      setSelectedItem(null);
    }
  }, [isOpen]);

  const handleOpenFolder = async (folderId) => {
    setPath([...path, folderId]);
    if (folderId === "youtube" && !cache.youtube) {
      setIsLoading(true);
      const res = await fetchVideos({ pageSize: 50 }); // Fetch once, no snapshot
      setCache((prev) => ({ ...prev, youtube: res.items }));
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentLevel = path[path.length - 1];

  return createPortal(
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Mac Window UI */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-[900px] h-[600px] max-w-full max-h-[90vh] bg-[#0f0f0f] border border-[#2a2a2a] rounded-[14px] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Bar (Traffic Lights & Breadcrumbs) */}
        <div className="h-14 bg-[#1e1e1e]/80 border-b border-[#2a2a2a] flex items-center px-4 justify-between select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center group"
              >
                <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
              </button>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => path.length > 1 && setPath(path.slice(0, -1))}
                disabled={path.length <= 1}
                className="p-1 text-[#888] disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled className="p-1 text-[#888] opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xs font-bold text-[#aaa] ml-2 flex items-center gap-1.5">
              Discotive Vault <ChevronRight className="w-3 h-3 text-[#555]" />{" "}
              {path
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(" > ")}
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
            <input
              type="text"
              placeholder="Search"
              className="bg-[#111] border border-[#2a2a2a] rounded-md pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-[#444] w-48"
            />
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-[#1e1e1e]/40 border-r border-[#2a2a2a] p-3 flex flex-col gap-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-[#555] px-2 mb-1 mt-2">
              Favorites
            </p>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = path[0] === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setPath([cat.id]);
                    setSelectedItem(null);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[#0066cc] text-white"
                      : "text-[#aaa] hover:bg-white/5",
                  )}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? "#fff" : "#38bdf8" }}
                  />{" "}
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Main View Area */}
          <div
            className="flex-1 bg-[#0f0f0f] p-6 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            {/* Folder Level (e.g. Inside "Videos") */}
            {currentLevel === "videos" && (
              <div className="flex gap-6">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFolder("youtube");
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 cursor-pointer w-24"
                >
                  <Folder
                    className="w-16 h-16 text-[#38bdf8]"
                    fill="#38bdf8"
                    fillOpacity={0.2}
                    strokeWidth={1}
                  />
                  <span className="text-xs text-white select-none">
                    YouTube
                  </span>
                </div>
              </div>
            )}

            {/* Empty States for other root folders */}
            {["assets", "learn", "podcasts", "assessments"].includes(
              currentLevel,
            ) && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
                <Folder className="w-16 h-16 text-[#666] mb-3" />
                <p className="text-sm font-bold text-white">Folder is empty</p>
              </div>
            )}

            {/* Database Loaded Files (e.g. Inside "YouTube") */}
            {currentLevel === "youtube" &&
              (isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#555] animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {(cache.youtube || []).map((v) => (
                    <div
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(v);
                      }}
                      onDoubleClick={() => onSelect(v)}
                      className={cn(
                        "flex flex-col gap-2 p-2 rounded-xl cursor-pointer border transition-all",
                        selectedItem?.id === v.id
                          ? "bg-white/10 border-white/20"
                          : "border-transparent hover:bg-white/5",
                      )}
                    >
                      <div className="w-full aspect-video bg-[#111] rounded-lg overflow-hidden relative border border-[#222]">
                        {/* CHANGED: Auto-generates the thumbnail from the YouTube ID */}
                        <img
                          src={
                            v.thumbnailUrl ||
                            `https://img.youtube.com/vi/${extractYouTubeId(v.url || v.youtubeId)}/hqdefault.jpg`
                          }
                          className="w-full h-full object-cover"
                          alt={v.title}
                        />
                      </div>
                      <span className="text-xs text-white line-clamp-2 px-1">
                        {v.title}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-14 bg-[#1e1e1e]/80 border-t border-[#2a2a2a] flex items-center px-4 justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-bold text-white hover:bg-white/10 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedItem && onSelect(selectedItem)}
            disabled={!selectedItem}
            className="px-5 py-1.5 text-xs font-bold text-white bg-[#0066cc] hover:bg-[#0077ed] disabled:opacity-30 disabled:bg-[#444] rounded-md transition-colors shadow-lg"
          >
            Link Media
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

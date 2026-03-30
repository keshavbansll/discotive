/**
 * @fileoverview VideoWidgetNode — YouTube / external media proxy
 * Fixed: window.dispatchEvent("VIDEO_WATCHED") → useRoadmap().markVideoWatched()
 *        window.dispatchEvent("OPEN_VIDEO_MODAL") → useRoadmap().openVideoModal()
 */
import React, { useState, memo } from "react";
import { Handle, Position } from "reactflow";
import { Video, Check } from "lucide-react";
import { cn } from "../../ui/BentoCard";
import { useRoadmap } from "../../../contexts/RoadmapContext.jsx";

export const VideoWidgetNode = memo(({ id, data, selected }) => {
  const { openVideoModal, markVideoWatched } = useRoadmap();
  const [isPlaying, setIsPlaying] = useState(false);

  const isWatched = !!data.isWatched;
  const bc = selected
    ? "#38bdf8"
    : isWatched
      ? "rgba(56,189,248,0.4)"
      : "#1e1e1e";
  const bs = selected
    ? "0 0 50px rgba(56,189,248,0.25), 0 20px 40px rgba(0,0,0,0.6)"
    : "0 20px 40px rgba(0,0,0,0.4)";

  return (
    <div
      className={cn(
        "w-[340px] bg-[#0a0a0c]/95 backdrop-blur-2xl border rounded-[1.5rem] p-2.5 relative transition-all duration-300 group",
        selected ? "scale-[1.03] z-50" : "scale-100 z-10",
      )}
      style={{ borderColor: bc, boxShadow: bs }}
      role="article"
      aria-label={`Video widget: ${data.title || "No video linked"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-sky-400 relative before:absolute before:-inset-6 before:content-['']"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-sky-400 relative before:absolute before:-inset-6 before:content-['']"
      />

      {/* Thumbnail / player */}
      {data.youtubeId ? (
        <div className="w-full h-[180px] rounded-xl overflow-hidden relative bg-black border border-[#1a1a1a]">
          {isPlaying ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${data.youtubeId}?autoplay=1`}
              title={data.title || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          ) : (
            <button
              className="w-full h-full relative cursor-pointer group/play"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play: ${data.title || "video"}`}
            >
              {data.thumbnailUrl && (
                <img
                  src={data.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover/play:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 bg-[#0a0a0c]/70 backdrop-blur-md rounded-full flex items-center justify-center pl-1.5 border border-white/20 hover:bg-sky-500/25 hover:border-sky-400 transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent" />
                </div>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-[180px] rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] flex flex-col items-center justify-center gap-3">
          <Video className="w-8 h-8 text-sky-500/30" aria-hidden="true" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => openVideoModal(id)}
            aria-label="Embed video source"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(56,189,248,0.2)] focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
          >
            Embed Source
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 pb-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4
            className={cn(
              "text-xs font-black truncate",
              isWatched ? "text-[#888]" : "text-white",
            )}
          >
            {data.title || "External Protocol Video"}
          </h4>
          <p className="text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">
            {data.platform || "Media Source"}
          </p>
        </div>
        {data.youtubeId && (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => !isWatched && markVideoWatched(id)}
            disabled={isWatched}
            title={isWatched ? "Marked as watched" : "Mark as watched"}
            aria-label={
              isWatched ? "Video marked as watched" : "Mark video as watched"
            }
            className={cn(
              "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none",
              isWatched
                ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                : "bg-[#111] border-[#333] hover:border-sky-400 text-transparent hover:text-sky-400/50",
            )}
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
VideoWidgetNode.displayName = "VideoWidgetNode";

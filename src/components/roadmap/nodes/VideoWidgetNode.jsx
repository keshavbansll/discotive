/**
 * @fileoverview VideoWidgetNode — Proportional Proof-of-Work Video Engine
 */
import React, { useState, memo } from "react";
import { Handle, Position } from "reactflow";
import { Video, Check, AlertTriangle } from "lucide-react";
import { cn } from "../../ui/BentoCard";
import { useRoadmap } from "../../../contexts/RoadmapContext.jsx";
import { useYouTubePlayer } from "../../../hooks/useYouTubePlayer";
import { calculateVideoScore } from "../../../lib/discotiveLearn";

export const VideoWidgetNode = memo(({ id, data, selected }) => {
  const { openVideoModal, markVideoWatched } = useRoadmap();
  const [showIntercept, setShowIntercept] = useState(false);

  // Custom hook extracts progress telemetry safely
  const { containerRef, isReady, playerState, progress } = useYouTubePlayer(
    data.youtubeId,
  );
  const watchPct = progress?.percentage || 0;

  const isWatched = !!data.isWatched;
  const bc = selected
    ? "#38bdf8"
    : isWatched
      ? "rgba(56,189,248,0.4)"
      : "#1e1e1e";
  const bs = selected
    ? "0 0 50px rgba(56,189,248,0.25), 0 20px 40px rgba(0,0,0,0.6)"
    : "0 20px 40px rgba(0,0,0,0.4)";

  const handleMarkComplete = (e) => {
    e.stopPropagation();
    if (watchPct < 95 && !isWatched) {
      setShowIntercept(true); // Trigger early exit penalty warning
    } else {
      executeCompletion();
    }
  };

  const executeCompletion = () => {
    setShowIntercept(false);
    // Score is strictly calculated proportionally based on max 10
    const scoreData = calculateVideoScore(watchPct);
    markVideoWatched(id, scoreData);
  };

  return (
    <div
      className={cn(
        "w-[340px] bg-[#0a0a0c]/95 backdrop-blur-2xl border rounded-[1.5rem] p-2.5 relative transition-all duration-300 group overflow-hidden",
        selected ? "scale-[1.03] z-50" : "scale-100 z-10",
      )}
      style={{ borderColor: bc, boxShadow: bs }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-sky-400 relative before:absolute before:-inset-6"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-sky-400 relative before:absolute before:-inset-6"
      />

      {/* Intercept Overlay for Proportional Scoring */}
      {showIntercept && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-xl flex flex-col items-center justify-center p-5 text-center rounded-[1.5rem] border border-sky-500/30">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
          <h4 className="text-white font-black text-sm mb-1">
            Early Exit Detected
          </h4>
          <p className="text-[#888] text-[10px] mb-4">
            You've only watched {Math.floor(watchPct)}%. Marking complete now
            yields a mathematically penalized score.
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowIntercept(false)}
              className="flex-1 py-2 bg-[#111] text-white text-[9px] font-bold rounded-lg hover:bg-[#222]"
            >
              Resume Watch
            </button>
            <button
              onClick={executeCompletion}
              className="flex-1 py-2 bg-sky-500 text-black text-[9px] font-black rounded-lg"
            >
              Accept Penalty
            </button>
          </div>
        </div>
      )}

      {/* Video Embed */}
      {data.youtubeId ? (
        <div className="w-full h-[180px] rounded-xl overflow-hidden relative bg-black border border-[#1a1a1a]">
          {/* CRITICAL FIX: Isolated container for YouTube to safely hijack/replace */}
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full border-0"
          />

          {/* Progress bar stays safely OUTSIDE the hijacked element */}
          <div className="absolute bottom-0 left-0 h-1 bg-sky-500/20 w-full z-10 pointer-events-none">
            <div
              className="h-full bg-sky-500 transition-all duration-1000"
              style={{ width: `${watchPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-[180px] rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] flex flex-col items-center justify-center gap-3">
          <Video className="w-8 h-8 text-sky-500/30" />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Stops React Flow from selecting other nodes
              openVideoModal(id); // Forces the EXACT video node ID
            }}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(56,189,248,0.2)]"
          >
            Attach Media Source
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
          <p className="text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-0.5 flex gap-2">
            <span>{data.platform || "Media Source"}</span>
            {data.learnId && (
              <span className="text-white/30 font-mono">
                ID: {data.learnId.split("_").pop()}
              </span>
            )}
          </p>
        </div>
        {data.youtubeId && (
          <button
            onClick={handleMarkComplete}
            disabled={isWatched}
            className={cn(
              "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all",
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

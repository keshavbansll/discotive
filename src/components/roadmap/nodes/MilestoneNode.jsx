/**
 * @fileoverview MilestoneNode — Achievement checkpoint with amber glow pulse
 */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Trophy, Lock } from "lucide-react";
import { motion } from "framer-motion";

export const MilestoneNode = memo(({ data, selected }) => {
  const isUnlocked = !!data.isUnlocked;
  const bc = selected
    ? "#f59e0b"
    : isUnlocked
      ? "rgba(245,158,11,0.5)"
      : "#1e1e1e";
  const bs = selected
    ? "0 0 60px rgba(245,158,11,0.35), 0 20px 40px rgba(0,0,0,0.7)"
    : isUnlocked
      ? "0 0 30px rgba(245,158,11,0.15)"
      : "0 20px 40px rgba(0,0,0,0.4)";

  return (
    <div
      className="w-[240px] bg-[#0a0a0c]/97 backdrop-blur-2xl border rounded-[2rem] p-6 relative transition-all duration-300 flex flex-col items-center text-center"
      style={{
        borderColor: bc,
        boxShadow: bs,
        transform: selected ? "scale(1.05)" : "scale(1)",
      }}
      role="article"
      aria-label={`Milestone: ${data.title || "Untitled"}${isUnlocked ? " — Unlocked" : " — Locked"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-amber-500 relative before:absolute before:-inset-6 before:content-['']"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-amber-500 relative before:absolute before:-inset-6 before:content-['']"
      />

      {/* Icon with unlock pulse */}
      <div className="relative mb-4">
        {isUnlocked && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl bg-amber-500/20 pointer-events-none"
          />
        )}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
          style={{
            background: isUnlocked
              ? "rgba(245,158,11,0.1)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${isUnlocked ? "rgba(245,158,11,0.3)" : "#1e1e1e"}`,
          }}
        >
          {isUnlocked ? (
            <Trophy className="w-6 h-6 text-amber-400" aria-hidden="true" />
          ) : (
            <Lock className="w-6 h-6 text-[#333]" aria-hidden="true" />
          )}
        </div>
      </div>

      <h4 className="text-sm font-black text-white mb-1 leading-tight">
        {data.title || "Milestone"}
      </h4>
      <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest">
        {data.subtitle || "Achievement"}
      </p>

      {data.xpReward && (
        <div className="mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
            +{data.xpReward} pts on unlock
          </span>
        </div>
      )}
    </div>
  );
});
MilestoneNode.displayName = "MilestoneNode";

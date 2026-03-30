/**
 * @fileoverview Discotive Roadmap — ExecutionNode (Primary DAG Node)
 *
 * Fixed vs original:
 *  - Removed window.dispatchEvent for collapse toggle → uses RoadmapContext
 *  - Added role="article" and aria-label for accessibility
 *  - All icon-only buttons have aria-label
 *  - Progress ring uses CSS transition (not re-rendered on every parent update)
 */

import React, { useState, memo } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import {
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lock,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Tag,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../ui/BentoCard";
import { NODE_ACCENT_PALETTE } from "../../lib/roadmap/constants.js";
import { useRoadmap } from "../../contexts/RoadmapContext.jsx";

const CIRCUMFERENCE = 2 * Math.PI * 28; // r=28

const handleCls =
  "!w-4 !h-4 !bg-[#111] hover:!scale-150 transition-transform relative before:absolute before:-inset-6 before:content-[''] before:z-50";

export const ExecutionNode = memo(
  ({ data, selected, id, style: nodeStyle }) => {
    const [collapsed, setCollapsed] = useState(data.collapsed || false);
    const { toggleNodeCollapse, setActiveEditNodeId } = useRoadmap();

    const isCompleted = !!data.isCompleted;
    const isOverdue =
      !isCompleted && data.deadline && new Date(data.deadline) < new Date();
    const isActive =
      data.priorityStatus === "READY" && !isCompleted && !isOverdue;
    const isFuture =
      data.priorityStatus === "FUTURE" && !isCompleted && !isOverdue;
    const accent = NODE_ACCENT_PALETTE[data.accentColor || "amber"];

    const tasks = data.tasks || [];
    const completedTasks = tasks.filter((t) => t.completed).length;
    const progress =
      tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : isCompleted
          ? 100
          : 0;

    const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
    const ringColor = isCompleted
      ? "#10b981"
      : isOverdue
        ? "#ef4444"
        : isActive
          ? accent.primary
          : "#333";
    const borderColor = selected
      ? accent.primary
      : isCompleted
        ? "#10b981"
        : isOverdue
          ? "#ef4444"
          : isActive
            ? accent.primary
            : "#2a2a2a";

    const statusLabel = isCompleted
      ? "Completed"
      : isOverdue
        ? "Overdue"
        : isActive
          ? "Active"
          : "Pending";

    return (
      <div
        role="article"
        aria-label={`Execution node: ${data.title || "Untitled"} — ${statusLabel}`}
        aria-selected={selected}
        className={cn(
          "rounded-[32px] p-2 transition-all duration-300 backdrop-blur-2xl relative group",
          data.isDimmed
            ? "opacity-20 grayscale pointer-events-none"
            : isFuture && !selected
              ? "opacity-55 bg-[#060606]/80"
              : "opacity-100 bg-[#0a0a0c]/90",
          selected ? "scale-[1.02] z-50" : "scale-100 hover:scale-[1.004] z-10",
        )}
        style={{
          width: nodeStyle?.width ?? 420,
          minWidth: 320,
          boxShadow: selected
            ? `0 0 0 1.5px ${accent.primary}, 0 0 80px ${accent.glow}, 0 30px 60px rgba(0,0,0,0.8)`
            : isCompleted
              ? "0 0 0 1px #10b981, 0 0 30px rgba(16,185,129,0.08), 0 20px 40px rgba(0,0,0,0.4)"
              : isActive
                ? `0 0 0 1px ${accent.primary}, 0 0 40px ${accent.glow}, 0 20px 40px rgba(0,0,0,0.4)`
                : "0 0 0 1px #2a2a2a, 0 20px 40px rgba(0,0,0,0.4)",
        }}
        onClick={() => setActiveEditNodeId(id)}
      >
        <NodeResizer
          minWidth={320}
          minHeight={160}
          isVisible={selected}
          lineStyle={{ border: `1.5px dashed ${accent.primary}`, opacity: 0.5 }}
          handleStyle={{
            backgroundColor: accent.primary,
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: "2.5px solid #030303",
          }}
        />

        {/* Handles */}
        {[
          { type: "target", pos: Position.Top, id: "top" },
          { type: "target", pos: Position.Left, id: "left" },
          { type: "source", pos: Position.Bottom, id: "bottom" },
          { type: "source", pos: Position.Right, id: "right" },
        ].map((h) => (
          <Handle
            key={h.id}
            type={h.type}
            position={h.pos}
            id={h.id}
            className={cn(handleCls, "!border-2")}
            style={{ borderColor: accent.primary }}
          />
        ))}

        {/* Collapse toggle */}
        <button
          aria-label={collapsed ? "Expand node" : "Collapse node"}
          aria-expanded={!collapsed}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((c) => {
              const next = !c;
              toggleNodeCollapse(id, next); // context call — no window events
              return next;
            });
          }}
          className="absolute top-3 right-3 z-20 w-7 h-7 bg-[#111] border border-[#333] rounded-full flex items-center justify-center text-[#666] hover:text-white hover:border-[#555] transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          {collapsed ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </button>

        <div className="p-5 pointer-events-none select-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0 pr-10 flex-1">
              {/* Status chips */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <div
                  className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                  style={{
                    background: isCompleted
                      ? "rgba(16,185,129,0.08)"
                      : isOverdue
                        ? "rgba(239,68,68,0.08)"
                        : isActive
                          ? accent.bg
                          : "rgba(255,255,255,0.04)",
                    color: isCompleted
                      ? "#10b981"
                      : isOverdue
                        ? "#ef4444"
                        : isActive
                          ? accent.primary
                          : "#666",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : isOverdue ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : isActive ? (
                    <Activity
                      className="w-3 h-3"
                      style={{ animation: "pulse 1.5s infinite" }}
                    />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {data.nodeType || "Protocol"}
                </div>
                {data.deadline && (
                  <div
                    className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 border"
                    style={{
                      borderColor:
                        isOverdue && !isCompleted
                          ? "rgba(239,68,68,0.3)"
                          : "#2a2a2a",
                      color: isOverdue && !isCompleted ? "#f87171" : "#555",
                      background:
                        isOverdue && !isCompleted
                          ? "rgba(239,68,68,0.05)"
                          : "transparent",
                    }}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(data.deadline).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                    {isOverdue && !isCompleted && " OVERDUE"}
                  </div>
                )}
                {data.linkedAssets?.length > 0 && (
                  <div className="px-2 py-1 rounded-md text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />{" "}
                    {data.linkedAssets.length}
                  </div>
                )}
              </div>

              <h3
                className="text-[22px] font-black tracking-tight leading-tight mb-1"
                style={{
                  color: isCompleted
                    ? "#6ee7b7"
                    : isOverdue
                      ? "#fca5a5"
                      : "#fff",
                }}
              >
                {data.title || "Unnamed Protocol"}
              </h3>
              <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
                {data.subtitle || "Awaiting Classification"}
              </p>

              {/* Tags */}
              {!collapsed && data.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {data.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1"
                      style={{ background: accent.bg, color: accent.primary }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Progress ring */}
            <div className="shrink-0 relative w-[68px] h-[68px]">
              <svg
                viewBox="0 0 64 64"
                className="w-full h-full -rotate-90"
                aria-label={`${progress}% complete`}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="5"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease",
                    filter:
                      progress > 0
                        ? `drop-shadow(0 0 4px ${ringColor})`
                        : "none",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[14px] font-black font-mono leading-none"
                  style={{ color: ringColor }}
                >
                  {progress}
                </span>
                <span className="text-[7px] text-[#555] uppercase tracking-widest">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Expanded content */}
          {!collapsed && (
            <>
              {data.desc && (
                <p className="text-sm text-[#777] leading-relaxed mb-4 line-clamp-3">
                  {data.desc}
                </p>
              )}

              {/* Sub-tasks */}
              {tasks.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {tasks.slice(0, 5).map((task, i) => (
                    <div
                      key={task.id || i}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl"
                      style={{
                        background: task.completed
                          ? "rgba(16,185,129,0.06)"
                          : "rgba(255,255,255,0.02)",
                        border: `1px solid ${task.completed ? "rgba(16,185,129,0.2)" : "#1a1a1a"}`,
                      }}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          task.completed
                            ? "border-emerald-500 bg-emerald-500/20"
                            : "border-[#444]",
                        )}
                      >
                        {task.completed && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs flex-1 leading-tight",
                          task.completed
                            ? "line-through text-[#555]"
                            : "text-[#ccc]",
                        )}
                      >
                        {task.text}
                      </span>
                      {task.points > 0 && (
                        <span className="text-[8px] font-black text-amber-500/60 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          {task.points}
                        </span>
                      )}
                    </div>
                  ))}
                  {tasks.length > 5 && (
                    <p className="text-[9px] text-[#444] text-center">
                      +{tasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}

              {/* Delegation avatars */}
              {data.delegates?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-[#444] uppercase tracking-widest mr-1">
                    Team
                  </span>
                  {data.delegates.slice(0, 4).map((d, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[8px] font-black text-[#888]"
                    >
                      {d.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {data.delegates.length > 4 && (
                    <span className="text-[9px] text-[#444]">
                      +{data.delegates.length - 4}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

ExecutionNode.displayName = "ExecutionNode";

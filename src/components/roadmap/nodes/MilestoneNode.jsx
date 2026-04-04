/**
 * @fileoverview MilestoneNode (Hub Node) — v4 Neural Engine Redesign
 * * Acts as a router/convergence point in the DAG.
 * Subscribes to the pure functional state machine rather than legacy booleans.
 */

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { Trophy, Lock as LockIcon, Zap, Flag } from "lucide-react";
import { HANDLE_S } from "../../../lib/roadmap/layout";
import {
  NODE_STATES,
  NODE_ACCENT_PALETTE,
} from "../../../lib/roadmap/constants";

const HANDLE_HOVER_CLS =
  "hover:!scale-150 transition-transform before:absolute before:-inset-5 before:content-[''] before:z-50 relative";

export const MilestoneNode = memo(({ data, selected }) => {
  // ── Strict Engine State Parsing ──────────────────────────────────────────────
  // Fallback maps legacy data to the new engine states if graphEngine is unmounted
  const computedState =
    data._computed?.state ||
    (data.isUnlocked ? NODE_STATES.VERIFIED : NODE_STATES.LOCKED);

  // ── Derived State Checks ───────────────────────────────────────────────────
  const isLocked = computedState === NODE_STATES.LOCKED;
  const isVerified =
    computedState === NODE_STATES.VERIFIED ||
    computedState === NODE_STATES.VERIFIED_GHOST;
  const isActive =
    computedState === NODE_STATES.ACTIVE ||
    computedState === NODE_STATES.IN_PROGRESS;

  const baseAccent =
    NODE_ACCENT_PALETTE[data.accentColor || "amber"]?.primary || "#f59e0b";

  // ── Brutalist State Mapping ────────────────────────────────────────────────
  let statusColor, statusLabel;

  if (isLocked) {
    statusColor = "rgba(255,255,255,0.2)";
    statusLabel = "Locked";
  } else if (isVerified) {
    statusColor = "#10b981"; // System Emerald
    statusLabel = "Milestone Reached";
  } else {
    statusColor = baseAccent;
    statusLabel = "Active Phase";
  }

  const borderColor = selected
    ? `${statusColor}80`
    : isVerified
      ? `${statusColor}35`
      : isActive
        ? `${statusColor}30`
        : "rgba(255,255,255,0.07)";

  const nodeShadow = selected
    ? `0 4px 20px rgba(0,0,0,0.8), 0 0 15px ${statusColor}25`
    : isVerified
      ? `0 0 15px ${statusColor}10`
      : isActive
        ? `0 0 10px ${statusColor}10`
        : "0 1px 6px rgba(0,0,0,0.5)";

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden transition-all duration-300"
      style={{
        width: 200,
        borderRadius: 12,
        background: "#0d0d12",
        border: `1px solid ${borderColor}`,
        boxShadow: nodeShadow,
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
      role="article"
      aria-label={`Milestone: ${data.title || "Untitled"} - ${statusLabel}`}
    >
      {/* ── Handles ──────────────────────────────────────────────────────── */}
      <Handle
        type="target"
        position={Position.Left}
        className={HANDLE_HOVER_CLS}
        style={{ ...HANDLE_S, borderColor: `${statusColor}50` }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={HANDLE_HOVER_CLS}
        style={{ ...HANDLE_S, borderColor: `${statusColor}50` }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          TOP ACCENT BAR — State driven identity line
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          height: 2,
          width: "100%",
          background: statusColor,
          opacity: isVerified ? (selected ? 0.9 : 0.6) : isActive ? 0.8 : 0.2,
          transition: "background 0.3s, opacity 0.3s",
        }}
      />

      <div
        className="flex flex-col items-center text-center w-full pointer-events-none select-none"
        style={{ padding: "14px 16px 16px" }}
      >
        {/* ── Header Label ── */}
        <span
          className="text-[8px] font-black uppercase tracking-[0.15em] mb-3"
          style={{ color: `${statusColor}b0` }}
        >
          {statusLabel}
        </span>

        {/* ── Center Icon ── */}
        <div className="relative mb-3">
          {/* Pulse effect strictly for active or verified states */}
          {(isVerified || isActive) && (
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: isVerified ? 2.5 : 1.5, // Faster pulse if currently active
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: 10,
                background: `${statusColor}15`,
                pointerEvents: "none",
              }}
            />
          )}
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isLocked
                ? "rgba(255,255,255,0.02)"
                : `${statusColor}12`,
              border: `1px solid ${isLocked ? "rgba(255,255,255,0.05)" : `${statusColor}30`}`,
              position: "relative",
              zIndex: 1,
              transition: "border 0.3s, background 0.3s",
            }}
          >
            {isVerified ? (
              <Trophy style={{ width: 18, height: 18, color: statusColor }} />
            ) : isActive ? (
              <Flag style={{ width: 18, height: 18, color: statusColor }} />
            ) : (
              <LockIcon style={{ width: 16, height: 16, color: statusColor }} />
            )}
          </div>
        </div>

        {/* ── Title & Subtitle ── */}
        <p
          className="font-bold leading-snug mb-0.5"
          style={{
            fontSize: 13,
            color: isLocked
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.92)",
          }}
        >
          {data.title || "Phase Objective"}
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
          {data.subtitle || "System Hub"}
        </p>

        {/* ── Reward Badge (Only visible if not locked) ── */}
        {data.xpReward && !isLocked && (
          <div
            className="flex items-center gap-1 mt-3 px-2.5 py-1 rounded border"
            style={{
              background: isVerified
                ? "rgba(16,185,129,0.1)"
                : "rgba(255,255,255,0.03)",
              borderColor: isVerified
                ? "rgba(16,185,129,0.2)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <Zap
              style={{
                width: 9,
                height: 9,
                color: isVerified ? "#10b981" : "rgba(255,255,255,0.4)",
              }}
            />
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: isVerified ? "#10b981" : "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {isVerified
                ? `${data.xpReward} XP Claimed`
                : `+${data.xpReward} XP upon unlock`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MilestoneNode.displayName = "MilestoneNode";

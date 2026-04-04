/**
 * @fileoverview NeuralEdge v4 — Engine-Driven Data Conduits
 *
 * Performance & Architecture:
 * - Native useStore subscription: Edges react directly to graphEngine state
 * without requiring parent re-renders.
 * - GPU-composited CSS offset-path for particles (60fps, no main-thread SMIL).
 * - Strict binary flow: Data packets only animate if source is VERIFIED.
 *
 * Visual language:
 * - core-core: main spine connections
 * - core-branch: task connections
 * - branch-sub: subtask connections
 */

import React, { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useStore,
} from "reactflow";
import { NODE_STATES } from "../../lib/roadmap/constants.js";

// ── Structural baseline (Topology thickness, not state) ───────────────────────
const EDGE_CFG = {
  "core-core": { w: 2, defaultDash: 0 },
  "core-branch": { w: 1.5, defaultDash: 8 },
  "branch-sub": { w: 1, defaultDash: 0 },
  open: { w: 1, defaultDash: 6 },
};
const DEFAULT_CFG = { w: 1, defaultDash: 6 };

export const NeuralEdge = memo(
  ({
    id,
    source,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    data,
    selected,
  }) => {
    // ── Engine State Subscription ────────────────────────────────────────────────
    // O(1) lookup to get the exact computed state of the node this edge originates from.
    const sourceNode = useStore((s) => s.nodeInternals.get(source));

    // Fallback to ACTIVE if the engine hasn't hydrated the graph yet
    const sourceState =
      sourceNode?.data?._computed?.state || NODE_STATES.ACTIVE;

    // The Conduit Rule: Energy only flows if the source is fully verified.
    const isFlowing =
      sourceState === NODE_STATES.VERIFIED ||
      sourceState === NODE_STATES.VERIFIED_GHOST;

    // ── Path Routing ────────────────────────────────────────────────────────────
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 14,
      offset: 50,
    });

    const accent = data?.accent || "#f59e0b";
    const connType = data?.connType || "open";
    const cfg = EDGE_CFG[connType] ?? DEFAULT_CFG;

    // ── Visual State Machine Mapping ────────────────────────────────────────────

    // Opacity: Bright if flowing or selected. Dim if locked/pending.
    const strokeOp = selected ? 1 : isFlowing ? 0.75 : 0.2;

    // Width: Slightly thicker if selected to aid visual tracing
    const strokeW = selected ? cfg.w + 0.5 : cfg.w;

    // Color: Bright accent if flowing. Muted/Greyed if dead.
    const strokeColor = selected
      ? accent
      : isFlowing
        ? `${accent}dd`
        : "rgba(255,255,255,0.15)";

    // Dash Pattern: Dead conduits are ALWAYS dashed to show they are incomplete.
    // Flowing conduits use their structural default (usually solid).
    const dashVal = !isFlowing ? 6 : cfg.defaultDash;
    const dashArray =
      dashVal > 0 ? `${dashVal} ${Math.round(dashVal * 0.75)}` : undefined;

    return (
      <>
        {/* ── Main edge stroke — CSS dash animation only if flowing ── */}
        <BaseEdge
          path={edgePath}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth: strokeW,
            opacity: strokeOp,
            strokeDasharray: dashArray,
            ...(isFlowing && dashVal > 0
              ? { animation: "dashFlow 1.6s linear infinite" }
              : {}),
            transition: "stroke-width 0.2s, opacity 0.3s, stroke 0.3s",
          }}
        />

        {/* ── Animated Data Packet Particle ── 
          Strict rule: Particles ONLY exist if data is flowing (or if user clicks to inspect) */}
        {(isFlowing || selected) && (
          <circle
            r={selected ? 3.5 : 2.5}
            fill={accent}
            style={{
              // GPU-accelerated drop-shadow (cheaper than SVG filter:blur)
              filter: `drop-shadow(0 0 ${selected ? 5 : 2.5}px ${accent}90)`,
              offsetPath: `path("${edgePath}")`,
              offsetDistance: "0%",
              animation: `particleOrbit ${selected ? "1.5" : "2.5"}s linear infinite`,
              willChange: "offset-distance",
              transition: "r 0.15s",
            }}
          />
        )}

        {/* ── Directional arrow tip for spine connections ── */}
        {connType === "core-core" && (
          <marker id={`arrow-${id}`}>
            <path
              d="M0,-2 L4,0 L0,2"
              fill={
                selected
                  ? accent
                  : isFlowing
                    ? `${accent}90`
                    : "rgba(255,255,255,0.2)"
              }
              style={{ transition: "fill 0.3s" }}
            />
          </marker>
        )}

        {/* ── Diagnostic Label — Visible only on selection ── */}
        {selected && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "none",
                background: "rgba(13,13,18,0.95)",
                border: `1px solid ${accent}40`,
                fontSize: 8,
                fontWeight: 800,
                color: accent,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
              className="px-1.5 py-0.5 rounded shadow-xl"
            >
              {connType}
              <span style={{ color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                {isFlowing ? "FLOWING" : "BLOCKED"}
              </span>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

NeuralEdge.displayName = "NeuralEdge";

export const edgeTypes = { neuralEdge: NeuralEdge };

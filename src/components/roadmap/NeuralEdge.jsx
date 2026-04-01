/**
 * @fileoverview NeuralEdge v3 — Clean connector redesign
 *
 * Performance improvements vs v2:
 *  - Removed the glow halo <path> (was the #1 edge GPU cost: filter:blur on every edge)
 *  - Max stroke width 2px (was 4.5px)
 *  - Simplified SVG: 1 path + 1 animated circle (was 2 paths + 1 circle)
 *  - Particle uses CSS offset-path (GPU-composited, no SMIL, same as before)
 *  - Edge type config is leaner
 *  - Selected state uses accent color at full opacity, not-selected = 35-60%
 *
 * Visual language:
 *  - core-core: solid 2px line — main spine connections
 *  - core-branch: dashed 1.5px with particle — task connections
 *  - branch-sub: solid 1px dimmed — subtask connections
 *  - open: dashed 1px very dim with particle — loose connections
 */

import React, { useId } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";

// ── Edge type config ──────────────────────────────────────────────────────────
const EDGE_CFG = {
  "core-core": { w: 2, dash: 0, animated: false, op: 0.7, particle: false },
  "core-branch": { w: 1.5, dash: 8, animated: true, op: 0.5, particle: true },
  "branch-sub": { w: 1, dash: 0, animated: false, op: 0.28, particle: false },
  open: { w: 1, dash: 6, animated: true, op: 0.22, particle: true },
};
const DEFAULT_CFG = { w: 1, dash: 6, animated: true, op: 0.22, particle: true };

export const NeuralEdge = ({
  id,
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

  // When selected: full opacity + slightly thicker
  const strokeOp = selected ? Math.min(cfg.op + 0.35, 1) : cfg.op;
  const strokeW = selected ? cfg.w + 0.5 : cfg.w;
  const strokeColor = selected ? accent : `${accent}cc`;

  // Dash pattern
  const dashArray =
    cfg.dash > 0 ? `${cfg.dash} ${Math.round(cfg.dash * 0.55)}` : undefined;

  return (
    <>
      {/* ── Main edge stroke — NO glow halo, CSS dash animation ── */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: strokeW,
          opacity: strokeOp,
          strokeDasharray: dashArray,
          ...(cfg.animated && cfg.dash > 0
            ? { animation: "dashFlow 1.6s linear infinite" }
            : {}),
          transition: "stroke-width 0.18s, opacity 0.18s, stroke 0.18s",
        }}
      />

      {/* ── Animated dot particle — GPU offset-path, only when animated ── */}
      {(cfg.particle || selected) && (
        <circle
          r={selected ? 3.5 : 2.5}
          fill={accent}
          style={{
            // Subtle drop-shadow only — no expensive filter:blur
            filter: `drop-shadow(0 0 ${selected ? 5 : 2.5}px ${accent}90)`,
            offsetPath: `path("${edgePath}")`,
            offsetDistance: "0%",
            animation: `particleOrbit ${selected ? "1.8" : "2.8"}s linear infinite`,
            willChange: "offset-distance",
            transition: "r 0.15s",
          }}
        />
      )}

      {/* ── Directional arrow tip for core-core connections ── */}
      {connType === "core-core" && (
        <marker id={`arrow-${id}`}>
          <path
            d="M0,-2 L4,0 L0,2"
            fill={selected ? accent : `${accent}80`}
            style={{ transition: "fill 0.18s" }}
          />
        </marker>
      )}

      {/* ── Connection type label — visible only on selection ── */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
            }}
            className="px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(13,13,18,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 8,
              fontWeight: 800,
              color: `${accent}60`,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {connType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const edgeTypes = { neuralEdge: NeuralEdge };

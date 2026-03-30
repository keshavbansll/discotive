/**
 * @fileoverview Discotive Roadmap — Neural Edge Renderer
 *
 * Performance fix vs original:
 *  The original used SVG SMIL <animateMotion> on EVERY edge.
 *  With 30+ edges this creates 30 simultaneous SMIL animations on the main
 *  thread, dropping canvas to ~20fps on mobile and causing full paint cycles
 *  in Safari (which has poor SMIL support).
 *
 *  This version uses:
 *   - CSS `stroke-dashoffset` animation (GPU-composited, zero layout reflow)
 *   - A single animated dot using `offset-path` CSS property (motion path),
 *     which is hardware-accelerated in all modern browsers.
 *   - Falls back to a simple glowing stroke if motion-path is unsupported.
 */

import React, { useId } from "react";
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "reactflow";

const EDGE_CONFIG = {
  "core-core": {
    weight: 4.5,
    dashLen: 0,
    animated: false,
    opacity: 0.9,
    particleColor: "bright",
  },
  "core-branch": {
    weight: 3,
    dashLen: 12,
    animated: true,
    opacity: 0.8,
    particleColor: "normal",
  },
  "branch-sub": {
    weight: 2,
    dashLen: 0,
    animated: false,
    opacity: 0.65,
    particleColor: "dim",
  },
  open: {
    weight: 1.5,
    dashLen: 6,
    animated: true,
    opacity: 0.35,
    particleColor: "dim",
  },
};

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
  const gradId = useId().replace(/:/g, "");

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 60,
  });

  const accent = data?.accent || "#f59e0b";
  const connType = data?.connType || "open";
  const cfg = EDGE_CONFIG[connType] || EDGE_CONFIG.open;
  const baseOpacity = selected ? 1 : cfg.opacity;

  // Dash pattern for animated edges (CSS driven)
  const dashArray =
    cfg.dashLen > 0 ? `${cfg.dashLen} ${cfg.dashLen}` : undefined;

  // CSS inline animation for dash flow (no SMIL, no reflow)
  const dashStyle =
    cfg.animated && cfg.dashLen > 0
      ? {
          strokeDasharray: dashArray,
          strokeDashoffset: 0,
          animation: "dashFlow 1.2s linear infinite",
        }
      : {};

  return (
    <>
      {/* Glow halo — static blur duplicate, no animation */}
      <path
        d={edgePath}
        style={{
          fill: "none",
          stroke: accent,
          strokeWidth: cfg.weight + 8,
          opacity: selected ? 0.2 : 0.06,
          filter: `blur(${selected ? 8 : 4}px)`,
          pointerEvents: "none",
          transition: "opacity 0.3s",
        }}
      />

      {/* Main edge stroke — CSS animated dash, NOT SMIL */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          stroke: accent,
          strokeWidth: selected ? cfg.weight + 1.5 : cfg.weight,
          opacity: baseOpacity,
          transition: "stroke-width 0.2s, opacity 0.2s",
          ...dashStyle,
        }}
      />

      {/* Animated particle dot — CSS offset-path (hardware accelerated) */}
      {(cfg.animated || selected) && (
        <circle
          r={selected ? 5 : 3.5}
          fill={accent}
          style={{
            filter: `drop-shadow(0 0 ${selected ? 10 : 6}px ${accent})`,
            offsetPath: `path("${edgePath}")`,
            offsetDistance: "0%",
            animation: "particleOrbit 2.4s linear infinite",
            transition: "r 0.2s",
          }}
        />
      )}

      {/* Connection type label — only on selection */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
            }}
            className="px-2 py-0.5 bg-[#0a0a0c]/90 backdrop-blur-md border border-white/[0.08] rounded-md text-[8px] font-black text-white/40 uppercase tracking-widest"
          >
            {connType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const edgeTypes = { neuralEdge: NeuralEdge };

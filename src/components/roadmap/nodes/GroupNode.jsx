/**
 * @fileoverview GroupNode — Transparent frame for clustering related nodes
 */
import React, { memo } from "react";
import { NodeResizer } from "reactflow";

export const GroupNode = memo(({ id, data, selected }) => {
  const color = data.color || "#f59e0b";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 300,
        minHeight: 200,
        position: "relative",
      }}
      role="group"
      aria-label={`Group: ${data.label || "Unnamed group"}`}
    >
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
        lineStyle={{
          border: `1.5px dashed ${color}`,
          opacity: selected ? 0.7 : 0.3,
        }}
        handleStyle={{
          backgroundColor: color,
          width: 10,
          height: 10,
          borderRadius: 3,
          border: "2px solid #030303",
        }}
      />
      {/* Frame backdrop */}
      <div
        className="absolute inset-0 rounded-[2rem] pointer-events-none transition-all duration-200"
        style={{
          background: `${color}04`,
          border: `1.5px dashed ${color}${selected ? "50" : "20"}`,
        }}
      />
      {/* Label */}
      <div
        className="absolute top-3.5 left-4 flex items-center gap-2 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        <span
          className="text-[9px] font-black uppercase tracking-[0.2em]"
          style={{ color: `${color}90` }}
        >
          {data.label || "Group"}
        </span>
      </div>
    </div>
  );
});
GroupNode.displayName = "GroupNode";

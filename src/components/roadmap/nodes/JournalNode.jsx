/**
 * @fileoverview JournalNode — Inline execution log entry node
 */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { BookOpen, PenLine } from "lucide-react";

export const JournalNode = memo(({ id, data, selected }) => {
  const bc = selected ? "#8b5cf6" : "#1e1e1e";
  const bs = selected
    ? "0 0 40px rgba(139,92,246,0.2), 0 20px 40px rgba(0,0,0,0.6)"
    : "0 20px 40px rgba(0,0,0,0.4)";
  return (
    <div
      className="w-[320px] bg-[#0a0a0c]/95 backdrop-blur-2xl border rounded-[1.5rem] p-5 relative transition-all duration-300"
      style={{
        borderColor: bc,
        boxShadow: bs,
        transform: selected ? "scale(1.03)" : "scale(1)",
      }}
      role="article"
      aria-label={`Journal node${data.date ? ` for ${data.date}` : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-violet-500 relative before:absolute before:-inset-6 before:content-['']"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-violet-500 relative before:absolute before:-inset-6 before:content-['']"
      />

      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
            Execution Log
          </h4>
          {data.date && (
            <p className="text-[9px] text-[#555] font-bold">
              {new Date(data.date).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {data.entry ? (
        <p className="text-xs text-[#888] leading-relaxed line-clamp-4 font-medium">
          {data.entry}
        </p>
      ) : (
        <div className="border border-dashed border-[#2a2a2a] rounded-xl p-4 text-center">
          <PenLine
            className="w-4 h-4 text-[#444] mx-auto mb-1.5"
            aria-hidden="true"
          />
          <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest">
            No entry recorded
          </p>
        </div>
      )}
      {data.mood && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest">
            State:
          </span>
          <span className="text-xs">{data.mood}</span>
        </div>
      )}
    </div>
  );
});
JournalNode.displayName = "JournalNode";

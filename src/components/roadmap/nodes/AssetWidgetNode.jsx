/**
 * @fileoverview AssetWidgetNode — Vault asset linkage proxy
 * Fixed: window.dispatchEvent → useRoadmap() context
 */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Database, Eye, Plus, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "../../ui/BentoCard";
import { useRoadmap } from "../../../contexts/RoadmapContext.jsx";

export const AssetWidgetNode = memo(({ id, data, selected }) => {
  const { openVaultModal } = useRoadmap();

  const handleAccess = (e) => {
    e.stopPropagation();
    if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    else openVaultModal(id);
  };
  const handleNew = (e) => {
    e.stopPropagation();
    openVaultModal(id, "new");
  };

  const bc = selected
    ? "#10b981"
    : data.assetId
      ? "rgba(16,185,129,0.4)"
      : "#1e1e1e";
  const bs = selected
    ? "0 0 40px rgba(16,185,129,0.25), 0 20px 40px rgba(0,0,0,0.6)"
    : data.assetId
      ? "0 0 20px rgba(16,185,129,0.1)"
      : "0 20px 40px rgba(0,0,0,0.4)";

  return (
    <div
      className="w-[270px] bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[1.5rem] p-5 relative transition-all duration-300 border"
      style={{
        borderColor: bc,
        boxShadow: bs,
        transform: selected ? "scale(1.04)" : "scale(1)",
      }}
      role="article"
      aria-label={`Asset widget: ${data.label || "No asset linked"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-emerald-500 before:absolute before:-inset-6 before:content-[''] relative"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-emerald-500 before:absolute before:-inset-6 before:content-[''] relative"
      />

      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
            data.assetId
              ? "bg-emerald-500/15 border-emerald-500/30"
              : "bg-[#111] border-[#1e1e1e]",
          )}
        >
          <Database
            className={cn(
              "w-5 h-5",
              data.assetId ? "text-emerald-400" : "text-[#555]",
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-black text-white mb-0.5 leading-tight truncate">
            {data.label || "No Asset Linked"}
          </h4>
          <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest truncate">
            {data.category || data.type || "Vault Integration"}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                data.assetId ? "bg-emerald-500" : "bg-[#333]",
              )}
            />
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                data.assetId ? "text-emerald-400" : "text-[#444]",
              )}
            >
              {data.assetId ? "LINKED" : "UNLINKED"}
            </span>
            {data.assetId && data.status === "VERIFIED" && (
              <ShieldCheck
                className="w-3 h-3 text-emerald-400"
                aria-label="Verified"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleAccess}
          aria-label={data.url ? "Open asset" : "Link asset from vault"}
          className={cn(
            "flex-1 py-2.5 border text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
            data.assetId
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-[#2a2a2a] bg-[#111] text-[#555] hover:text-white hover:border-[#444]",
          )}
        >
          <Eye className="w-3 h-3" /> Access
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleNew}
          aria-label="Upload new vault asset"
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.25)] focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:outline-none"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>
    </div>
  );
});
AssetWidgetNode.displayName = "AssetWidgetNode";

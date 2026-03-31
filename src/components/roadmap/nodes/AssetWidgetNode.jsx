/**
 * @fileoverview AssetWidgetNode — Vault asset linkage proxy with Discotive Learn validation
 */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Database,
  Eye,
  Plus,
  ShieldCheck,
  Lock,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "../../ui/BentoCard";
import { useRoadmap } from "../../../contexts/RoadmapContext.jsx";

export const AssetWidgetNode = memo(({ id, data, selected }) => {
  const { openVaultModal } = useRoadmap();

  // If node requires a specific Discotive Learn certificate
  const requiresSpecificAsset = !!data.requiredLearnId;
  const isVerifiedMatch =
    data.assetId &&
    data.status === "VERIFIED" &&
    (!requiresSpecificAsset || data.learnId === data.requiredLearnId);

  const handleAccess = (e) => {
    e.stopPropagation();
    if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    else openVaultModal(id, "sync", data.requiredLearnId);
  };

  const handleNew = (e) => {
    e.stopPropagation();
    openVaultModal(id, "new", data.requiredLearnId);
  };

  const bc = selected
    ? "#10b981"
    : isVerifiedMatch
      ? "rgba(16,185,129,0.4)"
      : data.assetId
        ? "rgba(245,158,11,0.4)" // Linked but mismatched/unverified
        : "#1e1e1e";

  const bs = selected
    ? "0 0 40px rgba(16,185,129,0.25), 0 20px 40px rgba(0,0,0,0.6)"
    : isVerifiedMatch
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
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-emerald-500 relative before:absolute before:-inset-6"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-4 !h-4 !bg-[#111] !border-2 !border-emerald-500 relative before:absolute before:-inset-6"
      />

      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
            isVerifiedMatch
              ? "bg-emerald-500/15 border-emerald-500/30"
              : "bg-[#111] border-[#1e1e1e]",
          )}
        >
          {requiresSpecificAsset && !isVerifiedMatch ? (
            <Lock className="w-5 h-5 text-amber-500" />
          ) : (
            <Database
              className={cn(
                "w-5 h-5",
                isVerifiedMatch ? "text-emerald-400" : "text-[#555]",
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-black text-white mb-0.5 leading-tight truncate">
            {data.label || "No Asset Linked"}
          </h4>
          <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest truncate">
            {requiresSpecificAsset
              ? `REQ: ${data.requiredLearnId}`
              : data.category || "Vault Integration"}
          </p>

          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isVerifiedMatch
                  ? "bg-emerald-500"
                  : data.assetId
                    ? "bg-amber-500"
                    : "bg-[#333]",
              )}
            />
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                isVerifiedMatch
                  ? "text-emerald-400"
                  : data.assetId
                    ? "text-amber-500"
                    : "text-[#444]",
              )}
            >
              {!data.assetId
                ? "UNLINKED"
                : isVerifiedMatch
                  ? "VERIFIED MATCH"
                  : "PENDING MATCH"}
            </span>
            {isVerifiedMatch && (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleAccess}
          className={cn(
            "flex-1 py-2.5 border text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none",
            data.assetId
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-[#2a2a2a] bg-[#111] text-[#555] hover:text-white hover:border-[#444]",
          )}
        >
          {data.assetId ? (
            <>
              <Eye className="w-3 h-3" /> View
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" /> Sync
            </>
          )}
        </button>
        <button
          onClick={handleNew}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>
    </div>
  );
});
AssetWidgetNode.displayName = "AssetWidgetNode";

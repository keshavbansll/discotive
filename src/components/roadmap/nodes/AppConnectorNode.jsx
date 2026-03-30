/**
 * @fileoverview AppConnectorNode — Agentic integration hub node
 *
 * Fixed vs original:
 *  - Two-letter text icons (e.g. "Li", "GH") replaced with real inline SVG paths
 *    sourced from Simple Icons (CC0 license). The SVG path for each connector
 *    lives in APP_CONNECTORS in constants.js under the `svgPath` key.
 *  - aria-label on status dot for screen readers
 *  - isConnected state properly reflected in accessible label
 */
import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { APP_CONNECTORS } from "../../../lib/roadmap/constants.js";

const ConnectorIcon = ({ svgPath, color, size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    aria-hidden="true"
    focusable="false"
  >
    <path d={svgPath} />
  </svg>
);

export const AppConnectorNode = memo(
  ({ id, data, selected, style: nodeStyle }) => {
    const cfg = APP_CONNECTORS[data.app] || APP_CONNECTORS.Custom;
    const isConnected = !!data.isConnected;

    const handleStyle = {
      background: "#111",
      border: `2px solid ${cfg.color}`,
      width: 12,
      height: 12,
      borderRadius: "50%",
    };

    return (
      <div
        style={{
          width: nodeStyle?.width ?? 220,
          minWidth: 180,
          filter: selected ? `drop-shadow(0 0 14px ${cfg.color}40)` : "none",
          transition: "filter 0.25s",
        }}
        role="article"
        aria-label={`${data.app || "Custom"} connector${isConnected ? " — connected" : " — not connected"}`}
      >
        <NodeResizer
          minWidth={180}
          minHeight={110}
          isVisible={selected}
          lineStyle={{ border: `1.5px dashed ${cfg.color}`, opacity: 0.6 }}
          handleStyle={{
            backgroundColor: cfg.color,
            width: 9,
            height: 9,
            borderRadius: "50%",
            border: "2px solid #030303",
          }}
        />

        {[Position.Left, Position.Top].map((pos) => (
          <Handle
            key={pos}
            type="target"
            position={pos}
            style={handleStyle}
            id={pos.toLowerCase()}
          />
        ))}
        {[Position.Right, Position.Bottom].map((pos) => (
          <Handle
            key={pos}
            type="source"
            position={pos}
            style={handleStyle}
            id={pos.toLowerCase()}
          />
        ))}

        <div
          className="rounded-[20px] overflow-hidden transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${cfg.bg}, rgba(5,5,8,0.97))`,
            border: `1px solid ${selected ? cfg.color : cfg.color + "40"}`,
            boxShadow: selected
              ? `0 0 0 1px ${cfg.color}60, 0 20px 40px rgba(0,0,0,0.6)`
              : "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Accent stripe */}
          <div
            style={{ height: 3, background: cfg.color, width: "100%" }}
            aria-hidden="true"
          />

          <div className="p-3.5">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2.5">
              {/* Real SVG icon badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}50`,
                }}
              >
                {cfg.svgPath ? (
                  <ConnectorIcon
                    svgPath={cfg.svgPath}
                    color={cfg.color}
                    size={18}
                  />
                ) : (
                  <span
                    className="text-[10px] font-black"
                    style={{ color: cfg.color }}
                  >
                    {(data.app || "?").slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-black truncate leading-tight"
                  style={{ color: cfg.color }}
                >
                  {data.app || "Custom"}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-[#555]">
                  {cfg.category}
                </p>
              </div>
              {/* Live status dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                title={isConnected ? "Connected" : "Not connected"}
                aria-label={isConnected ? "Connected" : "Not connected"}
                style={{
                  background: isConnected ? "#10b981" : "#2a2a2a",
                  boxShadow: isConnected
                    ? "0 0 8px rgba(16,185,129,0.7)"
                    : "none",
                }}
              />
            </div>

            {/* Action pill */}
            <div
              className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold truncate text-white/70"
              style={{
                background: `${cfg.color}0d`,
                border: `1px solid ${cfg.color}25`,
              }}
            >
              {data.action || cfg.action}
            </div>

            {/* Optional note */}
            {data.note && (
              <p className="text-[8px] text-[#444] mt-1.5 leading-relaxed line-clamp-2">
                {data.note}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);
AppConnectorNode.displayName = "AppConnectorNode";

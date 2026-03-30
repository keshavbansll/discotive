/**
 * @fileoverview RadarWidgetNode — Competency radar chart widget node
 */
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Target } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

export const RadarWidgetNode = memo(({ data, selected }) => (
  <div
    className="w-[300px] h-[300px] bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-[2rem] p-6 flex flex-col relative border transition-all duration-300"
    style={{
      borderColor: selected ? "#f59e0b" : "#1e1e1e",
      boxShadow: selected
        ? "0 0 50px rgba(245,158,11,0.3), 0 20px 40px rgba(0,0,0,0.6)"
        : "0 20px 40px rgba(0,0,0,0.4)",
      transform: selected ? "scale(1.04)" : "scale(1)",
    }}
    role="article"
    aria-label="Protocol radar matrix"
  >
    <Handle
      type="target"
      position={Position.Left}
      id="left"
      className="!w-4 !h-4 !bg-[#111] !border-2 !border-amber-500 relative before:absolute before:-inset-6 before:content-['']"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="right"
      className="!w-4 !h-4 !bg-[#111] !border-2 !border-amber-500 relative before:absolute before:-inset-6 before:content-['']"
    />

    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Target className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
        <h4 className="text-[9px] font-black text-white uppercase tracking-widest">
          Protocol Radar
        </h4>
      </div>
      <div className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase rounded border border-amber-500/20">
        PRO
      </div>
    </div>

    <div className="flex-1 -ml-2" aria-label="Radar chart" role="img">
      {data.radarData?.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data.radarData}>
            <PolarGrid stroke="rgba(245,158,11,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{
                fill: "rgba(255,255,255,0.5)",
                fontSize: 9,
                fontWeight: "bold",
              }}
            />
            <Radar
              name="Metrics"
              dataKey="val"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#f59e0b"
              fillOpacity={0.18}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-[9px] text-[#333] uppercase tracking-widest">
            No data configured
          </p>
        </div>
      )}
    </div>
  </div>
));
RadarWidgetNode.displayName = "RadarWidgetNode";

/**
 * @fileoverview Discotive Roadmap — Node Edit Panel (Desktop Sidebar)
 *
 * Fixes vs original:
 *  - Date.now() for task IDs → crypto.randomUUID()
 *  - All window.dispatchEvent patterns gone (uses props from Roadmap.jsx)
 *  - Proper aria-labels on all icon-only controls
 *  - Focus management: auto-focuses title input when panel opens
 *  - Delegate input doesn't crash on empty value
 *  - completionAll uses spread properly (no mutation)
 */

import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Type,
  Activity,
  Tag,
  Palette,
  BookOpen,
  Trash2,
  Plus,
  Check,
  Calendar as CalendarIcon,
  Zap,
  AlignLeft,
  Settings2,
  ChevronRight,
  Users,
  Link2,
  Star,
  Lock,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "../ui/BentoCard";
import { NODE_ACCENT_PALETTE, NODE_TAGS } from "../../lib/roadmap/constants.js";
import { sanitize } from "../../lib/roadmap/sanitize.js";

const TABS = [
  { id: "info", label: "Info", icon: Type },
  { id: "tasks", label: "Tasks", icon: Activity },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "color", label: "Color", icon: Palette },
  { id: "journal", label: "Journal", icon: BookOpen },
];

const MOODS = [
  "⚡ In flow",
  "🔥 On fire",
  "😤 Grinding",
  "🧊 Blocked",
  "💡 Clarity",
  "🎯 Locked in",
];
const STATUSES = ["READY", "FUTURE", "BLOCKED"];
const NODE_TYPES = ["core", "branch", "sub", "milestone"];

const fieldInput =
  "w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333] focus:outline-none transition-colors";

export const NodeEditPanel = memo(
  ({
    node,
    onUpdate,
    onDelete,
    onSubtaskToggle,
    pendingScoreDelta,
    addToast,
    userData,
    subscriptionTier,
  }) => {
    const [tab, setTab] = useState("info");
    const [delegateInput, setDelegateInput] = useState("");
    const titleRef = useRef(null);

    const accent = NODE_ACCENT_PALETTE[node.data?.accentColor || "amber"];
    const tasks = node.data?.tasks || [];
    const doneTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const isCompleted = !!node.data?.isCompleted;

    // Auto-focus title when panel first opens for a node
    useEffect(() => {
      if (titleRef.current) setTimeout(() => titleRef.current?.focus(), 60);
    }, [node.id]);

    // Reset to info tab when switching nodes
    useEffect(() => {
      setTab("info");
    }, [node.id]);

    const handleAccentFocus = (e) =>
      (e.target.style.borderColor = accent.primary);
    const handleAccentBlur = (e) => (e.target.style.borderColor = "#1e1e1e");

    const addTask = () => {
      onUpdate("tasks", [
        ...tasks,
        { id: crypto.randomUUID(), text: "", completed: false, points: 10 },
      ]);
    };

    const updateTaskText = (taskId, text) => {
      onUpdate(
        "tasks",
        tasks.map((t) =>
          t.id === taskId ? { ...t, text: sanitize(text) } : t,
        ),
      );
    };

    const removeTask = (taskId) => {
      onUpdate(
        "tasks",
        tasks.filter((t) => t.id !== taskId),
      );
    };

    const completeAll = () => {
      onUpdate(
        "tasks",
        tasks.map((t) => ({ ...t, completed: true })),
      );
      onUpdate("isCompleted", true);
      addToast?.("All tasks secured. Protocol complete.", "green");
    };

    const addDelegate = () => {
      const val = delegateInput.trim();
      if (!val) return;
      onUpdate("delegates", [...(node.data.delegates || []), val]);
      setDelegateInput("");
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-[340px] xl:w-[380px] bg-[#060606] border-l border-[#1a1a1a] flex flex-col overflow-hidden shrink-0 z-[50]"
        role="complementary"
        aria-label={`Edit panel for ${node.data?.title || "node"}`}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] bg-[#050505] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Settings2
              className="w-4 h-4 shrink-0"
              style={{ color: accent.primary }}
            />
            <span className="text-sm font-black text-white truncate">
              {node.data?.title || "Untitled"}
            </span>
          </div>
          <button
            onClick={onDelete}
            aria-label="Delete this node"
            className="w-7 h-7 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none ml-2 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        {totalTasks > 0 && (
          <div className="h-1 bg-[#1a1a1a] shrink-0">
            <div
              className="h-full transition-all duration-700 rounded-r-full"
              style={{
                width: `${Math.round((doneTasks / totalTasks) * 100)}%`,
                background: accent.primary,
              }}
            />
          </div>
        )}

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div
          className="flex border-b border-[#1a1a1a] shrink-0 overflow-x-auto"
          role="tablist"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tab-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:bg-white/[0.04]",
                  isActive
                    ? "border-current"
                    : "border-transparent text-[#444] hover:text-[#777]",
                )}
                style={
                  isActive
                    ? { color: accent.primary, borderColor: accent.primary }
                    : {}
                }
              >
                <Icon className="w-3 h-3 shrink-0" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6"
          role="tabpanel"
          id={`tab-panel-${tab}`}
          aria-label={`${tab} settings`}
        >
          {/* INFO */}
          {tab === "info" && (
            <>
              {/* Title */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Protocol Designation
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={node.data?.title || ""}
                  onChange={(e) => onUpdate("title", sanitize(e.target.value))}
                  placeholder="e.g. Secure Series A"
                  aria-label="Node title"
                  className="w-full bg-transparent text-[20px] font-black tracking-tight text-white placeholder-[#222] border-b border-[#1e1e1e] focus:outline-none pb-2 transition-colors"
                  style={{ caretColor: accent.primary }}
                  onFocus={(e) => (e.target.style.borderColor = accent.primary)}
                  onBlur={(e) => (e.target.style.borderColor = "#1e1e1e")}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Sub-Classification
                </label>
                <input
                  type="text"
                  value={node.data?.subtitle || ""}
                  onChange={(e) =>
                    onUpdate("subtitle", sanitize(e.target.value))
                  }
                  placeholder="e.g. Funding Phase"
                  aria-label="Node subtitle"
                  className={fieldInput}
                  onFocus={handleAccentFocus}
                  onBlur={handleAccentBlur}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Execution Parameters
                </label>
                <textarea
                  value={node.data?.desc || ""}
                  onChange={(e) => onUpdate("desc", sanitize(e.target.value))}
                  placeholder="Define tactical approach..."
                  rows={4}
                  aria-label="Node description"
                  className={cn(fieldInput, "resize-none")}
                  onFocus={handleAccentFocus}
                  onBlur={handleAccentBlur}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" /> Hard Deadline
                </label>
                <input
                  type="date"
                  value={node.data?.deadline || ""}
                  onChange={(e) => onUpdate("deadline", e.target.value)}
                  aria-label="Node deadline"
                  className={cn(
                    fieldInput,
                    "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-40",
                  )}
                  onFocus={handleAccentFocus}
                  onBlur={handleAccentBlur}
                />
              </div>

              {/* Priority status */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Priority Status
                </label>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Priority status"
                >
                  {STATUSES.map((s) => {
                    const active = node.data?.priorityStatus === s;
                    return (
                      <button
                        key={s}
                        role="radio"
                        aria-checked={active}
                        onClick={() => onUpdate("priorityStatus", s)}
                        className="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        style={
                          active
                            ? {
                                background: accent.bg,
                                borderColor: `${accent.primary}40`,
                                color: accent.primary,
                              }
                            : {
                                borderColor: "#1a1a1a",
                                background: "#0d0d0d",
                                color: "#444",
                              }
                        }
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Node type */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Node Type
                </label>
                <div
                  className="grid grid-cols-4 gap-1.5"
                  role="radiogroup"
                  aria-label="Node type"
                >
                  {NODE_TYPES.map((t) => {
                    const active = node.data?.nodeType === t;
                    return (
                      <button
                        key={t}
                        role="radio"
                        aria-checked={active}
                        onClick={() => onUpdate("nodeType", t)}
                        className="py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        style={
                          active
                            ? {
                                background: accent.bg,
                                borderColor: `${accent.primary}40`,
                                color: accent.primary,
                              }
                            : {
                                borderColor: "#1a1a1a",
                                background: "#0d0d0d",
                                color: "#444",
                              }
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completion toggle */}
              <div className="flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-white">Mark Complete</p>
                  <p className="text-[9px] text-[#555]">
                    Locks this protocol as executed
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={isCompleted}
                  onClick={() => onUpdate("isCompleted", !isCompleted)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none",
                    isCompleted
                      ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "bg-[#222]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                      isCompleted ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {/* Delegates */}
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Team Delegation
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={delegateInput}
                    onChange={(e) => setDelegateInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDelegate()}
                    placeholder="@username"
                    aria-label="Add delegate"
                    className={cn(fieldInput, "flex-1")}
                    onFocus={handleAccentFocus}
                    onBlur={handleAccentBlur}
                  />
                  <button
                    onClick={addDelegate}
                    aria-label="Add delegate"
                    className="px-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  >
                    Add
                  </button>
                </div>
                {(node.data?.delegates || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {node.data.delegates.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-full text-[9px] text-[#888]"
                      >
                        {d}
                        <button
                          onClick={() =>
                            onUpdate(
                              "delegates",
                              node.data.delegates.filter((_, j) => j !== i),
                            )
                          }
                          aria-label={`Remove ${d}`}
                          className="hover:text-rose-400 transition-colors ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TASKS */}
          {tab === "tasks" && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold text-[#444] uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Sub-Routines
                  <span className="ml-1 text-[#555]">
                    ({doneTasks}/{totalTasks})
                  </span>
                </label>
                <button
                  onClick={completeAll}
                  disabled={isCompleted}
                  aria-label="Mark all tasks complete"
                  className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-25 transition-colors border bg-emerald-500/8 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  Complete All
                </button>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-[#0d0d0d] border border-[#1a1a1a] p-3.5 rounded-xl group hover:border-[#2a2a2a] transition-all"
                  >
                    <button
                      onClick={() => onSubtaskToggle(task.id)}
                      aria-label={
                        task.completed ? "Mark incomplete" : "Mark complete"
                      }
                      role="checkbox"
                      aria-checked={task.completed}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      style={{
                        background: task.completed ? accent.bg : "transparent",
                        borderColor: task.completed
                          ? accent.primary
                          : "#2a2a2a",
                      }}
                    >
                      {task.completed && (
                        <Check
                          className="w-3 h-3"
                          style={{ color: accent.primary }}
                        />
                      )}
                    </button>
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => updateTaskText(task.id, e.target.value)}
                      aria-label="Task text"
                      placeholder="Define sub-routine…"
                      className={cn(
                        "flex-1 bg-transparent border-none outline-none text-sm transition-colors",
                        task.completed
                          ? "text-[#444] line-through"
                          : "text-white",
                      )}
                    />
                    <span className="text-[8px] font-black text-amber-500/40 flex items-center gap-0.5 shrink-0">
                      <Zap className="w-2 h-2" />
                      {task.points || 10}
                    </span>
                    <button
                      onClick={() => removeTask(task.id)}
                      aria-label="Remove task"
                      className="opacity-0 group-hover:opacity-100 text-[#444] hover:text-rose-500 transition-all focus-visible:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addTask}
                className="w-full py-3 border border-dashed border-[#1e1e1e] rounded-xl text-[#555] text-xs font-bold uppercase tracking-widest hover:border-[#333] hover:text-white transition-all flex items-center justify-center gap-2 bg-[#0d0d0d] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sub-Routine
              </button>
            </>
          )}

          {/* TAGS */}
          {tab === "tags" && (
            <>
              <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest">
                Taxonomy Classification
              </p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Node tags"
              >
                {NODE_TAGS.map((tag) => {
                  const active = (node.data?.tags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      role="checkbox"
                      aria-checked={active}
                      onClick={() => {
                        const curr = node.data?.tags || [];
                        onUpdate(
                          "tags",
                          active
                            ? curr.filter((t) => t !== tag)
                            : [...curr, tag],
                        );
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                      style={
                        active
                          ? {
                              background: accent.bg,
                              borderColor: `${accent.primary}40`,
                              color: accent.primary,
                            }
                          : {
                              background: "#0d0d0d",
                              borderColor: "#1a1a1a",
                              color: "#555",
                            }
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* COLOR */}
          {tab === "color" && (
            <>
              <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest">
                Node Accent Theme
              </p>
              <div
                className="grid grid-cols-4 gap-3"
                role="radiogroup"
                aria-label="Accent color"
              >
                {Object.entries(NODE_ACCENT_PALETTE).map(([key, val]) => {
                  const isActive = node.data?.accentColor === key;
                  return (
                    <button
                      key={key}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => onUpdate("accentColor", key)}
                      className="relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all p-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      style={{
                        background: val.bg,
                        borderColor: isActive ? val.primary : "transparent",
                        boxShadow: isActive ? `0 0 20px ${val.glow}` : "none",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ background: val.primary }}
                      />
                      <span
                        className="text-[8px] font-black uppercase tracking-widest"
                        style={{ color: val.primary }}
                      >
                        {key}
                      </span>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* JOURNAL */}
          {tab === "journal" && (
            <>
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Execution Reality Log
                </label>
                <textarea
                  value={node.data?.journalEntry || ""}
                  onChange={(e) =>
                    onUpdate("journalEntry", sanitize(e.target.value))
                  }
                  placeholder="Document your execution reality. What happened? What blocked you? What did you learn?"
                  rows={7}
                  aria-label="Journal entry"
                  className={cn(fieldInput, "resize-none custom-scrollbar")}
                  onFocus={(e) => (e.target.style.borderColor = "#8b5cf6")}
                  onBlur={(e) => (e.target.style.borderColor = "#1e1e1e")}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">
                  Execution State
                </label>
                <div
                  className="flex gap-2 flex-wrap"
                  role="radiogroup"
                  aria-label="Execution mood"
                >
                  {MOODS.map((mood) => (
                    <button
                      key={mood}
                      role="radio"
                      aria-checked={node.data?.mood === mood}
                      onClick={() =>
                        onUpdate("mood", node.data?.mood === mood ? "" : mood)
                      }
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none",
                        node.data?.mood === mood
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                          : "bg-[#0d0d0d] border-[#1a1a1a] text-[#666] hover:text-white",
                      )}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[9px] text-[#333]">
                Entries are saved with the node on cloud sync.
              </p>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="border-t border-[#1a1a1a] p-5 space-y-3 shrink-0 bg-[#050505]">
          {pendingScoreDelta !== 0 && (
            <div
              className={cn(
                "px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border",
                pendingScoreDelta > 0
                  ? "bg-emerald-500/6 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/6 text-rose-400 border-rose-500/20",
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              {pendingScoreDelta > 0 ? "+" : ""}
              {pendingScoreDelta} pts pending cloud save
            </div>
          )}
          <button
            onClick={onDelete}
            aria-label="Delete node permanently"
            className="w-full py-3 bg-rose-500/6 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500/12 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Protocol
          </button>
        </div>
      </motion.div>
    );
  },
);

NodeEditPanel.displayName = "NodeEditPanel";

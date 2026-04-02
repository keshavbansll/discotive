/**
 * @fileoverview gemini.js v3 — Roadmap generation with 30-day scope,
 * expansion (continuation), and regeneration support.
 *
 * NEW EXPORTS:
 *   generateExpansionQuestions  — 2-3 MCQ + 1 text for continuation flow
 *   expandExecutionMap          — generates N continuation nodes from expansion answers
 *   regenerateExecutionMap      — full regen with preserved nodes + specific instructions
 *   generateCalibrationQuestions — (unchanged)
 *   generateExecutionMap         — (updated with 30-day scope + node cap)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMapLimits } from "./roadmap/constants.js";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── Shared JSON parser (robust) ─────────────────────────────────────────────
const extractJSON = (text) => {
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!match) throw new Error("AI returned no parseable JSON.");
  return JSON.parse(match[0]);
};

// ─── Date formatter ───────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CALIBRATION QUESTIONS (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const generateCalibrationQuestions = async (userData) => {
  try {
    const prompt = `
SYSTEM: You are an elite Agentic Workflow Architect building a career execution map.

OPERATOR CONTEXT:
- Domain: ${userData?.vision?.passion || userData?.identity?.domain || "General"}
- Niche: ${userData?.vision?.niche || userData?.identity?.niche || "Career Growth"}
- Skills: ${JSON.stringify(userData?.skills?.alignedSkills || [])}
- Goal: ${userData?.vision?.goal3Months || "Not specified"}

Generate EXACTLY 3 calibration questions to personalise their 30-day execution map.
Q1 (text): Ask for their single most important 30-day target — very specific and measurable.
Q2 (mcq):  Ask what their biggest blocker is right now (4 specific options).
Q3 (mcq):  Ask their current execution style (4 options).

RETURN ONLY a JSON array. No markdown, no preamble.
Format: [{"id":"q1","type":"text","question":"..."},{"id":"q2","type":"mcq","question":"...","options":["A","B","C","D"]}]
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("[Gemini] Calibration questions failed:", err);
    throw new Error("Calibration failed.");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GENERATE EXECUTION MAP — 30-day scoped, capped at tier limit
// ═══════════════════════════════════════════════════════════════════════════════

export const generateExecutionMap = async (
  userData,
  qaAnswers,
  subscriptionTier = "free",
  learnInventory = { videos: [], certificates: [] },
  mapRange = null, // { from: ISO, to: ISO }
) => {
  const limits = getMapLimits(subscriptionTier);
  const maxNodes = limits.auto_nodes;

  const rangeStr = mapRange
    ? `${fmtDate(mapRange.from)} → ${fmtDate(mapRange.to)}`
    : "Next 30 days";

  try {
    const prompt = `
SYSTEM: You are a Graph Database Compiler for the Discotive Career Engine.
Output a visual execution DAG (Directed Acyclic Graph) for exactly the period: ${rangeStr}.

STRICT RULES:
1. Generate EXACTLY ${Math.floor(maxNodes * 0.7)}–${maxNodes} execution/milestone nodes total.
2. ALL deadlines MUST fall within: ${rangeStr}. No exceptions.
3. ZERO floating nodes — every node must be connected.
4. Chronological spine: core nodes = sequential milestones across the 30 days.
5. Each node's deadline must be a specific date within the range.

OPERATOR CONTEXT:
Domain:  ${userData?.vision?.passion || userData?.identity?.domain || "General"}
Niche:   ${userData?.vision?.niche || userData?.identity?.niche || "General"}
Skills:  ${JSON.stringify((userData?.skills?.alignedSkills || []).slice(0, 8))}
Goal30d: ${qaAnswers?.[0] || userData?.vision?.goal3Months || "Not specified"}
Blocker: ${qaAnswers?.[1] || "Not specified"}
Style:   ${qaAnswers?.[2] || "Not specified"}

DISCOTIVE LEARN INVENTORY (use these EXACT IDs — do NOT invent):
Videos:       ${JSON.stringify(learnInventory.videos.slice(0, 6))}
Certificates: ${JSON.stringify(learnInventory.certificates.slice(0, 6))}

NODE TYPES ALLOWED (executionNode, milestoneNode ONLY — no assetWidget or videoWidget in the auto-generation):
executionNode: {
  id, type:"executionNode", position:{x,y},
  data: {
    title, subtitle, desc, deadline (ISO in range),
    priorityStatus:"READY"|"FUTURE",
    nodeType:"core"|"branch"|"milestone",
    accentColor:"amber"|"emerald"|"violet"|"sky"|"rose"|"orange",
    tags:[], tasks:[{id,text,completed:false,points:10}], isCompleted:false,
    linkedAssets:[], delegates:[], collapsed:false
  }
}
milestoneNode: {
  id, type:"milestoneNode", position:{x,y},
  data:{ title, subtitle, xpReward:50, isUnlocked:false }
}

ALSO RETURN edges: [{ id, source, target, type:"neuralEdge", data:{connType:"core-core"|"core-branch"|"branch-sub"} }]

RETURN FORMAT (raw JSON only, no markdown):
{ "nodes": [...], "edges": [...] }
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const parsed = extractJSON(result.response.text());

    // Normalise: handle both array and {nodes,edges} shapes
    if (Array.isArray(parsed)) {
      return { nodes: parsed, edges: [] };
    }
    return {
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
    };
  } catch (err) {
    console.error("[Gemini] Map generation failed:", err);
    throw new Error("Execution Map Synthesis failed.");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EXPANSION QUESTIONS — 2-3 MCQ + 1 text for the continuation flow
// ═══════════════════════════════════════════════════════════════════════════════

export const generateExpansionQuestions = async (
  userData,
  existingNodes = [],
) => {
  try {
    // Summarise existing map for context
    const completedTitles = existingNodes
      .filter((n) => n.data?.isCompleted)
      .map((n) => n.data?.title)
      .filter(Boolean)
      .slice(0, 5);

    const pendingTitles = existingNodes
      .filter((n) => !n.data?.isCompleted && n.type === "executionNode")
      .map((n) => n.data?.title)
      .filter(Boolean)
      .slice(0, 5);

    const prompt = `
SYSTEM: You are a career coach extending an operator's 30-day execution map.

OPERATOR CONTEXT:
Domain:    ${userData?.vision?.passion || userData?.identity?.domain || "General"}
Niche:     ${userData?.vision?.niche || userData?.identity?.niche || "General"}
Completed: ${completedTitles.join(", ") || "Nothing yet"}
Pending:   ${pendingTitles.join(", ") || "None"}

Generate EXACTLY 3 questions for expanding their map with the next set of nodes.
Q1 (mcq): What should the next phase focus on? (4 specific options based on their domain)
Q2 (mcq): What's the biggest challenge going into the next phase? (4 options)
Q3 (text): What specific outcome do you want from the next batch of nodes?

RETURN ONLY a JSON array. No markdown, no preamble.
Format: [{"id":"eq1","type":"mcq","question":"...","options":["A","B","C","D"]},{"id":"eq3","type":"text","question":"..."}]
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("[Gemini] Expansion questions failed:", err);
    throw new Error("Expansion question generation failed.");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EXPAND EXECUTION MAP — generates continuation nodes
// ═══════════════════════════════════════════════════════════════════════════════

export const expandExecutionMap = async ({
  userData,
  expansionAnswers,
  existingNodes = [],
  existingEdges = [],
  subscriptionTier = "free",
  expansionRange, // { from: ISO, to: ISO } — the NEXT 30 days
  lastNodeId, // ID of the node the expand trigger is attached to
}) => {
  const limits = getMapLimits(subscriptionTier);
  const maxNew = Math.floor(limits.auto_nodes * 0.5); // expand adds ~50% of base cap
  const rangeStr = expansionRange
    ? `${fmtDate(expansionRange.from)} → ${fmtDate(expansionRange.to)}`
    : "Next 30 days";

  // Context from existing map
  const existingSummary = existingNodes
    .filter((n) => n.type === "executionNode" || n.type === "milestoneNode")
    .map(
      (n) =>
        `${n.data?.title || "?"} (${n.data?.isCompleted ? "done" : "pending"})`,
    )
    .join(", ");

  try {
    const prompt = `
SYSTEM: You are extending an existing execution map DAG with continuation nodes.
The operator has already completed some milestones. Add ONLY the next phase.

PERIOD FOR NEW NODES: ${rangeStr}
ALL new node deadlines MUST be within this range.

EXISTING MAP SUMMARY: ${existingSummary || "None"}
LAST NODE ID TO CONNECT FROM: ${lastNodeId}

EXPANSION CONTEXT:
Next focus: ${expansionAnswers?.[0] || "Not specified"}
Challenge:  ${expansionAnswers?.[1] || "Not specified"}
Target:     ${expansionAnswers?.[2] || "Not specified"}

OPERATOR CONTEXT:
Domain: ${userData?.vision?.passion || userData?.identity?.domain || "General"}
Niche:  ${userData?.vision?.niche || userData?.identity?.niche || "General"}

Generate EXACTLY ${Math.floor(maxNew * 0.7)}–${maxNew} new executionNode or milestoneNode nodes.
The FIRST new node MUST connect FROM: ${lastNodeId}.
Do NOT regenerate or modify existing nodes. Only add new ones.
Use the same node schema as before. Include edges connecting the new nodes to each other
AND an edge from ${lastNodeId} to the first new node.

RETURN: { "nodes": [...new nodes only], "edges": [...edges for new nodes + connection from lastNodeId] }
RETURN FORMAT: raw JSON only, no markdown.
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const parsed = extractJSON(result.response.text());
    return Array.isArray(parsed)
      ? { nodes: parsed, edges: [] }
      : { nodes: parsed.nodes || [], edges: parsed.edges || [] };
  } catch (err) {
    console.error("[Gemini] Map expansion failed:", err);
    throw new Error("Map expansion failed.");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. REGENERATE EXECUTION MAP — rebuild with preserved nodes + instructions
// ═══════════════════════════════════════════════════════════════════════════════

export const regenerateExecutionMap = async ({
  userData,
  calibrationAnswers, // saved or freshly-collected { 0: "...", 1: "...", 2: "..." }
  specificInstruction, // string from the final text question
  preservedNodes = [], // nodes that MUST be carried over unchanged
  preservedEdges = [], // edges connecting preserved nodes (kept as-is)
  subscriptionTier = "free",
  mapRange, // { from: ISO, to: ISO } for the new map
  learnInventory = { videos: [], certificates: [] },
}) => {
  const limits = getMapLimits(subscriptionTier);
  const maxNodes = limits.auto_nodes;
  const rangeStr = mapRange
    ? `${fmtDate(mapRange.from)} → ${fmtDate(mapRange.to)}`
    : "Next 30 days";

  // Preserved context
  const preservedSummary = preservedNodes
    .map((n) => `"${n.data?.title || "?"}" (ID: ${n.id}, type: ${n.type})`)
    .join("\n");

  const preservedIds = preservedNodes.map((n) => n.id).join(", ");

  try {
    const prompt = `
SYSTEM: You are regenerating a Discotive execution map DAG for the period: ${rangeStr}.

STRICT RULES:
1. Do NOT include or modify these PRESERVED nodes (they are carried over automatically):
   ${preservedSummary || "None"}
2. Generate ${Math.floor(maxNodes * 0.7)}–${maxNodes} NEW nodes (excluding the preserved ones).
3. ALL new node deadlines MUST be within: ${rangeStr}.
4. Connect your new nodes to the preserved nodes where logical.
5. Do NOT use these IDs (they belong to preserved nodes): ${preservedIds || "none"}

OPERATOR CONTEXT:
Domain:  ${userData?.vision?.passion || userData?.identity?.domain || "General"}
Niche:   ${userData?.vision?.niche || userData?.identity?.niche || "General"}
Skills:  ${JSON.stringify((userData?.skills?.alignedSkills || []).slice(0, 8))}
Goal:    ${calibrationAnswers?.[0] || "Not specified"}
Blocker: ${calibrationAnswers?.[1] || "Not specified"}
Style:   ${calibrationAnswers?.[2] || "Not specified"}
Specific instruction: ${specificInstruction || "None"}

DISCOTIVE LEARN INVENTORY:
Videos:       ${JSON.stringify(learnInventory.videos.slice(0, 6))}
Certificates: ${JSON.stringify(learnInventory.certificates.slice(0, 6))}

Use the same executionNode / milestoneNode schema as before.
Include edges: connection from preserved nodes to new nodes where appropriate.

RETURN: { "nodes": [...NEW nodes only, NOT preserved ones], "edges": [...edges for new nodes + edges connecting to preserved IDs] }
RETURN FORMAT: raw JSON only, no markdown.
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const parsed = extractJSON(result.response.text());
    const { nodes: newNodes = [], edges: newEdges = [] } = Array.isArray(parsed)
      ? { nodes: parsed, edges: [] }
      : parsed;

    // Merge: preserved nodes come first, then new nodes
    return {
      nodes: [...preservedNodes, ...newNodes],
      edges: [...preservedEdges, ...newEdges],
    };
  } catch (err) {
    console.error("[Gemini] Map regeneration failed:", err);
    throw new Error("Map regeneration failed.");
  }
};

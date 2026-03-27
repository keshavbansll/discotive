import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateCalibrationQuestions = async (userData) => {
  try {
    const prompt = `
      SYSTEM DIRECTIVE: Act as an elite Agentic Workflow Architect.
      OPERATOR CONTEXT:
      - Domain: ${userData?.vision?.passion || "General"}
      - Niche: ${userData?.vision?.niche || "Career Growth"}
      - Baseline: ${userData?.baseline || "Starting out"}
      - Location: ${userData?.footprint?.location || "Global"}
      - Skills: ${JSON.stringify(userData?.skills?.alignedSkills || [])}
      
      Generate 3 highly probing, personalized calibration questions to map their neural execution graph.
      DO NOT ask generic questions. Use their specific niche and skills.
      - Q1 (text): Ask for a highly specific, measurable 90-day objective.
      - Q2 (mcq): Ask to identify their most critical operational bottleneck (4 hyper-specific options).
      - Q3 (mcq): Ask about their resource allocation (time/capital) strategy (4 options).

      Return ONLY a JSON array: [{"id": "q1", "type": "text", "question": "..."}, {"id": "q2", "type": "mcq", "question": "...", "options": ["A","B"]}]
    `;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    throw new Error("Calibration failed.");
  }
};

export const generateExecutionMap = async (
  userData,
  qaAnswers,
  subscriptionTier,
) => {
  try {
    const isPro = subscriptionTier.toLowerCase() === "pro";
    const minExecutionNodes = isPro ? 30 : 15;
    const maxExecutionNodes = isPro ? 45 : 20;

    const prompt = `
      SYSTEM DIRECTIVE: Act as a Graph Database Compiler for an Agentic AI Career Engine.
      You output a visual execution DAG (Directed Acyclic Graph) — NO cycles, NO bidirectional edges.

      OPERATOR CONTEXT:
        Domain: ${userData?.vision?.passion || "General"}
        Niche:  ${userData?.vision?.niche || "General"}
        Skills: ${JSON.stringify(userData?.skills?.alignedSkills || []).slice(0, 200)}

      CALIBRATION DATA: ${JSON.stringify(qaAnswers)}

      ═══════════════════════════════════════════════════════════
      TOPOLOGY RULES (MANDATORY — VIOLATING THESE BREAKS THE UI)
      ═══════════════════════════════════════════════════════════
      1. Generate EXACTLY ${minExecutionNodes}–${maxExecutionNodes} "core" + "branch" nodes total.
      2. ZERO floating nodes. Every node must have at least 1 incoming OR outgoing edge.
      3. TREE STRUCTURE: Each core branches into 2–4 branch nodes max. 
         Branches may have 1–2 children. Do NOT create a mesh or ring topology.
      4. CHRONOLOGICAL SPINE: Core nodes represent sequential milestones (n1→n2→n3).
         Branch nodes represent parallel tasks hanging off a core.
      5. BALANCE: No layer should have more than 5 nodes. Spread depth over breadth.
      6. CONNECTOR NODES: For each core node that requires an external platform
         (e.g. posting to LinkedIn, submitting to GitHub, watching Coursera), add ONE
         connectorNode child. Choose app from:
         [LinkedIn, GitHub, YouTube, Unstop, LeetCode, HackerRank, Figma, Notion, Coursera, Gmail, Behance, Dribbble, ProductHunt, Medium]
      ${isPro ? `7. Add exactly 1 "radarWidget" connected to the FIRST core node only.` : ""}

      ═══════════════════════════════════════════════════════════
      NODE TYPES
      ═══════════════════════════════════════════════════════════
      - "core"          → Main spine milestone. Title = specific career goal.
      - "branch"        → Parallel task. Hangs off a core via sourceHandle "bottom"→targetHandle "top"
                          OR off another branch via "right"→"left" for horizontal flow.
      - "assetWidget"   → Document/proof placeholder. 2–3 total. Only where a document is needed.
      - "videoWidget"   → Learning resource. 1–2 total. Only for research-heavy nodes.
      - "connectorNode" → External app integration. Use app field from the list above.
      ${isPro ? `- "radarWidget"   → Skills radar. Exactly 1, attached to first core node.` : ""}

      ═══════════════════════════════════════════════════════════
      EDGE HANDLE CONVENTION
      ═══════════════════════════════════════════════════════════
      - Core→Core (sequential):    sourceHandle:"right", targetHandle:"left",  connType:"core-core"
      - Core→Branch (decompose):   sourceHandle:"bottom", targetHandle:"top",  connType:"core-branch"
      - Branch→Branch (sub-task):  sourceHandle:"right", targetHandle:"left",  connType:"branch-sub"
      - Any→Widget (attachment):   sourceHandle:"bottom", targetHandle:"top",  connType:"branch-sub"
      - Any→Connector (platform):  sourceHandle:"bottom", targetHandle:"top",  connType:"branch-sub"

      ═══════════════════════════════════════════════════════════
      OUTPUT FORMAT — RETURN ONLY RAW JSON. NO MARKDOWN. NO EXPLANATIONS.
      ═══════════════════════════════════════════════════════════
      {
        "nodes": [
          { "id":"n1", "type":"core",          "title":"...", "subtitle":"...", "desc":"...", "deadline_offset_days":14, "tasks":["Task 1","Task 2","Task 3"] },
          { "id":"n2", "type":"branch",         "title":"...", "subtitle":"...", "desc":"...", "deadline_offset_days":21, "tasks":["Task 1"] },
          { "id":"n3", "type":"assetWidget",    "label":"Resume v2", "assetType":"Document" },
          { "id":"n4", "type":"videoWidget",    "title":"Learn X", "platform":"YouTube" },
          { "id":"n5", "type":"connectorNode",  "app":"LinkedIn" }
        ],
        "edges": [
          { "source":"n1", "target":"n2", "sourceHandle":"bottom", "targetHandle":"top", "connType":"core-branch" },
          { "source":"n2", "target":"n3", "sourceHandle":"bottom", "targetHandle":"top", "connType":"branch-sub"  },
          { "source":"n2", "target":"n5", "sourceHandle":"bottom", "targetHandle":"top", "connType":"branch-sub"  }
        ]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const cleanJson = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    throw new Error("Synthesis failed.");
  }
};

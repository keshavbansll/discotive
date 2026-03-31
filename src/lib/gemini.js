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
  learnInventory = { videos: [], certificates: [] },
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

      DISCOTIVE LEARN INVENTORY (STRICT USAGE):
      Videos: ${JSON.stringify(learnInventory.videos)}
      Certificates: ${JSON.stringify(learnInventory.certificates)}

      ═══════════════════════════════════════════════════════════
      TOPOLOGY RULES (MANDATORY — VIOLATING THESE BREAKS THE UI)
      ═══════════════════════════════════════════════════════════
      1. Generate EXACTLY ${minExecutionNodes}–${maxExecutionNodes} "core" + "branch" nodes total.
      2. ZERO floating nodes. Every node must have at least 1 incoming OR outgoing edge.
      3. TREE STRUCTURE: Each core branches into 2–4 branch nodes max. 
      4. CHRONOLOGICAL SPINE: Core nodes represent sequential milestones (n1→n2→n3).
      5. CONNECTOR NODES: For external platforms, attach ONE connectorNode child.
      6. DISCOTIVE LEARN ATTACHMENTS (CRITICAL):
         - If a task requires learning a concept, you MUST attach a "videoWidget" and use a "learnId" and "youtubeId" from the provided Videos inventory.
         - If a task requires proving a skill, you MUST attach an "assetWidget" and set "requiredLearnId" from the Certificates inventory. DO NOT makeup IDs. If no matching inventory exists, use generic assetWidget without requiredLearnId.

      ═══════════════════════════════════════════════════════════
      NODE TYPES
      ═══════════════════════════════════════════════════════════
      - "core"          → Main spine milestone.
      - "branch"        → Parallel task.
      - "assetWidget"   → Document/proof. Format: { "id":"...", "type":"assetWidget", "label":"...", "requiredLearnId":"discotive_certificate_XXXXXX" }
      - "videoWidget"   → Learning resource. Format: { "id":"...", "type":"videoWidget", "title":"...", "youtubeId":"...", "learnId":"discotive_video_XXXXXX", "baseScore": 10 }
      - "connectorNode" → External app integration.
      ${isPro ? `- "radarWidget"   → Skills radar. Exactly 1, attached to first core.` : ""}

      OUTPUT FORMAT — RETURN ONLY RAW JSON. NO MARKDOWN.
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

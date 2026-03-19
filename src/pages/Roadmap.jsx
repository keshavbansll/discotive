import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Edit3,
  List,
  Hash,
  ShieldCheck,
  Activity,
  X,
  AlignLeft,
  Maximize,
  Minimize,
  CheckCircle2,
  Circle,
  Cloud,
  CloudOff,
  RefreshCw,
  GitBranch,
  Trash2,
  Target,
  Settings2,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { useUserData } from "../hooks/useUserData";
import { cn } from "../components/ui/BentoCard";

// ============================================================================
// 1. CUSTOM EXECUTION NODE (With Dynamic Priority Styling)
// ============================================================================
const ExecutionNode = ({ data, selected }) => {
  const progress = Number(data.progress) || 0;
  const isComplete = progress === 100;
  const isBranch = data.nodeType === "branch";
  const priorityStatus = data.priorityStatus || "FUTURE";

  // Dynamic visual hierarchy based on graph algorithm
  let containerClass = "border-[#222] bg-[#0a0a0a]";
  let glow = "";

  if (priorityStatus === "COMPLETED") {
    containerClass = "border-green-500/30 bg-[#050a05] opacity-80";
  } else if (priorityStatus === "READY") {
    containerClass = "border-amber-500/80 bg-[#111]";
    glow = "shadow-[0_0_40px_rgba(245,158,11,0.15)]";
  } else if (priorityStatus === "NEXT") {
    containerClass = "border-[#444] bg-[#0a0a0a]";
  } else if (priorityStatus === "FUTURE") {
    containerClass = "border-[#111] bg-[#050505] opacity-40 hover:opacity-80";
  }

  if (selected)
    glow = "shadow-[0_0_30px_rgba(255,255,255,0.2)] border-white/50";

  const barColor = isComplete ? "bg-[#052e16]" : "bg-[#450a0a]";
  const barFill = isComplete ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={cn(
        "w-[320px] rounded-[24px] p-6 relative z-10 transition-all duration-500 border",
        containerClass,
        glow,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-5 h-5 bg-[#333] border-[3px] border-[#0a0a0a] hover:bg-white hover:scale-125 transition-all -ml-2.5"
      />

      <div className="flex justify-between items-start mb-4 pointer-events-none">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            {isBranch ? "Sub-Branch" : "Core Milestone"}
            {priorityStatus === "READY" && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </span>
        </div>
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle
            className={cn(
              "w-5 h-5",
              priorityStatus === "READY" ? "text-amber-500" : "text-[#444]",
            )}
          />
        )}
      </div>

      <h3 className="text-xl font-extrabold tracking-tight text-white mb-1 pointer-events-none">
        {data.title || "Untitled Milestone"}
      </h3>
      {data.subtitle && (
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest mb-3 pointer-events-none",
            priorityStatus === "READY" ? "text-amber-500" : "text-[#666]",
          )}
        >
          {data.subtitle}
        </p>
      )}

      <p className="text-[#888] text-sm leading-relaxed mb-6 pointer-events-none line-clamp-2">
        {data.desc || "No parameters defined."}
      </p>

      <div className="flex items-end justify-between pt-4 border-t border-[#222]">
        <div className="pointer-events-none">
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1">
            Target
          </p>
          <p className="text-xs font-mono text-white">
            {data.deadline || "TBD"}
          </p>
        </div>
        <p className="text-[10px] font-mono text-[#666]">{progress}%</p>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-6 right-6 h-[3px] rounded-t-lg overflow-hidden translate-y-[1px] pointer-events-none",
          barColor,
        )}
      >
        <div
          className={cn("h-full transition-all duration-500", barFill)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-5 h-5 bg-[#333] border-[3px] border-[#0a0a0a] hover:bg-white hover:scale-125 transition-all -mr-2.5"
      />
    </div>
  );
};

const nodeTypes = { executionNode: ExecutionNode };

// ============================================================================
// 2. THE CANVAS ENGINE
// ============================================================================
const CanvasEngine = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  isSaving,
  handleCloudSave,
  isMapFullscreen,
  setIsMapFullscreen,
  setActiveEditNodeId,
}) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [paneContextMenu, setPaneContextMenu] = useState(null);
  const [nodeContextMenu, setNodeContextMenu] = useState(null);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setHasUnsavedChanges(true);
    },
    [setNodes, setHasUnsavedChanges],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges, setHasUnsavedChanges],
  );

  const onConnect = useCallback(
    (params) => {
      const animatedEdge = {
        ...params,
        animated: true,
        style: { stroke: "#888", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(animatedEdge, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges, setHasUnsavedChanges],
  );

  // --- INTERACTIONS ---
  const onNodeClick = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveEditNodeId(node.id);
    },
    [setActiveEditNodeId],
  );

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setNodeContextMenu(null);
    setPaneContextMenu({ top: event.clientY, left: event.clientX });
  }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setPaneContextMenu(null);
    setNodeContextMenu({ top: event.clientY, left: event.clientX, node });
  }, []);

  const closeMenus = useCallback(() => {
    setPaneContextMenu(null);
    setNodeContextMenu(null);
  }, []);

  const addNode = (type) => {
    if (!paneContextMenu) return;
    const position = screenToFlowPosition({
      x: paneContextMenu.left,
      y: paneContextMenu.top,
    });
    const newNode = {
      id: `node_${Date.now()}`,
      type: "executionNode",
      position,
      data: {
        title: type === "core" ? "New Milestone" : "Sub-Task",
        subtitle: "",
        desc: "Define execution parameters...",
        deadline: "",
        progress: 0,
        nodeType: type,
        priorityStatus: "FUTURE",
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
    closeMenus();
  };

  const deleteNode = () => {
    if (!nodeContextMenu) return;
    setNodes((nds) => nds.filter((n) => n.id !== nodeContextMenu.node.id));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== nodeContextMenu.node.id &&
          e.target !== nodeContextMenu.node.id,
      ),
    );
    setHasUnsavedChanges(true);
    closeMenus();
  };

  return (
    <div
      className={cn(
        "relative transition-all duration-500 overflow-hidden",
        isMapFullscreen
          ? "fixed inset-0 z-50 bg-[#030303]"
          : "w-full h-[700px] border-y border-[#111]",
      )}
    >
      <div className="absolute top-6 left-6 z-40 flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#222] p-2 rounded-full shadow-2xl">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#666] ml-2 mr-2">
          {isSaving ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />{" "}
              Committing...
            </>
          ) : hasUnsavedChanges ? (
            <>
              <CloudOff className="w-3 h-3 text-amber-500" /> Unsaved Draft
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3 text-green-500" /> Synced to Chain
            </>
          )}
        </div>
        <button
          onClick={handleCloudSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="bg-white text-black px-5 py-2 rounded-full font-bold text-xs hover:bg-[#ccc] transition-colors disabled:opacity-50"
        >
          Save to Cloud
        </button>
      </div>

      <div className="absolute top-6 right-6 z-40 flex gap-2">
        <button
          onClick={() => fitView({ duration: 800, padding: 0.2 })}
          className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#222] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors shadow-2xl"
          title="Auto-Center Map"
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsMapFullscreen(!isMapFullscreen)}
          className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#222] rounded-full flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors shadow-2xl"
          title="Fullscreen"
        >
          {isMapFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onNodeClick={onNodeClick}
        onPaneClick={closeMenus}
        fitView
        className="bg-[#030303]"
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#222" gap={24} size={2} />
        <Controls
          showInteractive={false}
          className="!bg-transparent !border-none shadow-2xl [&_.react-flow__controls-button]:bg-[#0a0a0a] [&_.react-flow__controls-button]:border-[#222] [&_.react-flow__controls-button]:fill-[#888] hover:[&_.react-flow__controls-button]:fill-white hover:[&_.react-flow__controls-button]:bg-[#222] [&_.react-flow__controls-button]:transition-colors overflow-hidden rounded-xl border border-[#222]"
        />
      </ReactFlow>

      <AnimatePresence>
        {paneContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: paneContextMenu.top, left: paneContextMenu.left }}
            className="fixed z-50 bg-[#0a0a0a] border border-[#222] rounded-xl shadow-2xl overflow-hidden min-w-[220px]"
          >
            <button
              onClick={() => addNode("core")}
              className="w-full px-4 py-3 text-left text-sm font-bold text-white hover:bg-[#111] flex items-center gap-3 transition-colors"
            >
              <Target className="w-4 h-4 text-[#888]" /> Deploy Core Milestone
            </button>
            <button
              onClick={() => addNode("branch")}
              className="w-full px-4 py-3 text-left text-sm font-bold text-white hover:bg-[#111] flex items-center gap-3 transition-colors border-t border-[#111]"
            >
              <GitBranch className="w-4 h-4 text-[#888]" /> Deploy Sub-Branch
            </button>
            <button
              onClick={closeMenus}
              className="w-full px-4 py-3 text-left text-sm font-bold text-slate-500 hover:bg-[#111] flex items-center gap-3 transition-colors border-t border-[#222]"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nodeContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: nodeContextMenu.top, left: nodeContextMenu.left }}
            className="fixed z-50 bg-[#0a0a0a] border border-[#222] rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
          >
            <button
              onClick={deleteNode}
              className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-[#111] flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Milestone
            </button>
            <button
              onClick={closeMenus}
              className="w-full px-4 py-3 text-left text-sm font-bold text-slate-500 hover:bg-[#111] flex items-center gap-3 transition-colors border-t border-[#222]"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================
const Roadmap = () => {
  const { userData } = useUserData();
  const [viewMode, setViewMode] = useState("timeline");
  const [timeframe, setTimeframe] = useState("3 Months Trajectory");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // EDIT NODE STATE
  const [activeEditNodeId, setActiveEditNodeId] = useState(null);

  // --- 1. FIREBASE FETCH ---
  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!userData?.id) return;
      try {
        const docRef = doc(db, "users", userData.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().roadmap) {
          const rm = docSnap.data().roadmap;
          if (rm.nodes && rm.nodes.length > 0) setNodes(rm.nodes);
          else
            setNodes([
              {
                id: "init_1",
                type: "executionNode",
                position: { x: 250, y: 250 },
                data: {
                  title: "Phase 1 Initialization",
                  desc: "First deployment.",
                  progress: 0,
                },
              },
            ]);
          if (rm.edges && rm.edges.length > 0) setEdges(rm.edges);
        } else {
          // Default first node
          setNodes([
            {
              id: "init_1",
              type: "executionNode",
              position: { x: 250, y: 250 },
              data: {
                title: "Phase 1 Initialization",
                desc: "First deployment.",
                progress: 0,
              },
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to load databank.", e);
      }
    };
    fetchRoadmap();
  }, [userData?.id]);

  // --- 2. FIREBASE SAVE ---
  const handleCloudSave = async () => {
    if (!hasUnsavedChanges || !userData?.id) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", userData.id), {
        "roadmap.nodes": nodes,
        "roadmap.edges": edges,
        "roadmap.lastUpdated": new Date().toISOString(),
      });
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error("Failed to save to chain", e);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. THE PRIORITY ALGORITHM (Glow, Normal, Fade) ---
  const nodesWithPriority = useMemo(() => {
    const statusMap = {};
    nodes.forEach((n) => {
      if (Number(n.data.progress) === 100) statusMap[n.id] = "COMPLETED";
    });

    // READY nodes: All incoming edges are completed OR it has no incoming edges
    const readyNodes = nodes.filter((n) => {
      if (statusMap[n.id] === "COMPLETED") return false;
      const incoming = edges.filter((e) => e.target === n.id);
      return incoming.every((e) => statusMap[e.source] === "COMPLETED");
    });
    readyNodes.forEach((n) => (statusMap[n.id] = "READY"));

    // NEXT nodes: directly connected from READY nodes
    edges.forEach((e) => {
      if (statusMap[e.source] === "READY" && !statusMap[e.target])
        statusMap[e.target] = "NEXT";
    });

    // FUTURE nodes: everything else
    nodes.forEach((n) => {
      if (!statusMap[n.id]) statusMap[n.id] = "FUTURE";
    });

    return nodes.map((n) => ({
      ...n,
      data: { ...n.data, priorityStatus: statusMap[n.id] },
    }));
  }, [nodes, edges]);

  // --- NODE EDITOR HANDLER ---
  const activeNode = nodesWithPriority.find((n) => n.id === activeEditNodeId);

  const updateActiveNode = (key, value) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === activeEditNodeId) {
          return { ...n, data: { ...n.data, [key]: value } };
        }
        return n;
      }),
    );
    setHasUnsavedChanges(true);
  };

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isJournalFullscreen, setIsJournalFullscreen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const JOURNAL_LIMIT = 1000;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const generateMiniCalendar = () => {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const mockLoggedDays = [3, 8, 12, 14, 15];
    return (
      <div className="grid grid-cols-7 gap-1.5 mt-4">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div
            key={Math.random()}
            className="text-[9px] text-[#666] font-bold text-center mb-2"
          >
            {d}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={cn(
              "aspect-square flex items-center justify-center rounded-md text-xs font-mono relative cursor-pointer transition-colors",
              mockLoggedDays.includes(day)
                ? "text-white hover:bg-[#222]"
                : "text-[#444] hover:bg-[#111]",
            )}
          >
            {day}
            {mockLoggedDays.includes(day) && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#030303] min-h-screen text-white selection:bg-white selection:text-black pb-20">
      {/* --- HEADER --- */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-20">
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-2 leading-none">
            Execution Plan.
          </h1>
          <p className="text-lg md:text-xl text-[#888] font-medium tracking-tight">
            The algorithmic blueprint of your monopoly.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto relative">
          <div className="relative w-full md:w-64">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-4 bg-[#0a0a0a] border border-[#222] px-6 py-4 rounded-full font-bold text-sm text-white hover:border-[#444] transition-colors"
            >
              <span className="truncate">{timeframe}</span>{" "}
              <ChevronDown className="w-4 h-4 text-[#666] shrink-0" />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50"
                >
                  {[
                    "1 Month Sprint",
                    "3 Months Trajectory",
                    "12 Months Arc",
                    "Macro Vision",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimeframe(t);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-6 py-4 text-sm font-bold text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex bg-[#0a0a0a] border border-[#222] rounded-full p-1 shrink-0">
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "p-3 rounded-full transition-all",
                viewMode === "timeline"
                  ? "bg-[#222] text-white"
                  : "text-[#666] hover:text-white",
              )}
            >
              <GitBranch className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "p-3 rounded-full transition-all",
                viewMode === "calendar"
                  ? "bg-[#222] text-white"
                  : "text-[#666] hover:text-white",
              )}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* --- TIMELINE ENGINE --- */}
      <div className="relative">
        {viewMode === "timeline" ? (
          <ReactFlowProvider>
            <CanvasEngine
              nodes={nodesWithPriority}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              hasUnsavedChanges={hasUnsavedChanges}
              setHasUnsavedChanges={setHasUnsavedChanges}
              isSaving={isSaving}
              handleCloudSave={handleCloudSave}
              isMapFullscreen={isMapFullscreen}
              setIsMapFullscreen={setIsMapFullscreen}
              setActiveEditNodeId={setActiveEditNodeId}
            />
          </ReactFlowProvider>
        ) : (
          <div className="w-full border-y border-[#111] h-[700px] overflow-y-auto custom-scrollbar p-12 bg-[#050505]">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-3xl font-extrabold text-white mb-8">
                March 2026
              </h2>
              <div className="grid grid-cols-7 gap-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold text-[#666] uppercase pb-4"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-32 rounded-2xl p-4 border flex flex-col transition-colors",
                      i === 11
                        ? "bg-white/5 border-white/20"
                        : "bg-[#0a0a0a] border-[#111] hover:bg-[#111]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-bold font-mono",
                        i === 11 ? "text-white" : "text-[#666]",
                      )}
                    >
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- NODE PARAMETER DRAWER (THE EDITOR) --- */}
        <AnimatePresence>
          {activeEditNodeId && activeNode && (
            <>
              {/* Invisible Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveEditNodeId(null)}
                className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
              />

              {/* Drawer Container (stopPropagation fixes the un-clickable bug) */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-[#0a0a0a] border-l border-[#222] shadow-[auto_0_100px_rgba(0,0,0,0.9)] z-[110] flex flex-col"
              >
                {/* Drawer Header */}
                <div className="flex justify-between items-center p-6 border-b border-[#222] shrink-0 bg-[#050505]">
                  <div className="flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-[#888]" />
                    <h2 className="text-sm font-extrabold tracking-widest uppercase text-white">
                      Node Parameters
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveEditNodeId(null)}
                    className="p-2 bg-[#111] rounded-full text-[#666] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3">
                      Milestone Designation
                    </label>
                    <input
                      type="text"
                      value={activeNode.data.title || ""}
                      onChange={(e) =>
                        updateActiveNode("title", e.target.value)
                      }
                      placeholder="e.g. Boot OS Foundation"
                      className="w-full bg-transparent text-2xl font-extrabold text-white placeholder-[#333] border-b border-[#222] focus:border-white focus:outline-none pb-2 mb-4 transition-colors"
                    />

                    <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 mt-4 flex items-center gap-2">
                      <Type className="w-3 h-3" /> Sub-Classification
                    </label>
                    <input
                      type="text"
                      value={activeNode.data.subtitle || ""}
                      onChange={(e) =>
                        updateActiveNode("subtitle", e.target.value)
                      }
                      placeholder="e.g. Phase 1, UI/UX, Backend..."
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:border-[#555] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Description / Notes */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlignLeft className="w-3 h-3" /> Execution Notes
                    </label>
                    <textarea
                      value={activeNode.data.desc || ""}
                      onChange={(e) => updateActiveNode("desc", e.target.value)}
                      placeholder="Define execution parameters and tactical approach..."
                      rows="5"
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-4 text-sm text-white placeholder-[#444] focus:border-[#555] focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  {/* Deadline Date Picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#666] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> Target Deadline
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={activeNode.data.deadline || ""}
                        onChange={(e) =>
                          updateActiveNode("deadline", e.target.value)
                        }
                        className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-sm text-white focus:border-[#555] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest flex items-center gap-2">
                        <SlidersHorizontal className="w-3 h-3" /> Completion
                        Status
                      </label>
                      <span
                        className={cn(
                          "text-xs font-mono font-bold px-2 py-1 rounded",
                          Number(activeNode.data.progress) === 100
                            ? "bg-green-500/10 text-green-500"
                            : "bg-[#111] text-white",
                        )}
                      >
                        {activeNode.data.progress || 0}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeNode.data.progress || 0}
                      onChange={(e) =>
                        updateActiveNode("progress", Number(e.target.value))
                      }
                      className="w-full h-2 bg-[#222] rounded-lg appearance-none cursor-pointer focus:outline-none accent-white hover:accent-[#ccc]"
                    />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* --- ELEGANT DATE/TIME/JOURNAL BAR --- */}
      <div className="bg-[#050505] border-b border-[#222] py-5 shadow-lg relative z-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-bold text-[#888] tracking-tight">
            <CalendarIcon className="w-4 h-4" /> {formattedDate}
          </div>
          <button
            onClick={() => setIsJournalOpen(true)}
            className="flex-1 max-w-lg w-full bg-[#111] border border-[#333] hover:border-white transition-all rounded-full py-3 px-6 flex items-center justify-center gap-3 group"
          >
            <Edit3 className="w-4 h-4 text-[#888] group-hover:text-white transition-colors" />
            <span className="text-sm font-bold text-[#ccc] group-hover:text-white transition-colors">
              Open Execution Journal
            </span>
          </button>
          <div className="flex items-center gap-2 text-sm font-mono text-white tracking-widest">
            {formattedTime}
          </div>
        </div>
      </div>

      {/* --- PROGRESS INSIGHTS (TELEMETRY) --- */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-20 relative z-20">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Progress Insights.
          </h2>
          <p className="text-[#888] font-medium">
            Tracking verified execution data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 md:p-12 hover:border-[#333] transition-colors">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-2">
                  Milestones Completed
                </p>
                <p className="text-5xl font-extrabold text-white tracking-tighter">
                  {nodes.filter((n) => Number(n.data.progress) === 100).length}
                </p>
                <p className="text-[#888] mt-2">
                  Roadmap completions (30 Days)
                </p>
              </div>
              <Activity className="w-8 h-8 text-[#444]" />
            </div>
            <div className="flex items-end gap-1.5 h-32 w-full mt-auto opacity-30">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#222] rounded-t-sm"
                  style={{ height: `${Math.random() * 20 + 5}%` }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-8 flex flex-col">
            <div className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 flex flex-col justify-center hover:border-[#333] transition-colors">
              <p className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Profile Reach
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-extrabold tracking-tighter text-white">
                  0
                </span>
                <span className="text-[#888] font-medium">views</span>
              </div>
              <p className="text-[#666] text-sm mt-4">
                Public visibility over 7 days.
              </p>
            </div>

            <div className="flex-1 bg-white text-black rounded-[2rem] p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex justify-between items-start">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em]">
                  Current Focus
                </p>
                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight mb-2 truncate">
                  {nodesWithPriority.find(
                    (n) => n.data.priorityStatus === "READY",
                  )?.data.title || "Awaiting Assignment"}
                </h3>
                <p className="text-xs font-bold opacity-70 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Deploy node to start
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 flex flex-col h-full overflow-hidden hover:border-[#333] transition-colors">
            <p className="text-xs font-bold text-[#666] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <List className="w-4 h-4" /> System Ledger
            </p>
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
              <Hash className="w-8 h-8 text-[#444] mb-3" />
              <p className="text-xs font-bold text-[#888]">
                No activity logged yet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- EXECUTION JOURNAL MODAL (WITH MINI CALENDAR) --- */}
      <AnimatePresence>
        {isJournalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJournalOpen(false)}
              className="absolute inset-0 bg-[#000]/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative bg-[#0a0a0a] border border-[#222] shadow-2xl flex flex-col transition-all duration-300",
                isJournalFullscreen
                  ? "w-full h-full rounded-none"
                  : "w-full max-w-6xl h-[80vh] rounded-[2rem]",
              )}
            >
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-[#222] shrink-0">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                    Execution Journal.
                  </h2>
                  <p className="text-[#666] font-mono text-xs">
                    {formattedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsJournalFullscreen(!isJournalFullscreen)}
                    className="p-3 text-[#888] hover:text-white bg-[#111] hover:bg-[#222] rounded-full transition-colors"
                  >
                    {isJournalFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsJournalOpen(false)}
                    className="p-3 text-[#888] hover:text-white bg-[#111] hover:bg-[#222] rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#222] p-6 overflow-y-auto custom-scrollbar bg-[#050505] flex flex-col">
                  <div className="mb-8">
                    <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> Tracker
                    </p>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                      {generateMiniCalendar()}
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Archive
                  </p>
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                      <p className="text-xs font-bold text-[#666]">
                        No previous entries.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col p-6 md:p-10 relative">
                  <div className="flex items-center gap-4 mb-6 opacity-50">
                    <AlignLeft className="w-5 h-5 text-[#888]" />
                    <span className="text-sm font-bold text-[#888]">
                      Drafting new entry...
                    </span>
                  </div>
                  <textarea
                    autoFocus
                    maxLength={JOURNAL_LIMIT}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Document the reality of today's execution..."
                    className="flex-1 w-full bg-transparent text-lg md:text-xl font-medium text-white placeholder-[#444] focus:outline-none resize-none leading-relaxed custom-scrollbar"
                  />
                  <div className="flex items-center justify-between pt-6 border-t border-[#222] mt-auto">
                    <p
                      className={cn(
                        "text-xs font-mono font-bold",
                        journalText.length >= JOURNAL_LIMIT
                          ? "text-red-500"
                          : "text-[#666]",
                      )}
                    >
                      {journalText.length} / {JOURNAL_LIMIT}
                    </p>
                    <button className="px-8 py-3.5 font-extrabold text-black bg-white hover:bg-[#ccc] rounded-full transition-colors text-sm">
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;

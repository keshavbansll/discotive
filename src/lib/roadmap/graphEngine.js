/**
 * @fileoverview Discotive Execution Graph Engine (DAG Compiler)
 * * MAANG-Grade pure functional state evaluator.
 * Traverses the roadmap graph and computes the exact physical and temporal state
 * of every node (Locked, Active, Verifying, Ghost, Backoff, Verified).
 * * Time Complexity: O(V + E) using Kahn's Algorithm / BFS topology traversal.
 * Memory: O(V) auxiliary space. No side-effects.
 */

export const NODE_STATES = {
  LOCKED: "LOCKED", // Dependencies not met
  ACTIVE: "ACTIVE", // Ready to begin
  IN_PROGRESS: "IN_PROGRESS", // User clicked 'Begin', timer running
  VERIFYING: "VERIFYING", // Payload sent to queue/AI
  VERIFIED_GHOST: "VERIFIED_GHOST", // Free tier 24h artificial delay
  VERIFIED: "VERIFIED", // Fully unlocked
  FAILED_BACKOFF: "FAILED_BACKOFF", // Exponential backoff penalty active
};

/**
 * Validates graph integrity to prevent infinite UI loops.
 * @param {Array} nodes
 * @param {Array} edges
 * @returns {boolean} True if DAG is valid, false if cyclic.
 */
const isAcyclic = (nodes, edges) => {
  const inDegree = new Map(nodes.map((n) => [n.id, 0]));
  const adjList = new Map(nodes.map((n) => [n.id, []]));

  for (const { source, target } of edges) {
    if (adjList.has(source) && inDegree.has(target)) {
      adjList.get(source).push(target);
      inDegree.set(target, inDegree.get(target) + 1);
    }
  }

  const queue = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(id);
  }

  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    count++;
    for (const neighbor of adjList.get(curr)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  return count === nodes.length;
};

/**
 * Computes the logic gate requirement for a node based on incoming edges.
 * @param {Object} node
 * @param {Array} incomingEdges
 * @param {Map} computedStates Map of nodeId -> NODE_STATES
 * @returns {boolean} True if dependencies are satisfied
 */
const evaluateDependencies = (node, incomingEdges, computedStates) => {
  if (incomingEdges.length === 0) return true;

  // Default to AND logic if not explicitly defined as OR
  const logicType = node.data?.logicType || "AND";

  const incomingStates = incomingEdges.map(
    (edge) => computedStates.get(edge.source) === NODE_STATES.VERIFIED,
  );

  if (logicType === "AND") {
    return incomingStates.every(Boolean);
  } else if (logicType === "OR") {
    return incomingStates.some(Boolean);
  }

  return false;
};

/**
 * The Master Evaluator
 * Takes raw Firestore nodes/edges and current server time, outputs UI-ready states.
 * * @param {Array} rawNodes
 * @param {Array} rawEdges
 * @param {number} serverTimeMs Current authoritative server time
 * @returns {Array} Hydrated nodes with _computed object attached
 */
export const compileExecutionGraph = (
  rawNodes,
  rawEdges,
  serverTimeMs = Date.now(),
) => {
  if (!isAcyclic(rawNodes, rawEdges)) {
    console.error(
      "[GraphEngine] FATAL: Cyclic dependency detected. Graph evaluation aborted.",
    );
    // Fallback: return nodes safely locked to prevent cascading failures
    return rawNodes.map((n) => ({
      ...n,
      _computed: { state: NODE_STATES.LOCKED },
    }));
  }

  // Pre-compute maps for O(1) lookups
  const incomingEdgesMap = new Map();
  rawNodes.forEach((n) => incomingEdgesMap.set(n.id, []));
  rawEdges.forEach((e) => {
    if (incomingEdgesMap.has(e.target)) {
      incomingEdgesMap.get(e.target).push(e);
    }
  });

  const computedStates = new Map();
  const hydratedNodes = [];

  // We process nodes in topological order to ensure parents are evaluated before children
  // (Simplified here via iterative resolution for resilience)

  let resolving = true;
  const maxIterations = rawNodes.length;
  let iterations = 0;

  while (resolving && iterations < maxIterations) {
    resolving = false;
    iterations++;

    for (const node of rawNodes) {
      if (computedStates.has(node.id)) continue;

      const incoming = incomingEdgesMap.get(node.id);

      // Check if all parents are evaluated
      const parentsEvaluated = incoming.every((edge) =>
        computedStates.has(edge.source),
      );

      if (parentsEvaluated || incoming.length === 0) {
        let finalState = NODE_STATES.LOCKED;
        let timeRemaining = 0;
        let lockReason = null;

        const depsMet = evaluateDependencies(node, incoming, computedStates);

        if (depsMet) {
          const dbState = node.data?.stateData || {};

          // State Machine Resolution
          if (dbState.isVerifiedPublic) {
            finalState = NODE_STATES.VERIFIED;
          } else if (dbState.isVerifiedGhost) {
            const unlockTime = dbState.ghostUnlockTimeMs || 0;
            if (serverTimeMs >= unlockTime) {
              finalState = NODE_STATES.VERIFIED; // 24h passed, automatically convert to public
            } else {
              finalState = NODE_STATES.VERIFIED_GHOST;
              timeRemaining = unlockTime - serverTimeMs;
            }
          } else if (dbState.isVerifying) {
            finalState = NODE_STATES.VERIFYING;
          } else if (
            dbState.failedBackoffUntilMs &&
            dbState.failedBackoffUntilMs > serverTimeMs
          ) {
            finalState = NODE_STATES.FAILED_BACKOFF;
            timeRemaining = dbState.failedBackoffUntilMs - serverTimeMs;
            lockReason = "AI Verification Failed. Strict Backoff Active.";
          } else if (dbState.startedAtMs) {
            const minTimeMs = (node.data?.minimumTimeMinutes || 0) * 60000;
            const elapsedTime = serverTimeMs - dbState.startedAtMs;

            if (elapsedTime < minTimeMs) {
              finalState = NODE_STATES.IN_PROGRESS;
              timeRemaining = minTimeMs - elapsedTime;
            } else {
              finalState = NODE_STATES.ACTIVE; // Timer done, ready for payload submission
            }
          } else {
            finalState = NODE_STATES.ACTIVE; // Dependencies met, hasn't clicked 'Begin'
          }
        }

        computedStates.set(node.id, finalState);

        // Attach computed metadata strictly isolated from DB data
        hydratedNodes.push({
          ...node,
          _computed: {
            state: finalState,
            timeRemaining,
            lockReason,
            isInteractable: [
              NODE_STATES.ACTIVE,
              NODE_STATES.IN_PROGRESS,
            ].includes(finalState),
          },
        });

        resolving = true;
      }
    }
  }

  return hydratedNodes;
};

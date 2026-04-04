/**
 * @fileoverview Discotive Roadmap — Node Action Context & Neural Engine Bridge
 *
 * Replaces every window.dispatchEvent / window.addEventListener pattern
 * in the original file. Nodes that need to trigger parent actions now
 * consume this context instead of polluting the global event bus.
 *
 * Actions provided:
 * - openExplorerModal(nodeId, defaultTab, requiredLearnId) → Unified modal for Vault & Video Hubs
 * - openVaultModal(nodeId, mode?)      → Legacy alias
 * - openVideoModal(nodeId)             → Legacy alias
 * - markVideoWatched(nodeId)           → replaces VIDEO_WATCHED event
 * - toggleNodeCollapse(nodeId, state)  → replaces NODE_COLLAPSE_TOGGLE event
 * - setActiveEditNodeId(id)            → direct state lift
 * - addToast(msg, type)                → direct state lift
 * - addPendingScore(delta)             → direct state lift
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { compileExecutionGraph } from "../lib/roadmap/graphEngine.js";

export const RoadmapContext = createContext(null);

export const useRoadmap = () => {
  const ctx = useContext(RoadmapContext);
  if (!ctx) {
    throw new Error("useRoadmap must be used inside <RoadmapContext.Provider>");
  }
  return ctx;
};

/**
 * @hook useNeuralEngine
 * MAANG-Grade DAG Evaluation Hook.
 * Placed in the parent component that owns the React Flow `nodes` and `edges` state.
 * Safely computes the mathematical state of the execution map and hydrates the UI
 * without triggering infinite render loops on coordinate (drag) changes.
 *
 * @param {Array} edges - The raw React Flow edges array
 * @param {Function} setNodes - The React state setter for nodes
 * @returns {Object} { forceEvaluate } - Function to manually trigger a system calculation
 */
export const useNeuralEngine = (edges, setNodes) => {
  const chronologicalTickRef = useRef(null);

  /**
   * The Core Evaluation Bridge
   * Uses functional state updates to prevent stale closures and React infinite loops.
   */
  const forceEvaluate = useCallback(() => {
    setNodes((currentNodes) => {
      if (!currentNodes?.length) return currentNodes;

      // In production, sync this with Firebase server offset to prevent client-side clock hacking
      const authoritativeTimeMs = Date.now();

      // 1. Run the pure DAG mathematical engine
      const hydratedNodes = compileExecutionGraph(
        currentNodes,
        edges,
        authoritativeTimeMs,
      );

      // 2. Strict Diffing Algorithm
      // We ONLY update the React state if the mathematical state machine shifted.
      let requiresUpdate = false;

      const nextNodes = currentNodes.map((currentNode) => {
        const computedMatch = hydratedNodes.find(
          (n) => n.id === currentNode.id,
        );
        if (!computedMatch) return currentNode;

        const currentComputed = currentNode.data?._computed || {};
        const nextComputed = computedMatch._computed || {};

        // Tolerate 1-second drift to prevent micro-tick render loops
        // since ExecutionNode.jsx handles its own local ticking visually.
        const timeDrift = Math.abs(
          (currentComputed.timeRemaining || 0) -
            (nextComputed.timeRemaining || 0),
        );

        if (
          currentComputed.state !== nextComputed.state ||
          (timeDrift > 1000 && nextComputed.timeRemaining > 0)
        ) {
          requiresUpdate = true;
          return {
            ...currentNode,
            data: {
              ...currentNode.data,
              _computed: nextComputed,
            },
          };
        }

        return currentNode;
      });

      // 3. Abort React commit if state machine is unchanged, saving GPU cycles
      return requiresUpdate ? nextNodes : currentNodes;
    });
  }, [edges, setNodes]);

  /**
   * Passive Dependency Listener
   * Re-evaluates graph when topology (connections) change.
   */
  useEffect(() => {
    forceEvaluate();
  }, [edges, forceEvaluate]); // 'nodes' is deliberately excluded to prevent loops on X/Y drag

  /**
   * The Chronological Daemon (Ghost State & Backoff Monitor)
   * Runs exactly once every 60 seconds in the background to check if
   * "24h Ghost States" or "Exponential Backoff Penalties" have expired chronologically.
   */
  useEffect(() => {
    chronologicalTickRef.current = setInterval(() => {
      forceEvaluate();
    }, 60000); // 1-minute sweeping tick

    return () => clearInterval(chronologicalTickRef.current);
  }, [forceEvaluate]);

  return { forceEvaluate };
};

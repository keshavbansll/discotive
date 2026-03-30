/**
 * @fileoverview Discotive Roadmap — Undo / Redo History Hook
 *
 * Simple past/present/future stack. Max 50 history entries to cap memory.
 * Designed as a drop-in replacement for the unused useReducer import in the
 * original file. Exposed as a custom hook so FlowCanvas stays clean.
 *
 * Usage:
 *   const { nodes, edges, commit, undo, redo, canUndo, canRedo } = useMapHistory(init);
 *
 * Call `commit(nodes, edges)` after any user action to push a snapshot.
 * ReactFlow's internal applyNodeChanges / applyEdgeChanges still owns
 * the live state — call commit() in onNodesChange / onEdgesChange after applying.
 */

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export const useMapHistory = (initialNodes = [], initialEdges = []) => {
  // Each entry is { nodes, edges }
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState({
    nodes: initialNodes,
    edges: initialEdges,
  });
  const [future, setFuture] = useState([]);

  // Prevent committing identical states (e.g. hover without mutation)
  const lastHashRef = useRef(null);

  const commit = useCallback(
    (nodes, edges) => {
      const hash = `${nodes.length}:${edges.length}:${nodes.map((n) => n.id + (n.data?.isCompleted ? "1" : "0") + n.position?.x).join(",")}`;
      if (hash === lastHashRef.current) return;
      lastHashRef.current = hash;

      setPast((p) => {
        const next = [...p, present].slice(-MAX_HISTORY);
        return next;
      });
      setPresent({ nodes, edges });
      setFuture([]);
    },
    [present],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      const newPast = p.slice(0, -1);
      setFuture((f) => [present, ...f]);
      setPresent(prev);
      return newPast;
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);
      setPast((p) => [...p, present]);
      setPresent(next);
      return newFuture;
    });
  }, [present]);

  /** Directly set (bypass history, e.g. on initial cloud load) */
  const reset = useCallback((nodes, edges) => {
    setPast([]);
    setPresent({ nodes, edges });
    setFuture([]);
    lastHashRef.current = null;
  }, []);

  return {
    nodes: present.nodes,
    edges: present.edges,
    commit,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};

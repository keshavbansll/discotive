/**
 * @fileoverview DAG Hierarchical Auto-Layout Engine
 * * Uses Dagre to mathematically calculate exact X/Y coordinates for all nodes,
 * preventing overlaps and ensuring a perfect Left-to-Right neural flow.
 */

import dagre from "dagre";
import { GRAPH_NODE_TYPES } from "./constants";

// Strict physical dimensions mapped to our component architectures
const NODE_DIMENSIONS = {
  [GRAPH_NODE_TYPES.EXECUTION]: { width: 300, height: 180 },
  [GRAPH_NODE_TYPES.HUB]: { width: 200, height: 140 },
  [GRAPH_NODE_TYPES.COMPUTE]: { width: 56, height: 56 },
  [GRAPH_NODE_TYPES.LOGIC]: { width: 48, height: 48 },
  [GRAPH_NODE_TYPES.JOURNAL]: { width: 280, height: 120 },
  [GRAPH_NODE_TYPES.GROUP]: { width: 400, height: 300 }, // Background containers
  default: { width: 250, height: 100 },
};

// Standard Handle Styling for React Flow targets/sources
export const HANDLE_S = {
  width: 10,
  height: 10,
  background: "#1a1a20",
  border: "1.5px solid rgba(255,255,255,0.15)",
  borderRadius: "50%",
};

/**
 * Computes the absolute X/Y positions for a neural network of nodes.
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {string} direction - 'LR' (Left-to-Right) or 'TB' (Top-to-Bottom)
 * @returns {Object} { layoutedNodes, layoutedEdges }
 */
export const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();

  // Configure the mathematical spacing between elements
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80, // Vertical spacing between parallel branches
    ranksep: 120, // Horizontal spacing between sequential phases
    edgesep: 40,
  });

  // 1. Feed the Nodes to the Engine
  nodes.forEach((node) => {
    // If a node is a group container, we handle its layout differently later,
    // but for now we give it standard dimensions in the mathematical flow.
    const dimensions = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS["default"];

    // Allow manual overrides from the node's style object
    const nodeWidth = node.style?.width || dimensions.width;
    const nodeHeight = node.style?.height || dimensions.height;

    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 2. Feed the Edges (Dependencies) to the Engine
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 3. Execute the Layout Algorithm
  dagre.layout(dagreGraph);

  // 4. Hydrate the React Flow nodes with the computed coordinates
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dimensions = NODE_DIMENSIONS[node.type] || NODE_DIMENSIONS["default"];
    const nodeWidth = node.style?.width || dimensions.width;
    const nodeHeight = node.style?.height || dimensions.height;

    // Dagre returns the exact center point of the node.
    // React Flow requires the top-left coordinate. We must offset the math.
    const targetX = nodeWithPosition.x - nodeWidth / 2;
    const targetY = nodeWithPosition.y - nodeHeight / 2;

    return {
      ...node,
      position: {
        x: targetX,
        y: targetY,
      },
      // Important: Ensure targetPosition and sourcePosition align with 'LR'
      targetPosition: "left",
      sourcePosition: "right",
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};

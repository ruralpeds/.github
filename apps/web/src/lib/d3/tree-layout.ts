// =============================================================================
// D3 Tree Layout Utilities
//
// "D3 for math, Svelte for DOM" pattern.
// D3 computes positions and scales. Svelte renders the SVG/HTML.
// =============================================================================

import { hierarchy, tree as d3Tree } from 'd3-hierarchy';
import type { HierarchyNode, HierarchyPointNode } from 'd3-hierarchy';
import type { TreeNode, TreeEdge, NodeType } from './tree-schema';

// ---------------------------------------------------------------------------
// Node color mapping — reads from CSS custom properties at runtime
// ---------------------------------------------------------------------------

export const NODE_TYPE_VAR: Record<NodeType, string> = {
	emergency: '--color-node-emergency',
	urgent: '--color-node-urgent',
	decision: '--color-node-decision',
	action: '--color-node-action',
	assessment: '--color-node-assessment',
	diagnosis: '--color-node-diagnosis',
};

// Fallback hex colors (used when CSS vars not available, e.g., in SSR)
export const NODE_TYPE_FALLBACK: Record<NodeType, string> = {
	emergency: '#EF4444',
	urgent: '#F97316',
	decision: '#EAB308',
	action: '#22C55E',
	assessment: '#3B82F6',
	diagnosis: '#A855F7',
};

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
	emergency: 'Emergency',
	urgent: 'Urgent',
	decision: 'Decision',
	action: 'Action',
	assessment: 'Assessment',
	diagnosis: 'Diagnosis',
};

// ---------------------------------------------------------------------------
// Flatten the DecisionTree schema into d3-hierarchy format
// ---------------------------------------------------------------------------

interface FlatNode {
	id: string;
	label: string;
	type: NodeType;
	description?: string;
	panels?: any[];
	wasmCompute?: any[];
	collapsed?: boolean;
	edgeLabel?: string;
	children?: FlatNode[];
}

/** Convert our TreeNode schema to d3-hierarchy-compatible format */
export function treeToHierarchy(root: TreeNode): FlatNode {
	function convert(node: TreeNode, edgeLabel?: string): FlatNode {
		const flat: FlatNode = {
			id: node.id,
			label: node.label,
			type: node.type,
			description: node.description,
			panels: node.panels,
			wasmCompute: node.wasmCompute,
			collapsed: node.collapsed,
			edgeLabel,
		};

		if (node.children && node.children.length > 0) {
			flat.children = node.children.map((edge: TreeEdge) =>
				convert(edge.node, edge.label)
			);
		}

		return flat;
	}

	return convert(root);
}

// ---------------------------------------------------------------------------
// Layout computation
// ---------------------------------------------------------------------------

export interface LayoutConfig {
	nodeWidth: number;
	nodeHeight: number;
	horizontalSpacing: number;
	verticalSpacing: number;
	orientation: 'vertical' | 'horizontal';
}

export const DEFAULT_LAYOUT: LayoutConfig = {
	nodeWidth: 220,
	nodeHeight: 80,
	horizontalSpacing: 40,
	verticalSpacing: 100,
	orientation: 'vertical',
};

export interface PositionedNode {
	id: string;
	label: string;
	type: NodeType;
	description?: string;
	panels?: any[];
	wasmCompute?: any[];
	edgeLabel?: string;
	x: number;
	y: number;
	depth: number;
	parentId?: string;
	parentX?: number;
	parentY?: number;
	hasChildren: boolean;
	isCollapsed: boolean;
	childCount: number;
}

/**
 * Compute positioned nodes using d3-hierarchy tree layout.
 * Returns flat array of positioned nodes ready for Svelte rendering.
 */
export function computeLayout(
	root: TreeNode,
	collapsedIds: Set<string>,
	config: LayoutConfig = DEFAULT_LAYOUT
): { nodes: PositionedNode[]; width: number; height: number } {
	// Build hierarchy, filtering out collapsed subtrees
	function buildFiltered(node: TreeNode, edgeLabel?: string): FlatNode {
		const flat: FlatNode = {
			id: node.id,
			label: node.label,
			type: node.type,
			description: node.description,
			panels: node.panels,
			wasmCompute: node.wasmCompute,
			collapsed: collapsedIds.has(node.id),
			edgeLabel,
		};

		if (node.children && !collapsedIds.has(node.id)) {
			flat.children = node.children.map((e) => buildFiltered(e.node, e.label));
		}

		return flat;
	}

	const flatRoot = buildFiltered(root);
	const h = hierarchy(flatRoot);

	const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = config;

	const treeLayout = d3Tree<FlatNode>()
		.nodeSize([nodeWidth + horizontalSpacing, nodeHeight + verticalSpacing]);

	const laid = treeLayout(h);

	// Collect positioned nodes
	const nodes: PositionedNode[] = [];
	laid.each((d: HierarchyPointNode<FlatNode>) => {
		const originalNode = findOriginalNode(root, d.data.id);
		nodes.push({
			id: d.data.id,
			label: d.data.label,
			type: d.data.type,
			description: d.data.description,
			panels: d.data.panels,
			wasmCompute: d.data.wasmCompute,
			edgeLabel: d.data.edgeLabel,
			x: d.x,
			y: d.y,
			depth: d.depth,
			parentId: d.parent?.data.id,
			parentX: d.parent?.x,
			parentY: d.parent?.y,
			hasChildren: !!(originalNode?.children && originalNode.children.length > 0),
			isCollapsed: collapsedIds.has(d.data.id),
			childCount: originalNode?.children?.length || 0,
		});
	});

	// Compute bounds
	let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
	for (const n of nodes) {
		if (n.x < minX) minX = n.x;
		if (n.x > maxX) maxX = n.x;
		if (n.y > maxY) maxY = n.y;
	}

	const width = maxX - minX + nodeWidth + horizontalSpacing * 2;
	const height = maxY + nodeHeight + verticalSpacing;

	// Shift so all x values are positive
	const offsetX = -minX + horizontalSpacing;
	for (const n of nodes) {
		n.x += offsetX;
		if (n.parentX !== undefined) n.parentX += offsetX;
	}

	return { nodes, width, height };
}

/** Find a node by ID in the original tree */
function findOriginalNode(node: TreeNode, id: string): TreeNode | null {
	if (node.id === id) return node;
	if (node.children) {
		for (const edge of node.children) {
			const found = findOriginalNode(edge.node, id);
			if (found) return found;
		}
	}
	return null;
}

// ---------------------------------------------------------------------------
// SVG path generator for edges (curved connectors)
// ---------------------------------------------------------------------------

export function edgePath(
	parentX: number, parentY: number,
	childX: number, childY: number,
	nodeHeight: number
): string {
	const startY = parentY + nodeHeight;
	const midY = (startY + childY) / 2;
	return `M ${parentX} ${startY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${childY}`;
}

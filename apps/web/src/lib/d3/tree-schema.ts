// =============================================================================
// Decision Tree Data Schema
//
// Every clinical algorithm (PALS, NRP, sepsis pathway, difficult airway, etc.)
// is defined as a JSON tree matching this schema. The ClinicalDecisionTree
// component renders any tree that conforms to this shape.
//
// Node types map to the standard clinical color coding:
//   Emergency (red)   — immediate life-threatening action
//   Urgent (orange)    — time-sensitive intervention
//   Decision (yellow)  — clinical assessment/branching point
//   Action (green)     — therapeutic action
//   Assessment (blue)  — evaluation/monitoring step
//   Diagnosis (purple) — diagnostic conclusion
// =============================================================================

export type NodeType =
	| 'emergency'
	| 'urgent'
	| 'decision'
	| 'action'
	| 'assessment'
	| 'diagnosis';

export interface ReferencePanel {
	/** Tab label shown in the ⓘ popup */
	label: string;
	/** Panel content type */
	type: 'table' | 'list' | 'text' | 'alert' | 'dosing';
	/** Content depends on type */
	content: TableContent | ListContent | TextContent | AlertContent | DosingContent;
}

export interface TableContent {
	headers: string[];
	rows: string[][];
	caption?: string;
}

export interface ListContent {
	title?: string;
	items: string[];
	ordered?: boolean;
}

export interface TextContent {
	body: string;
	source?: string;
}

export interface AlertContent {
	severity: 'emergency' | 'urgent' | 'warning' | 'info';
	title: string;
	body: string;
}

export interface DosingContent {
	/** Drug doses are computed at render time from patient weight via WASM */
	drugs: string[];
	/** Static notes shown below computed doses */
	notes?: string;
}

export interface TreeNode {
	id: string;
	label: string;
	type: NodeType;
	/** Longer description shown in node body */
	description?: string;
	/** ⓘ reference panels — tabbed popup with clinical details */
	panels?: ReferencePanel[];
	/** Child nodes — branching paths */
	children?: TreeEdge[];
	/** If true, node starts collapsed (user must click to expand) */
	collapsed?: boolean;
	/** Weight-based values to compute via WASM at render time */
	wasmCompute?: WasmCompute[];
}

export interface TreeEdge {
	/** Label on the branch (e.g., "Yes", "No", "HR < 60", "Shockable") */
	label: string;
	/** Target node */
	node: TreeNode;
}

export interface WasmCompute {
	/** WASM function name to call */
	fn: string;
	/** Arguments (strings like "epinephrine" or numbers) */
	args?: (string | number)[];
	/** Where to display the result in the node */
	displayKey: string;
	/** Format: "dose", "volume", "energy", "equipment" */
	format: string;
}

export interface DecisionTree {
	id: string;
	title: string;
	version: string;
	mode: 'neonatal' | 'pediatric' | 'both';
	/** Source guideline (e.g., "AHA PALS 2025", "AAP NRP 8th Ed") */
	source: string;
	lastUpdated: string;
	/** Root node of the tree */
	root: TreeNode;
	/** Textbook content associated with this tree */
	textbook?: TextbookSection;
}

// =============================================================================
// Textbook Section Schema
//
// Each decision tree can have an associated textbook section providing
// the educational depth behind the algorithm. This is the content that
// gets rendered as scrollable reference material alongside or below
// the interactive tree.
// =============================================================================

export interface TextbookSection {
	title: string;
	/** Structured content blocks */
	blocks: TextbookBlock[];
	/** PubMed/guideline references */
	references: Reference[];
}

export type TextbookBlock =
	| { type: 'heading'; level: 1 | 2 | 3; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'list'; ordered: boolean; items: string[] }
	| { type: 'table'; headers: string[]; rows: string[][]; caption?: string }
	| { type: 'alert'; severity: 'emergency' | 'urgent' | 'warning' | 'info'; title: string; body: string }
	| { type: 'keypoint'; text: string }
	| { type: 'evidence'; level: string; text: string; source: string }
	| { type: 'image'; src: string; alt: string; caption?: string }
	| { type: 'equation'; latex: string; description: string };

export interface Reference {
	id: string;
	authors: string;
	title: string;
	journal: string;
	year: number;
	doi?: string;
	pmid?: string;
	/** Brief annotation for why this reference matters */
	note?: string;
}

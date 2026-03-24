// =============================================================================
// Decision Tree Registry
//
// Import all clinical decision trees here. The registry maps tree IDs to
// their data. Routes use this to load trees by ID.
// =============================================================================

import type { DecisionTree } from '$lib/d3/tree-schema';
import { nrpAlgorithm } from './trees/nrp-algorithm';

// Add new trees here as they're created:
// import { palsAlgorithm } from './trees/pals-algorithm';
// import { difficultAirway } from './trees/difficult-airway';
// import { sepsisPathway } from './trees/sepsis-pathway';

export const TREE_REGISTRY: Record<string, DecisionTree> = {
	'nrp-2025': nrpAlgorithm,
	// 'pals-2025': palsAlgorithm,
	// 'difficult-airway': difficultAirway,
	// 'sepsis-pathway': sepsisPathway,
};

/** Get all trees available for a mode */
export function getTreesForMode(mode: 'neonatal' | 'pediatric'): DecisionTree[] {
	return Object.values(TREE_REGISTRY).filter(
		(t) => t.mode === mode || t.mode === 'both'
	);
}

/** Get a single tree by ID */
export function getTree(id: string): DecisionTree | undefined {
	return TREE_REGISTRY[id];
}

// =============================================================================
// Decision Tree Registry
//
// Import all clinical decision trees here. The registry maps tree IDs to
// their data. Routes use this to load trees by ID.
// =============================================================================

import type { DecisionTree } from '$lib/d3/tree-schema';
import { nrpAlgorithm } from './trees/nrp-algorithm';
import { sepsisPathway } from './trees/sepsis-pathway';
import { rsiProtocol } from './trees/rsi-protocol';
import { palsCardiacArrest } from './trees/pals-cardiac-arrest';

// Add new trees here as they're created:
// import { palsBradycardia } from './trees/pals-bradycardia';
// import { palsTachycardia } from './trees/pals-tachycardia';
// import { difficultAirway } from './trees/difficult-airway';
// import { dkaProtocol } from './trees/dka-protocol';
// import { statusEpilepticus } from './trees/status-epilepticus';
// import { anaphylaxis } from './trees/anaphylaxis';
// import { burnsProtocol } from './trees/burns-protocol';
// import { traumaAssessment } from './trees/trauma-assessment';
// import { neonatalHypoglycemia } from './trees/neonatal-hypoglycemia';
// import { neonatalSeizures } from './trees/neonatal-seizures';
// import { respiratoryEscalation } from './trees/respiratory-escalation';

export const TREE_REGISTRY: Record<string, DecisionTree> = {
	'nrp-2025': nrpAlgorithm,
	'sepsis-first-hour-2025': sepsisPathway,
	'rsi-2025': rsiProtocol,
	'pals-cardiac-arrest-2025': palsCardiacArrest,
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

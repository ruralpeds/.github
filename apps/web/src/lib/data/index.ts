import type { DecisionTree } from '$lib/d3/tree-schema';
import { nrpAlgorithm } from './trees/nrp-algorithm';
import { sepsisPathway } from './trees/sepsis-pathway';
import { rsiProtocol } from './trees/rsi-protocol';
import { palsCardiacArrest } from './trees/pals-cardiac-arrest';
import { palsBradycardia } from './trees/pals-bradycardia';
import { palsTachycardia } from './trees/pals-tachycardia';
import { statusEpilepticus } from './trees/status-epilepticus';
import { dkaProtocol } from './trees/dka-protocol';
import { anaphylaxis } from './trees/anaphylaxis';

export const TREE_REGISTRY: Record<string, DecisionTree> = {
	'nrp-2025': nrpAlgorithm,
	'sepsis-first-hour-2025': sepsisPathway,
	'rsi-2025': rsiProtocol,
	'pals-cardiac-arrest-2025': palsCardiacArrest,
	'pals-bradycardia-2025': palsBradycardia,
	'pals-tachycardia-2025': palsTachycardia,
	'status-epilepticus-2025': statusEpilepticus,
	'dka-2025': dkaProtocol,
	'anaphylaxis-2025': anaphylaxis,
};

export function getTreesForMode(mode: 'neonatal' | 'pediatric'): DecisionTree[] {
	return Object.values(TREE_REGISTRY).filter(
		(t) => t.mode === mode || t.mode === 'both'
	);
}

export function getTree(id: string): DecisionTree | undefined {
	return TREE_REGISTRY[id];
}

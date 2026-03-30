import type { DecisionTree } from '$lib/d3/tree-schema';
import nrpAlgorithm from './trees/nrp-algorithm.json';
import sepsisPathway from './trees/sepsis-pathway.json';
import rsiProtocol from './trees/rsi-protocol.json';
import palsCardiacArrest from './trees/pals-cardiac-arrest.json';
import palsBradycardia from './trees/pals-bradycardia.json';
import palsTachycardia from './trees/pals-tachycardia.json';
import statusEpilepticus from './trees/status-epilepticus.json';
import dkaProtocol from './trees/dka-protocol.json';
import anaphylaxis from './trees/anaphylaxis.json';

export const TREE_REGISTRY: Record<string, DecisionTree> = {
	'nrp-2025': nrpAlgorithm as unknown as DecisionTree,
	'sepsis-first-hour-2025': sepsisPathway as unknown as DecisionTree,
	'rsi-2025': rsiProtocol as unknown as DecisionTree,
	'pals-cardiac-arrest-2025': palsCardiacArrest as unknown as DecisionTree,
	'pals-bradycardia-2025': palsBradycardia as unknown as DecisionTree,
	'pals-tachycardia-2025': palsTachycardia as unknown as DecisionTree,
	'status-epilepticus-2025': statusEpilepticus as unknown as DecisionTree,
	'dka-2025': dkaProtocol as unknown as DecisionTree,
	'anaphylaxis-2025': anaphylaxis as unknown as DecisionTree,
};

export function getTreesForMode(mode: 'neonatal' | 'pediatric'): DecisionTree[] {
	return Object.values(TREE_REGISTRY).filter(
		(t) => t.mode === mode || t.mode === 'both'
	);
}

export function getTree(id: string): DecisionTree | undefined {
	return TREE_REGISTRY[id];
}

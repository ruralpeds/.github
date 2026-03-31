<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _rsiProtocol from '$lib/data/trees/rsi-protocol.json';
	const rsiProtocol = _rsiProtocol as unknown as DecisionTree;
</script>
<svelte:head><title>Rapid Sequence Intubation — PED CDS</title></svelte:head>
<TreePage tree={rsiProtocol} />

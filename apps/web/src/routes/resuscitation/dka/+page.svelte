<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _dkaProtocol from '$lib/data/trees/dka-protocol.json';
	const dkaProtocol = _dkaProtocol as unknown as DecisionTree;
</script>
<svelte:head><title>DKA Protocol — PED CDS</title></svelte:head>
<TreePage tree={dkaProtocol} />

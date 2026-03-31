<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _nrpAlgorithm from '$lib/data/trees/nrp-algorithm.json';
	const nrpAlgorithm = _nrpAlgorithm as unknown as DecisionTree;
</script>
<svelte:head><title>NRP Algorithm — PED CDS</title></svelte:head>
<TreePage tree={nrpAlgorithm} />

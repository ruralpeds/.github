<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _sepsisPathway from '$lib/data/trees/sepsis-pathway.json';
	const sepsisPathway = _sepsisPathway as unknown as DecisionTree;
</script>
<svelte:head><title>Sepsis First-Hour Bundle — PED CDS</title></svelte:head>
<TreePage tree={sepsisPathway} />

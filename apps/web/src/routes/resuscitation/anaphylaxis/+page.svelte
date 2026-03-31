<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _anaphylaxis from '$lib/data/trees/anaphylaxis.json';
	const anaphylaxis = _anaphylaxis as unknown as DecisionTree;
</script>
<svelte:head><title>Anaphylaxis — PED CDS</title></svelte:head>
<TreePage tree={anaphylaxis} />

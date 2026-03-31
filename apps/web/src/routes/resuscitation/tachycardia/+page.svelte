<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _palsTachycardia from '$lib/data/trees/pals-tachycardia.json';
	const palsTachycardia = _palsTachycardia as unknown as DecisionTree;
</script>
<svelte:head><title>PALS Tachycardia — PED CDS</title></svelte:head>
<TreePage tree={palsTachycardia} />

<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _palsBradycardia from '$lib/data/trees/pals-bradycardia.json';
	const palsBradycardia = _palsBradycardia as unknown as DecisionTree;
</script>
<svelte:head><title>PALS Bradycardia — PED CDS</title></svelte:head>
<TreePage tree={palsBradycardia} />

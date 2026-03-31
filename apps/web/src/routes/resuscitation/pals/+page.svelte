<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _palsCardiacArrest from '$lib/data/trees/pals-cardiac-arrest.json';
	const palsCardiacArrest = _palsCardiacArrest as unknown as DecisionTree;
</script>
<svelte:head><title>PALS Cardiac Arrest — PED CDS</title></svelte:head>
<TreePage tree={palsCardiacArrest} />

<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _statusEpilepticus from '$lib/data/trees/status-epilepticus.json';
	const statusEpilepticus = _statusEpilepticus as unknown as DecisionTree;
</script>
<svelte:head><title>Status Epilepticus — PED CDS</title></svelte:head>
<TreePage tree={statusEpilepticus} />

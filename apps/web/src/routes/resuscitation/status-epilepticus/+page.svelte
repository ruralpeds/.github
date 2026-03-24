<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import { statusEpilepticus } from '$lib/data/trees/status-epilepticus';
</script>
<svelte:head><title>Status Epilepticus — PED CDS</title></svelte:head>
<TreePage tree={statusEpilepticus} />

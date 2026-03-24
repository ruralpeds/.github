<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import { nrpAlgorithm } from '$lib/data/trees/nrp-algorithm';
</script>
<svelte:head><title>NRP Algorithm — PED CDS</title></svelte:head>
<TreePage tree={nrpAlgorithm} />

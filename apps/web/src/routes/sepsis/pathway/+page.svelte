<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import sepsisPathway from '$lib/data/trees/sepsis-pathway.json';
</script>
<svelte:head><title>Sepsis First-Hour Bundle — PED CDS</title></svelte:head>
<TreePage tree={sepsisPathway} />

<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import { anaphylaxis } from '$lib/data/trees/anaphylaxis';
</script>
<svelte:head><title>Anaphylaxis — PED CDS</title></svelte:head>
<TreePage tree={anaphylaxis} />

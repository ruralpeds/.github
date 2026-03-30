<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import rsiProtocol from '$lib/data/trees/rsi-protocol.json';
</script>
<svelte:head><title>Rapid Sequence Intubation — PED CDS</title></svelte:head>
<TreePage tree={rsiProtocol} />

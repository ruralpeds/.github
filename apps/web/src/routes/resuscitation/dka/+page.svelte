<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import dkaProtocol from '$lib/data/trees/dka-protocol.json';
</script>
<svelte:head><title>DKA Protocol — PED CDS</title></svelte:head>
<TreePage tree={dkaProtocol} />

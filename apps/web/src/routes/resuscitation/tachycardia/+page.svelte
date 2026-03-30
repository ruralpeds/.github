<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import palsTachycardia from '$lib/data/trees/pals-tachycardia.json';
</script>
<svelte:head><title>PALS Tachycardia — PED CDS</title></svelte:head>
<TreePage tree={palsTachycardia} />

<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import { palsCardiacArrest } from '$lib/data/trees/pals-cardiac-arrest';
</script>
<svelte:head><title>PALS Cardiac Arrest — PED CDS</title></svelte:head>
<TreePage tree={palsCardiacArrest} />

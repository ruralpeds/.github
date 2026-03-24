<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import { palsBradycardia } from '$lib/data/trees/pals-bradycardia';
</script>
<svelte:head><title>PALS Bradycardia — PED CDS</title></svelte:head>
<TreePage tree={palsBradycardia} />

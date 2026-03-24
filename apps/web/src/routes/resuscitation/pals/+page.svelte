<script lang="ts">
	import ClinicalDecisionTree from '$lib/components/clinical/ClinicalDecisionTree.svelte';
	import TextbookViewer from '$lib/components/clinical/TextbookViewer.svelte';
	import { palsCardiacArrest } from '$lib/data/trees/pals-cardiac-arrest';
	let activeView: 'tree' | 'textbook' | 'split' = 'split';
</script>
<svelte:head><title>PALS Cardiac Arrest — PED CDS</title></svelte:head>
<div class="page">
	<div class="view-toggle">
		<button class="toggle-btn" class:active={activeView === 'tree'} on:click={() => activeView = 'tree'}>Decision Tree</button>
		<button class="toggle-btn" class:active={activeView === 'split'} on:click={() => activeView = 'split'}>Split View</button>
		<button class="toggle-btn" class:active={activeView === 'textbook'} on:click={() => activeView = 'textbook'}>Textbook</button>
	</div>
	<div class="content" class:split={activeView === 'split'}>
		{#if activeView !== 'textbook'}<div class="tree"><ClinicalDecisionTree tree={palsCardiacArrest} /></div>{/if}
		{#if activeView !== 'tree' && palsCardiacArrest.textbook}<div class="text"><TextbookViewer section={palsCardiacArrest.textbook} /></div>{/if}
	</div>
</div>
<style>
	.page { display: flex; flex-direction: column; gap: 1rem; }
	.view-toggle { display: flex; gap: 0.25rem; background: var(--color-surface-inset); padding: 0.25rem; border-radius: var(--radius-md); width: fit-content; }
	.toggle-btn { font-family: var(--font-body); font-size: 0.8125rem; font-weight: 500; padding: 0.35rem 0.85rem; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; }
	.toggle-btn.active { background: var(--color-surface); color: var(--color-text); box-shadow: var(--shadow-sm); }
	.content { display: flex; flex-direction: column; gap: 2rem; }
	.split { flex-direction: row; gap: 1.5rem; }
	.tree, .text { flex: 1; min-width: 0; }
	.text { max-height: calc(100vh - 200px); overflow-y: auto; }
	@media (max-width: 1024px) { .split { flex-direction: column; } .text { max-height: none; } }
</style>

<script lang="ts">
	import ClinicalDecisionTree from '$lib/components/clinical/ClinicalDecisionTree.svelte';
	import TextbookViewer from '$lib/components/clinical/TextbookViewer.svelte';
	import { nrpAlgorithm } from '$lib/data/trees/nrp-algorithm';

	let activeView: 'tree' | 'textbook' | 'split' = 'split';
</script>

<svelte:head>
	<title>NRP Algorithm — PED CDS</title>
</svelte:head>

<div class="nrp-page">
	<!-- View toggle -->
	<div class="view-toggle">
		<button class="toggle-btn" class:active={activeView === 'tree'} on:click={() => activeView = 'tree'}>
			Decision Tree
		</button>
		<button class="toggle-btn" class:active={activeView === 'split'} on:click={() => activeView = 'split'}>
			Split View
		</button>
		<button class="toggle-btn" class:active={activeView === 'textbook'} on:click={() => activeView = 'textbook'}>
			Textbook
		</button>
	</div>

	<div class="content" class:content--split={activeView === 'split'}>
		{#if activeView === 'tree' || activeView === 'split'}
			<div class="content__tree">
				<ClinicalDecisionTree tree={nrpAlgorithm} />
			</div>
		{/if}

		{#if activeView === 'textbook' || activeView === 'split'}
			<div class="content__textbook">
				{#if nrpAlgorithm.textbook}
					<TextbookViewer section={nrpAlgorithm.textbook} />
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.nrp-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.view-toggle {
		display: flex;
		gap: 0.25rem;
		background: var(--color-surface-inset);
		padding: 0.25rem;
		border-radius: var(--radius-md);
		width: fit-content;
	}

	.toggle-btn {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.35rem 0.85rem;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: background-color 0.1s, color 0.1s;
	}

	.toggle-btn.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.content--split {
		flex-direction: row;
		gap: 1.5rem;
	}

	.content__tree {
		flex: 1;
		min-width: 0;
	}

	.content__textbook {
		flex: 1;
		min-width: 0;
		max-height: calc(100vh - 200px);
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	@media (max-width: 1024px) {
		.content--split {
			flex-direction: column;
		}
		.content__textbook {
			max-height: none;
		}
	}
</style>

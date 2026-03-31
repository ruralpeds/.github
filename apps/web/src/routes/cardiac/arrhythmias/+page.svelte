<script lang="ts">
	import TreePage from '$lib/components/clinical/TreePage.svelte';
	import type { DecisionTree } from '$lib/d3/tree-schema';
	import _palsCardiacArrest from '$lib/data/trees/pals-cardiac-arrest.json';
	import _palsBradycardia from '$lib/data/trees/pals-bradycardia.json';
	import _palsTachycardia from '$lib/data/trees/pals-tachycardia.json';

	const palsCardiacArrest = _palsCardiacArrest as unknown as DecisionTree;
	const palsBradycardia = _palsBradycardia as unknown as DecisionTree;
	const palsTachycardia = _palsTachycardia as unknown as DecisionTree;

	const trees = [palsCardiacArrest, palsBradycardia, palsTachycardia];
	let selected = 0;
</script>

<svelte:head><title>Arrhythmias — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Arrhythmia Algorithms</h1>
		<p class="subtitle">PALS cardiac arrest · Bradycardia · Tachycardia algorithms</p>
	</div>

	<div class="tab-row">
		{#each trees as t, i}
			<button class="tab" class:active={selected === i} on:click={() => selected = i}>
				{t.title ?? t.id}
			</button>
		{/each}
	</div>

	<div class="tree-wrap">
		<TreePage tree={trees[selected]} />
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.tab-row { display: flex; gap: 0.35rem; flex-wrap: wrap; }
	.tab { padding: 0.4rem 0.9rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted); cursor: pointer; transition: border-color 0.15s, color 0.15s; }
	.tab.active { border-color: var(--color-primary); color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); }
	.tree-wrap { flex: 1; min-height: 500px; }
</style>

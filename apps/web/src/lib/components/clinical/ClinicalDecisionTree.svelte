<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme';
	import { patient, hasPatient } from '$lib/stores/patient';
	import { reportError } from '$lib/stores/errors';
	import { WasmError } from '$lib/wasm/errors';
	import type { DecisionTree, TreeNode, ReferencePanel, NodeType } from '$lib/d3/tree-schema';
	import {
		computeLayout,
		edgePath,
		NODE_TYPE_FALLBACK,
		NODE_TYPE_LABELS,
		DEFAULT_LAYOUT,
		type PositionedNode,
		type LayoutConfig,
	} from '$lib/d3/tree-layout';

	// ---------------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------------
	export let tree: DecisionTree;
	export let layout: LayoutConfig = DEFAULT_LAYOUT;

	// ---------------------------------------------------------------------------
	// State
	// ---------------------------------------------------------------------------
	let collapsedIds = new Set<string>();
	let activePopupId: string | null = null;
	let nodes: PositionedNode[] = [];
	let treeWidth = 0;
	let treeHeight = 0;
	let svgEl: SVGSVGElement;
	let panX = 0;
	let panY = 0;
	let zoom = 1;

	// Computed WASM results cache
	let wasmResults: Map<string, Map<string, any>> = new Map();
	// Track nodes that failed WASM computation
	let wasmErrors: Map<string, string> = new Map();

	// ---------------------------------------------------------------------------
	// Layout recomputation
	// ---------------------------------------------------------------------------
	$: {
		const result = computeLayout(tree.root, collapsedIds, layout);
		nodes = result.nodes;
		treeWidth = result.width;
		treeHeight = result.height;
	}

	// ---------------------------------------------------------------------------
	// Node interactions
	// ---------------------------------------------------------------------------
	function toggleCollapse(id: string) {
		const next = new Set(collapsedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		collapsedIds = next;
		// Close popup when collapsing
		if (activePopupId === id) activePopupId = null;
	}

	function togglePopup(id: string) {
		activePopupId = activePopupId === id ? null : id;
	}

	// ---------------------------------------------------------------------------
	// WASM-computed values (drug doses, equipment, etc.)
	// ---------------------------------------------------------------------------
	async function computeNodeValues(node: PositionedNode) {
		if (!node.wasmCompute || !$hasPatient) return;
		try {
			const wasm = await import('$lib/wasm');
			const results = new Map<string, any>();
			for (const comp of node.wasmCompute) {
				const args = comp.args || [];
				const fn = (wasm as any)[comp.fn];
				if (typeof fn === 'function') {
					const result = await fn($patient.weightKg, $patient.ageMonths, ...args);
					results.set(comp.displayKey, result);
				}
			}
			wasmResults.set(node.id, results);
			wasmErrors.delete(node.id);
			wasmResults = wasmResults; // trigger reactivity
			wasmErrors = wasmErrors;
		} catch (err) {
			reportError(err);
			const msg = err instanceof WasmError
				? (err.isValidationError ? `Invalid input: ${err.message}` : err.message)
				: 'Calculation failed';
			wasmErrors.set(node.id, msg);
			wasmErrors = wasmErrors; // trigger reactivity
		}
	}

	// Compute values when patient changes
	$: if ($hasPatient) {
		nodes.forEach((n) => {
			if (n.wasmCompute?.length) computeNodeValues(n);
		});
	}

	// ---------------------------------------------------------------------------
	// Pan & zoom
	// ---------------------------------------------------------------------------
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			// Zoom
			const delta = e.deltaY > 0 ? 0.9 : 1.1;
			zoom = Math.min(Math.max(zoom * delta, 0.3), 2.5);
		} else {
			// Pan
			panX -= e.deltaX;
			panY -= e.deltaY;
		}
	}

	// ---------------------------------------------------------------------------
	// Color helpers
	// ---------------------------------------------------------------------------
	function nodeColor(type: string): string {
		return (NODE_TYPE_FALLBACK as Record<string, string>)[type];
	}

	function nodeBg(type: NodeType): string {
		return nodeColor(type) + '18'; // 10% opacity hex
	}
</script>

<div class="tree-container">
	<!-- Header -->
	<div class="tree-header">
		<div class="tree-header__info">
			<h2 class="tree-title">{tree.title}</h2>
			<span class="tree-source">{tree.source}</span>
			<span class="tree-version">v{tree.version} · {tree.lastUpdated}</span>
		</div>
		<div class="tree-header__controls">
			<button class="ctrl-btn" on:click={() => { zoom = Math.min(zoom + 0.15, 2.5); }}>+</button>
			<button class="ctrl-btn" on:click={() => { zoom = Math.max(zoom - 0.15, 0.3); }}>−</button>
			<button class="ctrl-btn" on:click={() => { zoom = 1; panX = 0; panY = 0; }}>Reset</button>
		</div>
	</div>

	<!-- Legend -->
	<div class="tree-legend">
		{#each Object.entries(NODE_TYPE_LABELS) as [type, label]}
			<span class="legend-item">
				<span class="legend-dot" style="background-color: {nodeColor(type)}"></span>
				{label}
			</span>
		{/each}
	</div>

	<!-- SVG Canvas -->
	<div class="tree-canvas" on:wheel={handleWheel}>
		<svg
			bind:this={svgEl}
			width="100%"
			height="600"
			viewBox="0 0 {treeWidth} {treeHeight}"
			style="transform: scale({zoom}) translate({panX}px, {panY}px); transform-origin: center top;"
		>
			<!-- Edges -->
			{#each nodes as node}
				{#if node.parentX !== undefined && node.parentY !== undefined}
					<path
						d={edgePath(
							node.parentX + layout.nodeWidth / 2,
							node.parentY,
							node.x + layout.nodeWidth / 2,
							node.y,
							layout.nodeHeight
						)}
						fill="none"
						stroke="var(--color-border)"
						stroke-width="2"
						opacity="0.6"
					/>
					<!-- Edge label -->
					{#if node.edgeLabel}
						<text
							x={(node.parentX + node.x) / 2 + layout.nodeWidth / 2}
							y={(node.parentY + layout.nodeHeight + node.y) / 2}
							text-anchor="middle"
							font-size="11"
							font-family="var(--font-mono)"
							fill="var(--color-text-muted)"
							font-weight="600"
						>
							{node.edgeLabel}
						</text>
					{/if}
				{/if}
			{/each}

			<!-- Nodes -->
			{#each nodes as node (node.id)}
				<g
					transform="translate({node.x}, {node.y})"
					class="tree-node"
					on:click={() => node.hasChildren && toggleCollapse(node.id)}
					role="button"
					tabindex="0"
					aria-label="{node.label}"
					aria-expanded={node.hasChildren ? !node.isCollapsed : undefined}
				>
					<!-- Node box -->
					<rect
						width={layout.nodeWidth}
						height={layout.nodeHeight}
						rx="8"
						ry="8"
						fill={nodeBg(node.type)}
						stroke={nodeColor(node.type)}
						stroke-width="2"
					/>

					<!-- Color bar at top -->
					<rect
						width={layout.nodeWidth}
						height="4"
						rx="8"
						ry="8"
						fill={nodeColor(node.type)}
					/>
					<!-- Cover bottom corners of color bar -->
					<rect
						x="0" y="4"
						width={layout.nodeWidth}
						height="4"
						fill={nodeBg(node.type)}
					/>

					<!-- Node label -->
					<text
						x={layout.nodeWidth / 2}
						y="28"
						text-anchor="middle"
						font-size="12"
						font-weight="700"
						font-family="var(--font-body)"
						fill="var(--color-text)"
					>
						{node.label.length > 28 ? node.label.slice(0, 26) + '…' : node.label}
					</text>

					<!-- Description line -->
					{#if node.description}
						<text
							x={layout.nodeWidth / 2}
							y="44"
							text-anchor="middle"
							font-size="10"
							font-family="var(--font-body)"
							fill="var(--color-text-muted)"
						>
							{node.description.length > 35 ? node.description.slice(0, 33) + '…' : node.description}
						</text>
					{/if}

					<!-- WASM-computed value display -->
					{#if wasmErrors.has(node.id)}
						<text
							x={layout.nodeWidth / 2}
							y="60"
							text-anchor="middle"
							font-size="10"
							font-weight="600"
							font-family="var(--font-mono)"
							fill="var(--color-emergency, #EF4444)"
						>
							Calc error
						</text>
					{:else if wasmResults.has(node.id)}
						{#each [...(wasmResults.get(node.id)?.entries() ?? [])] as [key, val]}
							<text
								x={layout.nodeWidth / 2}
								y="60"
								text-anchor="middle"
								font-size="11"
								font-weight="600"
								font-family="var(--font-mono)"
								fill={nodeColor(node.type)}
							>
								{typeof val === 'object' && val.dose_mg ? `${val.dose_mg} mg (${val.dose_ml} mL)` : String(val)}
							</text>
						{/each}
					{/if}

					<!-- Expand/collapse indicator -->
					{#if node.hasChildren}
						<text
							x={layout.nodeWidth - 16}
							y={layout.nodeHeight - 8}
							font-size="12"
							font-family="var(--font-mono)"
							fill="var(--color-text-muted)"
							text-anchor="middle"
						>
							{node.isCollapsed ? `+${node.childCount}` : '−'}
						</text>
					{/if}

					<!-- ⓘ reference panel badge -->
					{#if node.panels && node.panels.length > 0}
						<g
							transform="translate({layout.nodeWidth - 4}, -4)"
							on:click|stopPropagation={() => togglePopup(node.id)}
							class="info-badge"
							role="button"
							tabindex="0"
							aria-label="Show reference information"
						>
							<circle cx="0" cy="0" r="10" fill={nodeColor(node.type)} />
							<text x="0" y="4" text-anchor="middle" font-size="12" font-weight="700" fill="white">ⓘ</text>
						</g>
					{/if}
				</g>
			{/each}
		</svg>
	</div>

	<!-- Reference Popup (rendered in HTML overlay for scrollability) -->
	{#if activePopupId}
		{@const popupNode = nodes.find(n => n.id === activePopupId)}
		{#if popupNode?.panels}
			<div class="popup-overlay" on:click={() => activePopupId = null}>
				<div class="popup" on:click|stopPropagation>
					<div class="popup__header">
						<span class="popup__node-type" style="color: {nodeColor(popupNode.type)}">
							{NODE_TYPE_LABELS[popupNode.type]}
						</span>
						<h3 class="popup__title">{popupNode.label}</h3>
						<button class="popup__close" on:click={() => activePopupId = null}>×</button>
					</div>

					<!-- Tabbed panels -->
					<div class="popup__tabs">
						{#each popupNode.panels as panel, i}
							<button
								class="popup__tab"
								class:active={i === 0}
								on:click={(e) => {
									const container = e.currentTarget.closest('.popup');
									if (container) {
										container.querySelectorAll('.popup__panel').forEach((el, j) => {
											el.classList.toggle('active', j === i);
										});
										container.querySelectorAll('.popup__tab').forEach((el, j) => {
											el.classList.toggle('active', j === i);
										});
									}
								}}
							>
								{panel.label}
							</button>
						{/each}
					</div>

					<div class="popup__body">
						{#each popupNode.panels as panel, i}
							<div class="popup__panel" class:active={i === 0}>
								{#if panel.type === 'table'}
									<table class="ref-table">
										<thead>
											<tr>
												{#each panel.content.headers as h}
													<th>{h}</th>
												{/each}
											</tr>
										</thead>
										<tbody>
											{#each panel.content.rows as row}
												<tr>
													{#each row as cell}
														<td>{cell}</td>
													{/each}
												</tr>
											{/each}
										</tbody>
									</table>
								{:else if panel.type === 'list'}
									{#if panel.content.title}
										<h4 class="ref-list-title">{panel.content.title}</h4>
									{/if}
									<ul class="ref-list">
										{#each panel.content.items as item}
											<li>{item}</li>
										{/each}
									</ul>
								{:else if panel.type === 'text'}
									<p class="ref-text">{panel.content.body}</p>
									{#if panel.content.source}
										<cite class="ref-source">{panel.content.source}</cite>
									{/if}
								{:else if panel.type === 'alert'}
									<div class="ref-alert ref-alert--{panel.content.severity}">
										<strong>{panel.content.title}</strong>
										<p>{panel.content.body}</p>
									</div>
								{:else if panel.type === 'dosing'}
									<p class="ref-dosing-note">Doses computed from patient weight via WASM.</p>
									{#each panel.content.drugs as drug}
										<p class="ref-drug">{drug}</p>
									{/each}
									{#if panel.content.notes}
										<p class="ref-text">{panel.content.notes}</p>
									{/if}
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.tree-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tree-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.tree-title {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		color: var(--color-text);
		margin: 0;
	}

	.tree-source, .tree-version {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
		display: block;
	}

	.tree-header__controls {
		display: flex;
		gap: 0.3rem;
	}

	.ctrl-btn {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.tree-legend {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.tree-canvas {
		overflow: hidden;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface-inset);
		cursor: grab;
	}

	.tree-canvas:active { cursor: grabbing; }

	.tree-node { cursor: pointer; }
	.tree-node:hover rect:first-child { stroke-width: 3; }

	.info-badge { cursor: pointer; }
	.info-badge:hover circle { opacity: 0.8; }

	/* Popup overlay */
	.popup-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: 1rem;
	}

	.popup {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-popup);
		max-width: 640px;
		width: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	.popup__header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.popup__node-type {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.popup__title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
		flex: 1;
	}

	.popup__close {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.popup__tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border-subtle);
		padding: 0 1.25rem;
	}

	.popup__tab {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.5rem 0.75rem;
		border: none;
		background: none;
		color: var(--color-text-muted);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: color 0.1s, border-color 0.1s;
	}

	.popup__tab.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.popup__body {
		padding: 1rem 1.25rem;
		overflow-y: auto;
		flex: 1;
	}

	.popup__panel { display: none; }
	.popup__panel.active { display: block; }

	/* Reference content styles */
	.ref-table {
		width: 100%;
		font-size: 0.8125rem;
		border-collapse: collapse;
	}

	.ref-table th {
		text-align: left;
		font-weight: 600;
		padding: 0.4rem 0.5rem;
		border-bottom: 2px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 0.75rem;
	}

	.ref-table td {
		padding: 0.35rem 0.5rem;
		border-bottom: 1px solid var(--color-border-subtle);
		color: var(--color-text);
	}

	.ref-list {
		padding-left: 1.25rem;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--color-text);
	}

	.ref-list-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 0.3rem;
	}

	.ref-text {
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--color-text);
	}

	.ref-source {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 0.5rem;
		font-style: italic;
	}

	.ref-alert {
		padding: 0.65rem 0.85rem;
		border-radius: var(--radius-sm);
		border-left: 3px solid;
		font-size: 0.8125rem;
	}

	.ref-alert--emergency { border-color: var(--color-emergency); background: var(--color-emergency-bg); }
	.ref-alert--urgent { border-color: var(--color-urgent); background: var(--color-urgent-bg); }
	.ref-alert--warning { border-color: var(--color-warning); background: var(--color-warning-bg); }
	.ref-alert--info { border-color: var(--color-info); background: var(--color-info-bg); }

	.ref-drug {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-primary);
		padding: 0.2rem 0;
	}

	.ref-dosing-note {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin-bottom: 0.4rem;
	}
</style>

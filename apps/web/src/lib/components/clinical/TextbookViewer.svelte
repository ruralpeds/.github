<script lang="ts">
	import type { TextbookSection, TextbookBlock, Reference } from '$lib/d3/tree-schema';
	import AlertBanner from './AlertBanner.svelte';

	export let section: TextbookSection;
	export let showReferences: boolean = true;

	let activeRefId: string | null = null;
</script>

<article class="textbook">
	<h1 class="textbook__title">{section.title}</h1>

	{#each section.blocks as block}
		{#if block.type === 'heading'}
			{#if block.level === 1}
				<h2 class="tb-h1">{block.text}</h2>
			{:else if block.level === 2}
				<h3 class="tb-h2">{block.text}</h3>
			{:else}
				<h4 class="tb-h3">{block.text}</h4>
			{/if}

		{:else if block.type === 'paragraph'}
			<p class="tb-para">{@html block.text}</p>

		{:else if block.type === 'list'}
			{#if block.ordered}
				<ol class="tb-list tb-list--ordered">
					{#each block.items as item}
						<li>{@html item}</li>
					{/each}
				</ol>
			{:else}
				<ul class="tb-list">
					{#each block.items as item}
						<li>{@html item}</li>
					{/each}
				</ul>
			{/if}

		{:else if block.type === 'table'}
			<div class="tb-table-wrap">
				<table class="tb-table">
					<thead>
						<tr>
							{#each block.headers as h}
								<th>{h}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each block.rows as row}
							<tr>
								{#each row as cell}
									<td>{@html cell}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
				{#if block.caption}
					<p class="tb-table-caption">{block.caption}</p>
				{/if}
			</div>

		{:else if block.type === 'alert'}
			<div class="tb-alert">
				<AlertBanner severity={block.severity} title={block.title}>
					{block.body}
				</AlertBanner>
			</div>

		{:else if block.type === 'keypoint'}
			<div class="tb-keypoint">
				<span class="keypoint-marker">KEY POINT</span>
				<p>{@html block.text}</p>
			</div>

		{:else if block.type === 'evidence'}
			<div class="tb-evidence">
				<span class="evidence-level">{block.level}</span>
				<div class="evidence-body">
					<p>{@html block.text}</p>
					<cite class="evidence-source">{block.source}</cite>
				</div>
			</div>
		{/if}
	{/each}

	<!-- References -->
	{#if showReferences && section.references.length > 0}
		<section class="tb-references">
			<h3 class="tb-h2">References</h3>
			<ol class="ref-list">
				{#each section.references as ref, i}
					<li class="ref-item" id="ref-{ref.id}">
						<span class="ref-authors">{ref.authors}</span>
						<span class="ref-title">{ref.title}.</span>
						<span class="ref-journal">{ref.journal}.</span>
						<span class="ref-year">{ref.year}.</span>
						{#if ref.doi}
							<a class="ref-doi" href="https://doi.org/{ref.doi}" target="_blank" rel="noopener">DOI</a>
						{/if}
						{#if ref.pmid}
							<a class="ref-pmid" href="https://pubmed.ncbi.nlm.nih.gov/{ref.pmid}" target="_blank" rel="noopener">PubMed</a>
						{/if}
						{#if ref.note}
							<span class="ref-note">{ref.note}</span>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/if}
</article>

<style>
	.textbook {
		max-width: 760px;
		font-family: var(--font-body);
		color: var(--color-text);
		line-height: var(--line-height-body);
	}

	.textbook__title {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		color: var(--color-text);
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--color-border-subtle);
	}

	.tb-h1 {
		font-family: var(--font-heading);
		font-size: 1.4rem;
		color: var(--color-text);
		margin: 2rem 0 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.tb-h2 {
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 1.5rem 0 0.5rem;
	}

	.tb-h3 {
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin: 1rem 0 0.4rem;
	}

	.tb-para {
		font-size: 0.9375rem;
		margin: 0.5rem 0;
		color: var(--color-text);
	}

	.tb-list {
		padding-left: 1.5rem;
		font-size: 0.9375rem;
		margin: 0.5rem 0;
	}

	.tb-list li {
		margin: 0.3rem 0;
	}

	.tb-table-wrap {
		margin: 1rem 0;
		overflow-x: auto;
	}

	.tb-table {
		width: 100%;
		font-size: 0.8125rem;
		border-collapse: collapse;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
	}

	.tb-table th {
		background-color: var(--color-surface-inset);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 2px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.tb-table td {
		padding: 0.4rem 0.75rem;
		border-bottom: 1px solid var(--color-border-subtle);
		color: var(--color-text);
	}

	.tb-table-caption {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 0.3rem;
	}

	.tb-alert {
		margin: 1rem 0;
	}

	.tb-keypoint {
		margin: 1rem 0;
		padding: 0.85rem 1rem;
		background-color: var(--color-info-bg);
		border-left: 4px solid var(--color-info);
		border-radius: var(--radius-sm);
	}

	.keypoint-marker {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-info);
		display: block;
		margin-bottom: 0.3rem;
	}

	.tb-keypoint p {
		font-size: 0.9375rem;
		margin: 0;
		color: var(--color-text);
	}

	.tb-evidence {
		display: flex;
		gap: 0.75rem;
		margin: 0.75rem 0;
		padding: 0.65rem 0.85rem;
		background-color: var(--color-surface-inset);
		border-radius: var(--radius-sm);
	}

	.evidence-level {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--color-accent);
		white-space: nowrap;
		padding-top: 0.1rem;
	}

	.evidence-body p {
		font-size: 0.875rem;
		margin: 0;
	}

	.evidence-source {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
		display: block;
		margin-top: 0.2rem;
	}

	/* References */
	.tb-references {
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 2px solid var(--color-border-subtle);
	}

	.ref-list {
		padding-left: 1.5rem;
		font-size: 0.8125rem;
	}

	.ref-item {
		margin: 0.5rem 0;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.ref-authors {
		font-weight: 500;
		color: var(--color-text);
	}

	.ref-title {
		font-style: italic;
	}

	.ref-journal {
		color: var(--color-text-muted);
	}

	.ref-year {
		color: var(--color-text-muted);
	}

	.ref-doi, .ref-pmid {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		margin-left: 0.35rem;
		padding: 0.05rem 0.3rem;
		border-radius: 3px;
		background: var(--color-surface-inset);
		color: var(--color-primary);
		text-decoration: none;
	}

	.ref-note {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 0.15rem;
		padding-left: 0.5rem;
		border-left: 2px solid var(--color-border-subtle);
	}

	@media print {
		.textbook__title { font-size: 1.5rem; }
		.tb-keypoint, .tb-evidence { break-inside: avoid; }
	}
</style>

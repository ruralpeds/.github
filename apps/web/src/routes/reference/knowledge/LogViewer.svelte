<script lang="ts">
	import { getLogs, getLogCount, clearLogs, exportLogsJSON, exportLogsCSV } from '$lib/knowledge/logger';
	import type { LogLevel, LogAction, KnowledgeLogEntry } from '$lib/knowledge/types';

	let filterLevel: LogLevel | '' = '';
	let filterAction: LogAction | '' = '';
	let filterSince = '';
	let displayLimit = 100;
	let expandedEntry: string | null = null;

	const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
	const LOG_ACTIONS: LogAction[] = [
		'item_created', 'item_updated', 'item_deleted', 'item_status_changed',
		'search_created', 'search_updated', 'search_deleted', 'search_executed', 'search_failed',
		'pubmed_fetch', 'pubmed_import', 'guideline_check',
		'export_performed', 'bulk_import', 'system_init', 'system_error',
	];

	$: logs = getLogs({
		level: filterLevel || undefined,
		action: filterAction || undefined,
		since: filterSince || undefined,
		limit: displayLimit,
	});

	$: totalCount = getLogCount();

	function handleClear() {
		if (confirm('Clear all knowledge logs? This cannot be undone.')) {
			clearLogs();
			logs = getLogs({ limit: displayLimit });
		}
	}

	function handleExport(format: 'json' | 'csv') {
		const content = format === 'json'
			? exportLogsJSON({ level: filterLevel || undefined, action: filterAction || undefined, since: filterSince || undefined })
			: exportLogsCSV({ level: filterLevel || undefined, action: filterAction || undefined, since: filterSince || undefined });
		const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `knowledge-logs-${new Date().toISOString().split('T')[0]}.${format}`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function refreshLogs() {
		logs = getLogs({
			level: filterLevel || undefined,
			action: filterAction || undefined,
			since: filterSince || undefined,
			limit: displayLimit,
		});
		totalCount = getLogCount();
	}

	function toggleExpand(id: string) {
		expandedEntry = expandedEntry === id ? null : id;
	}

	function formatTimestamp(iso: string): string {
		return new Date(iso).toLocaleString('en-US', {
			month: 'short', day: 'numeric', year: 'numeric',
			hour: '2-digit', minute: '2-digit', second: '2-digit',
		});
	}

	function levelIcon(level: LogLevel): string {
		switch (level) {
			case 'error': return 'ERR';
			case 'warn': return 'WRN';
			case 'info': return 'INF';
			case 'debug': return 'DBG';
		}
	}
</script>

<div class="log-viewer">
	<!-- Controls -->
	<div class="log-toolbar">
		<div class="log-filters">
			<select bind:value={filterLevel} on:change={refreshLogs} class="input input--select">
				<option value="">All Levels</option>
				{#each LOG_LEVELS as level}
					<option value={level}>{level.toUpperCase()}</option>
				{/each}
			</select>
			<select bind:value={filterAction} on:change={refreshLogs} class="input input--select">
				<option value="">All Actions</option>
				{#each LOG_ACTIONS as action}
					<option value={action}>{action.replace(/_/g, ' ')}</option>
				{/each}
			</select>
			<label class="inline-label">
				Since:
				<input type="date" bind:value={filterSince} on:change={refreshLogs} class="input input--date" />
			</label>
			<label class="inline-label">
				Show:
				<select bind:value={displayLimit} on:change={refreshLogs} class="input input--xs">
					<option value={50}>50</option>
					<option value={100}>100</option>
					<option value={500}>500</option>
					<option value={5000}>All</option>
				</select>
			</label>
			<button class="btn btn--ghost btn--sm" on:click={refreshLogs}>Refresh</button>
		</div>
		<div class="log-actions">
			<span class="log-count">{totalCount} total entries</span>
			<button class="btn btn--ghost btn--sm" on:click={() => handleExport('json')}>Export JSON</button>
			<button class="btn btn--ghost btn--sm" on:click={() => handleExport('csv')}>Export CSV</button>
			<button class="btn btn--danger btn--sm" on:click={handleClear}>Clear Logs</button>
		</div>
	</div>

	<!-- Log entries -->
	{#if logs.length === 0}
		<div class="empty">No log entries matching current filters.</div>
	{:else}
		<div class="log-list">
			{#each logs as entry (entry.id)}
				<div class="log-entry log-entry--{entry.level}">
					<button class="log-entry__row" on:click={() => toggleExpand(entry.id)}>
						<span class="log-level log-level--{entry.level}">{levelIcon(entry.level)}</span>
						<span class="log-time">{formatTimestamp(entry.timestamp)}</span>
						<span class="log-action">{entry.action.replace(/_/g, ' ')}</span>
						<span class="log-message">{entry.message}</span>
						{#if entry.itemId}<span class="log-ref">item:{entry.itemId.slice(0, 12)}</span>{/if}
						{#if entry.searchId}<span class="log-ref">search:{entry.searchId.slice(0, 12)}</span>{/if}
						<span class="log-expand">{expandedEntry === entry.id ? '▼' : '▶'}</span>
					</button>
					{#if expandedEntry === entry.id}
						<div class="log-details">
							<table class="detail-table">
								<tr><td class="dt-key">ID</td><td>{entry.id}</td></tr>
								<tr><td class="dt-key">Timestamp</td><td>{entry.timestamp}</td></tr>
								<tr><td class="dt-key">Level</td><td>{entry.level}</td></tr>
								<tr><td class="dt-key">Action</td><td>{entry.action}</td></tr>
								<tr><td class="dt-key">Message</td><td>{entry.message}</td></tr>
								{#if entry.itemId}<tr><td class="dt-key">Item ID</td><td>{entry.itemId}</td></tr>{/if}
								{#if entry.searchId}<tr><td class="dt-key">Search ID</td><td>{entry.searchId}</td></tr>{/if}
								<tr>
									<td class="dt-key">Details</td>
									<td><pre class="detail-json">{JSON.stringify(entry.details, null, 2)}</pre></td>
								</tr>
							</table>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if logs.length > 0 && logs.length >= displayLimit}
		<div class="load-more">
			Showing {logs.length} of {totalCount} entries.
			<button class="btn btn--ghost btn--sm" on:click={() => { displayLimit += 100; refreshLogs(); }}>Load More</button>
		</div>
	{/if}
</div>

<style>
	.log-viewer { display: flex; flex-direction: column; gap: 1rem; }
	.log-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; }
	.log-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
	.log-actions { display: flex; align-items: center; gap: 0.5rem; }
	.log-count { font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); }
	.inline-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-text-secondary, #64748b); }
	.input { padding: 0.375rem 0.625rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; color: var(--color-text, #1a1a2e); background: var(--color-bg, #fff); font-family: inherit; }
	.input:focus { outline: 2px solid var(--color-primary, #6366f1); outline-offset: -1px; }
	.input--select { width: auto; }
	.input--date { width: auto; }
	.input--xs { width: 80px; }
	.btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border: 1px solid transparent; border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.15s; font-family: inherit; }
	.btn--ghost { background: transparent; color: var(--color-text-secondary, #64748b); border-color: var(--color-border, #e2e8f0); }
	.btn--ghost:hover { background: var(--color-surface, #f8fafc); }
	.btn--danger { background: transparent; color: var(--color-emergency, #ef4444); border-color: var(--color-emergency, #ef4444); }
	.btn--sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
	.empty { text-align: center; padding: 2rem; color: var(--color-text-muted, #94a3b8); font-size: 0.875rem; }
	.log-list { display: flex; flex-direction: column; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); overflow: hidden; }
	.log-entry { border-bottom: 1px solid var(--color-border-subtle, #f1f5f9); }
	.log-entry:last-child { border-bottom: none; }
	.log-entry__row { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.375rem 0.625rem; background: none; border: none; cursor: pointer; text-align: left; font-family: var(--font-mono, monospace); font-size: 0.75rem; transition: background 0.1s; }
	.log-entry__row:hover { background: var(--color-surface, #f8fafc); }
	.log-level { display: inline-block; width: 2.5rem; text-align: center; font-weight: 700; font-size: 0.6875rem; padding: 0.0625rem 0.25rem; border-radius: 3px; flex-shrink: 0; }
	.log-level--error { color: #fff; background: var(--color-emergency, #ef4444); }
	.log-level--warn { color: #000; background: var(--color-warning, #f59e0b); }
	.log-level--info { color: #fff; background: var(--color-info, #3b82f6); }
	.log-level--debug { color: var(--color-text-muted, #94a3b8); background: var(--color-surface, #f1f5f9); }
	.log-time { color: var(--color-text-muted, #94a3b8); white-space: nowrap; flex-shrink: 0; width: 155px; }
	.log-action { color: var(--color-text-secondary, #64748b); font-weight: 600; white-space: nowrap; flex-shrink: 0; width: 130px; }
	.log-message { color: var(--color-text, #1a1a2e); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.log-ref { color: var(--color-text-muted, #94a3b8); font-size: 0.6875rem; flex-shrink: 0; }
	.log-expand { color: var(--color-text-muted, #94a3b8); font-size: 0.625rem; flex-shrink: 0; width: 1rem; text-align: center; }
	.log-details { padding: 0.75rem 1rem 0.75rem 3.75rem; background: var(--color-surface, #f8fafc); border-top: 1px solid var(--color-border-subtle, #f1f5f9); }
	.detail-table { font-size: 0.75rem; border-collapse: collapse; }
	.detail-table td { padding: 0.125rem 0.5rem 0.125rem 0; vertical-align: top; }
	.dt-key { font-weight: 600; color: var(--color-text-secondary, #64748b); white-space: nowrap; }
	.detail-json { margin: 0; font-size: 0.6875rem; color: var(--color-text-secondary, #64748b); white-space: pre-wrap; max-height: 200px; overflow-y: auto; background: var(--color-bg, #fff); padding: 0.375rem 0.5rem; border-radius: 4px; border: 1px solid var(--color-border, #e2e8f0); }
	.load-more { text-align: center; padding: 0.75rem; font-size: 0.8125rem; color: var(--color-text-muted, #94a3b8); }
</style>

<script lang="ts">
	import { activeErrors, dismissError, dismissAllErrors } from '$lib/stores/errors';

	const ERROR_LABELS: Record<string, string> = {
		VALIDATION_ERROR: 'Input Error',
		SERIALIZATION_ERROR: 'Data Error',
		COMPUTATION_ERROR: 'Calculation Error',
		NOT_IMPLEMENTED: 'Not Available',
		WASM_LOAD_ERROR: 'Engine Error',
		WASM_FUNCTION_NOT_FOUND: 'Missing Function',
		UNKNOWN: 'Error',
	};
</script>

{#if $activeErrors.length > 0}
	<div class="error-banner" role="alert" aria-live="polite">
		{#each $activeErrors as { id, error } (id)}
			<div class="error-banner__item" class:validation={error.isValidationError}>
				<span class="error-banner__code">{ERROR_LABELS[error.code] || error.code}</span>
				<span class="error-banner__msg">
					{error.message.replace(/^\[.*?\]\s*\w+:\s*/, '')}
				</span>
				<button
					class="error-banner__dismiss"
					on:click={() => dismissError(id)}
					aria-label="Dismiss error"
				>
					&times;
				</button>
			</div>
		{/each}
		{#if $activeErrors.length > 1}
			<button class="error-banner__clear" on:click={dismissAllErrors}>
				Dismiss all
			</button>
		{/if}
	</div>
{/if}

<style>
	.error-banner {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-emergency-bg, #fef2f2);
		border-bottom: 2px solid var(--color-emergency, #ef4444);
		font-family: var(--font-body);
		font-size: 0.8125rem;
	}

	.error-banner__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-banner__item.validation {
		border-left: 3px solid var(--color-warning, #f59e0b);
		padding-left: 0.5rem;
	}

	.error-banner__code {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--color-emergency, #ef4444);
		text-transform: uppercase;
		white-space: nowrap;
	}

	.error-banner__item.validation .error-banner__code {
		color: var(--color-warning, #f59e0b);
	}

	.error-banner__msg {
		flex: 1;
		color: var(--color-text);
	}

	.error-banner__dismiss {
		background: none;
		border: none;
		font-size: 1.1rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.error-banner__dismiss:hover {
		color: var(--color-text);
	}

	.error-banner__clear {
		align-self: flex-end;
		background: none;
		border: none;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		cursor: pointer;
		text-decoration: underline;
		padding: 0.15rem 0;
	}
</style>

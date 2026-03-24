<script lang="ts">
	/**
	 * AlertBanner — displays clinical alerts with severity color coding.
	 * Severity colors are consistent across all themes (patient safety).
	 */

	export let severity: 'emergency' | 'urgent' | 'warning' | 'stable' | 'info' = 'info';
	export let title: string = '';
	export let dismissible: boolean = false;

	let visible = true;

	const icons: Record<string, string> = {
		emergency: '🚨',
		urgent: '⚠️',
		warning: '⚡',
		stable: '✓',
		info: 'ℹ️'
	};

	function dismiss() {
		visible = false;
	}
</script>

{#if visible}
	<div
		class="alert alert--{severity}"
		role={severity === 'emergency' ? 'alert' : 'status'}
		aria-live={severity === 'emergency' ? 'assertive' : 'polite'}
	>
		<span class="alert__icon">{icons[severity]}</span>
		<div class="alert__content">
			{#if title}
				<strong class="alert__title">{title}</strong>
			{/if}
			<div class="alert__body">
				<slot />
			</div>
		</div>
		{#if dismissible}
			<button class="alert__close" on:click={dismiss} aria-label="Dismiss alert">×</button>
		{/if}
	</div>
{/if}

<style>
	.alert {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		border-left: 4px solid;
		font-family: var(--font-body);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.alert--emergency {
		background-color: var(--color-emergency-bg);
		border-left-color: var(--color-emergency);
		color: var(--color-emergency);
	}
	.alert--urgent {
		background-color: var(--color-urgent-bg);
		border-left-color: var(--color-urgent);
		color: var(--color-urgent);
	}
	.alert--warning {
		background-color: var(--color-warning-bg);
		border-left-color: var(--color-warning);
		color: var(--color-warning);
	}
	.alert--stable {
		background-color: var(--color-stable-bg);
		border-left-color: var(--color-stable);
		color: var(--color-stable);
	}
	.alert--info {
		background-color: var(--color-info-bg);
		border-left-color: var(--color-info);
		color: var(--color-info);
	}

	.alert__icon {
		font-size: 1.1rem;
		flex-shrink: 0;
		margin-top: 0.05rem;
	}

	.alert__content {
		flex: 1;
	}

	.alert__title {
		display: block;
		font-weight: 600;
		margin-bottom: 0.15rem;
	}

	.alert__body {
		color: var(--color-text-secondary);
	}

	.alert__close {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		opacity: 0.6;
		transition: opacity 0.15s;
		line-height: 1;
	}

	.alert__close:hover {
		opacity: 1;
	}
</style>

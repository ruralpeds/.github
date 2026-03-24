<script lang="ts">
	import { onMount } from 'svelte';

	let online = true;

	onMount(() => {
		online = navigator.onLine;

		const setOnline = () => (online = true);
		const setOffline = () => (online = false);

		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);

		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOffline);
		};
	});
</script>

{#if !online}
	<div class="offline-badge" role="status" aria-live="polite">
		<span class="offline-dot"></span>
		Offline
	</div>
{/if}

<style>
	.offline-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-warning);
		padding: 0.2rem 0.6rem;
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-full);
		background-color: var(--color-warning-bg);
	}

	.offline-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--color-warning);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}
</style>

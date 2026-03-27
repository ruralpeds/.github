<script lang="ts">
	import AlertBanner from '$lib/components/clinical/AlertBanner.svelte';
	import { clinicalMode } from '$lib/stores/mode';
	import { loadPatient, patient, hasPatient, weightDisplay, ageDisplay } from '$lib/stores/patient';

	// Quick-access clinical domains
	const domains = [
		{ label: 'Resuscitation', icon: '⚡', href: '/resuscitation', desc: 'PALS, NRP, medication dosing, defibrillation' },
		{ label: 'Airway', icon: '🫁', href: '/airway', desc: 'RSI, difficult airway, equipment sizing' },
		{ label: 'Sepsis', icon: '🩸', href: '/sepsis', desc: 'Sepsis pathway, fluids, antibiotics' },
		{ label: 'Neonatal', icon: '👶', href: '/neonatal', desc: 'Level II protocols, IVF matrix, growth charts' },
		{ label: 'Cardiac', icon: '❤️', href: '/cardiac', desc: 'Arrhythmias, cardioversion' },
		{ label: 'Trauma', icon: '🚑', href: '/trauma', desc: 'Assessment, blood products, burns' },
		{ label: 'Transport', icon: '🗺️', href: '/transport', desc: 'Facility mapping, transport decisions' },
		{ label: 'Reference', icon: '📋', href: '/reference', desc: 'Decision trees, calculators, education guides' },
	];

	// ── Patient entry form ──────────────────────────────────────────
	let weightInput = '';
	let ageInput = '';
	let gaWeekInput = '';
	let dolInput = '';
	let sexInput: 'male' | 'female' = 'male';
	let loading = false;
	let loadError = '';

	$: isNeonatal = $clinicalMode === 'neonatal';

	async function handleLoadPatient() {
		const weightKg = parseFloat(weightInput);
		const ageMonths = parseInt(ageInput) || 0;
		if (!weightKg || weightKg <= 0) {
			loadError = 'Enter a valid weight';
			return;
		}
		loadError = '';
		loading = true;
		try {
			await loadPatient({
				weightKg,
				ageMonths,
				sex: sexInput,
				gestationalWeeks: gaWeekInput ? parseInt(gaWeekInput) : null,
				dayOfLife: dolInput ? parseInt(dolInput) : null,
			});
		} catch (e: any) {
			loadError = e?.message ?? 'Failed to load patient';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleLoadPatient();
	}
</script>

<svelte:head>
	<title>Pediatric Emergency CDS</title>
</svelte:head>

<div class="home">
	<section class="hero">
		<h1>Pediatric Emergency Medicine</h1>
		<p class="hero__subtitle">Clinical Decision Support for the Rural Emergency Department</p>
	</section>

	<AlertBanner severity="info" dismissible>
		All clinical calculators work offline. Install this app for uninterrupted access.
	</AlertBanner>

	<section class="domains">
		<h2 class="section-title">Clinical Domains</h2>
		<div class="domain-grid">
			{#each domains as domain}
				<a href={domain.href} class="domain-card">
					<span class="domain-card__icon">{domain.icon}</span>
					<div class="domain-card__content">
						<h3 class="domain-card__title">{domain.label}</h3>
						<p class="domain-card__desc">{domain.desc}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="quick-entry">
		<h2 class="section-title">Quick Patient Entry</h2>

		{#if $hasPatient}
			<!-- Patient loaded banner -->
			<div class="patient-loaded">
				<div class="patient-loaded-left">
					<span class="patient-chip">👤 Patient Loaded</span>
					<span class="patient-summary">{$weightDisplay} · {$ageDisplay}</span>
				</div>
				<div class="patient-loaded-right">
					<a href="/resuscitation" class="btn btn--primary">→ Resuscitation</a>
					{#if $clinicalMode === 'neonatal'}
						<a href="/neonatal" class="btn btn--secondary">→ Neonatal</a>
					{/if}
				</div>
			</div>
		{/if}

		<div class="weight-entry">
			<label class="input-group">
				<span class="input-label">Weight</span>
				<div class="input-row">
					<input
						type="number"
						bind:value={weightInput}
						on:keydown={handleKeydown}
						placeholder={isNeonatal ? 'grams' : 'kg'}
						min={isNeonatal ? '100' : '0.3'}
						max={isNeonatal ? '8000' : '150'}
						step={isNeonatal ? '10' : '0.1'}
						class="input-field"
					/>
					<span class="input-unit">{isNeonatal ? 'g' : 'kg'}</span>
				</div>
			</label>

			{#if isNeonatal}
				<label class="input-group">
					<span class="input-label">GA at Birth</span>
					<div class="input-row">
						<input type="number" bind:value={gaWeekInput} on:keydown={handleKeydown}
							placeholder="wks" min="22" max="42" step="1" class="input-field" style="width:80px" />
						<span class="input-unit">wks</span>
					</div>
				</label>
				<label class="input-group">
					<span class="input-label">Day of Life</span>
					<div class="input-row">
						<input type="number" bind:value={dolInput} on:keydown={handleKeydown}
							placeholder="0" min="0" max="365" step="1" class="input-field" style="width:80px" />
						<span class="input-unit">DOL</span>
					</div>
				</label>
			{:else}
				<label class="input-group">
					<span class="input-label">Age</span>
					<div class="input-row">
						<input type="number" bind:value={ageInput} on:keydown={handleKeydown}
							placeholder="months" min="0" max="216" step="1" class="input-field" />
						<span class="input-unit">mo</span>
					</div>
				</label>
			{/if}

			<label class="input-group">
				<span class="input-label">Sex</span>
				<select bind:value={sexInput} class="input-field input-select">
					<option value="male">Male</option>
					<option value="female">Female</option>
				</select>
			</label>

			<button class="btn btn--primary" on:click={handleLoadPatient} disabled={loading}>
				{loading ? 'Loading…' : 'Load Patient'}
			</button>
		</div>

		{#if loadError}
			<p class="load-error">⚠ {loadError}</p>
		{/if}

		<p class="weight-note">
			Weight and age auto-populate all calculators and decision trees during this session.
		</p>
	</section>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.hero {
		padding: 1.5rem 0 0.5rem;
	}

	.hero h1 {
		font-size: 1.75rem;
		color: var(--color-text);
	}

	.hero__subtitle {
		font-size: 1rem;
		color: var(--color-text-muted);
		margin-top: 0.35rem;
	}

	.section-title {
		font-size: 1.1rem;
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
		font-family: var(--font-body);
		font-weight: 600;
	}

	/* Domain grid */
	.domain-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.75rem;
	}

	.domain-card {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		padding: 1rem 1.15rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.domain-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.domain-card__icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.domain-card__title {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.2rem;
	}

	.domain-card__desc {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	/* Quick entry */
	.weight-entry {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.input-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.input-field {
		width: 100px;
		padding: 0.5rem 0.65rem;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface);
		color: var(--color-text);
		transition: border-color 0.15s ease;
	}

	.input-field:focus {
		border-color: var(--color-primary);
		outline: none;
		box-shadow: 0 0 0 2px var(--color-focus-ring);
	}

	.input-unit {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.btn {
		padding: 0.5rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.btn--primary {
		background-color: var(--color-primary);
		color: var(--color-primary-text);
	}

	.btn--primary:hover {
		background-color: var(--color-primary-hover);
	}

	.weight-note {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin-top: 0.5rem;
	}

	/* Patient loaded state */
	.patient-loaded {
		display: flex; align-items: center; justify-content: space-between;
		gap: 0.75rem; flex-wrap: wrap; padding: 0.75rem 1rem; margin-bottom: 0.75rem;
		background: color-mix(in srgb, var(--color-success, #22c55e) 8%, var(--color-surface));
		border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 30%, transparent);
		border-radius: var(--radius-sm);
	}
	.patient-loaded-left { display: flex; align-items: center; gap: 0.75rem; }
	.patient-loaded-right { display: flex; gap: 0.5rem; }
	.patient-chip {
		font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600;
		padding: 0.18rem 0.6rem;
		background: color-mix(in srgb, var(--color-success, #22c55e) 15%, transparent);
		color: var(--color-success, #22c55e);
		border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 40%, transparent);
		border-radius: 4px;
	}
	.patient-summary {
		font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-text-secondary);
	}
	.input-select {
		font-family: var(--font-body); cursor: pointer;
		background: var(--color-surface); color: var(--color-text);
	}
	.btn--secondary {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}
	.btn--secondary:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.load-error {
		font-size: 0.8rem; color: var(--color-error, #f87171); margin-top: 0.35rem;
	}
</style>

<script lang="ts">
	import { clinicalMode, modeConfig, clearMode, MODE_CONFIGS } from '$lib/stores/mode';
	import { patient, hasPatient, weightDisplay, ageDisplay, brosColor, loadPatient, clearPatient } from '$lib/stores/patient';
	import type { ClinicalMode } from '$lib/stores/mode';

	let weightInput: number;
	let ageInput: number;
	let sexInput: 'male' | 'female' = 'male';
	let gaWeeks: number = 39;
	let gaDays: number = 0;
	let dayOfLife: number = 0;
	let expanded = false;

	// Initialize inputs from current mode defaults
	$: if ($modeConfig && !$hasPatient) {
		weightInput = $modeConfig.weightRange.defaultKg;
		ageInput = $modeConfig.ageRange.defaultMonths;
	}

	$: isNeonatal = $clinicalMode === 'neonatal';
	$: config = $modeConfig;
	$: broselow = $brosColor;

	// Broselow color hex for badge
	const BROSELOW_HEX: Record<string, string> = {
		'Grey (Newborn)': '#9CA3AF',
		'Pink': '#F472B6',
		'Red': '#EF4444',
		'Purple': '#A855F7',
		'Yellow': '#EAB308',
		'White': '#E5E7EB',
		'Blue': '#3B82F6',
		'Orange': '#F97316',
		'Green': '#22C55E',
		'Adult': '#6B7280',
	};

	async function handleSubmit() {
		if (!config) return;
		await loadPatient({
			weightKg: weightInput,
			ageMonths: isNeonatal ? 0 : ageInput,
			sex: sexInput,
			gestationalWeeks: isNeonatal ? gaWeeks : null,
			gestationalDays: isNeonatal ? gaDays : null,
			dayOfLife: isNeonatal ? dayOfLife : null,
		});
		expanded = false;
	}

	function handleClear() {
		clearPatient();
		expanded = true;
	}

	function switchMode() {
		clearPatient();
		clearMode();
	}
</script>

<div class="banner" class:banner--loaded={$hasPatient}>
	{#if $hasPatient && !expanded}
		<!-- Compact view: show patient summary -->
		<div class="banner__summary">
			<div class="banner__mode-badge" class:neonatal={isNeonatal}>
				{$modeConfig?.icon}
				{$modeConfig?.shortLabel}
			</div>

			<div class="banner__stat">
				<span class="stat-label">Weight</span>
				<span class="stat-value">{$weightDisplay}</span>
			</div>

			<div class="banner__stat">
				<span class="stat-label">Age</span>
				<span class="stat-value">{$ageDisplay}</span>
			</div>

			<div class="banner__stat">
				<span class="stat-label">Sex</span>
				<span class="stat-value">{$patient.sex === 'male' ? 'M' : 'F'}</span>
			</div>

			{#if isNeonatal && $patient.gestationalWeeks}
				<div class="banner__stat">
					<span class="stat-label">GA</span>
					<span class="stat-value">{$patient.gestationalWeeks}+{$patient.gestationalDays || 0}</span>
				</div>
			{/if}

			{#if broselow && !isNeonatal}
				<div class="banner__broselow" style="--bros-color: {BROSELOW_HEX[broselow] || '#6B7280'}">
					<span class="bros-dot"></span>
					{broselow}
				</div>
			{/if}

			{#if $patient.classification}
				<div class="banner__equip">
					ETT {$patient.classification.ett_size} · {$patient.classification.ett_depth_cm} cm
				</div>
			{/if}

			<div class="banner__actions">
				<button class="btn-edit" on:click={() => (expanded = true)}>Edit</button>
				<button class="btn-clear" on:click={handleClear}>Clear</button>
			</div>
		</div>
	{:else}
		<!-- Expanded view: data entry form -->
		<div class="banner__form">
			<div class="banner__mode-badge" class:neonatal={isNeonatal}>
				{$modeConfig?.icon}
				{$modeConfig?.shortLabel}
				<button class="btn-switch" on:click={switchMode}>Switch</button>
			</div>

			<div class="form-fields">
				<!-- Weight -->
				<label class="field">
					<span class="field-label">Weight</span>
					<div class="field-input-row">
						<input
							type="number"
							bind:value={weightInput}
							min={config?.weightRange.minKg}
							max={config?.weightRange.maxKg}
							step={config?.weightRange.stepKg}
							class="field-input"
						/>
						<span class="field-unit">{config?.weightUnit === 'g' ? 'kg' : 'kg'}</span>
					</div>
				</label>

				{#if isNeonatal}
					<!-- Gestational Age -->
					<label class="field">
						<span class="field-label">GA (weeks)</span>
						<div class="field-input-row">
							<input type="number" bind:value={gaWeeks} min="22" max="44" step="1" class="field-input field-input--narrow" />
							<span class="field-unit">+</span>
							<input type="number" bind:value={gaDays} min="0" max="6" step="1" class="field-input field-input--xs" />
							<span class="field-unit">d</span>
						</div>
					</label>

					<!-- Day of Life -->
					<label class="field">
						<span class="field-label">Day of Life</span>
						<div class="field-input-row">
							<input type="number" bind:value={dayOfLife} min="0" max="28" step="1" class="field-input field-input--narrow" />
						</div>
					</label>
				{:else}
					<!-- Age (pediatric) -->
					<label class="field">
						<span class="field-label">Age</span>
						<div class="field-input-row">
							<input
								type="number"
								bind:value={ageInput}
								min={config?.ageRange.minMonths}
								max={config?.ageRange.maxMonths}
								step="1"
								class="field-input"
							/>
							<span class="field-unit">months</span>
						</div>
					</label>
				{/if}

				<!-- Sex -->
				<label class="field">
					<span class="field-label">Sex</span>
					<div class="field-input-row">
						<select bind:value={sexInput} class="field-select">
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>
				</label>

				<button class="btn-load" on:click={handleSubmit}>
					Load Patient
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.banner {
		background-color: var(--color-surface-inset);
		border-bottom: 1px solid var(--color-border-subtle);
		padding: 0.5rem 1.25rem;
		font-family: var(--font-body);
		transition: background-color 0.15s ease;
	}

	.banner--loaded {
		background-color: var(--color-surface);
	}

	/* ---- Summary (compact) ---- */
	.banner__summary {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	.banner__mode-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-full);
		background-color: var(--color-info-bg);
		color: var(--color-info);
		border: 1px solid var(--color-info);
	}

	.banner__mode-badge.neonatal {
		background-color: var(--color-urgent-bg);
		color: var(--color-urgent);
		border-color: var(--color-urgent);
	}

	.banner__stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.05rem;
	}

	.stat-label {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.banner__broselow {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.bros-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--bros-color);
		border: 1px solid var(--color-border);
	}

	.banner__equip {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background-color: var(--color-surface-inset);
		padding: 0.15rem 0.5rem;
		border-radius: var(--radius-sm);
	}

	.banner__actions {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}

	.btn-edit, .btn-clear, .btn-switch {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: border-color 0.1s, color 0.1s;
	}

	.btn-edit:hover, .btn-clear:hover, .btn-switch:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	/* ---- Form (expanded) ---- */
	.banner__form {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.form-fields {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		flex-wrap: wrap;
		flex: 1;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.field-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted);
	}

	.field-input-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.field-input {
		width: 80px;
		padding: 0.35rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.field-input--narrow {
		width: 55px;
	}

	.field-input--xs {
		width: 40px;
	}

	.field-input:focus {
		border-color: var(--color-primary);
		outline: none;
		box-shadow: 0 0 0 2px var(--color-focus-ring);
	}

	.field-unit {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.field-select {
		padding: 0.35rem 0.5rem;
		font-family: var(--font-body);
		font-size: 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
	}

	.btn-load {
		padding: 0.35rem 1rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		border: none;
		border-radius: var(--radius-sm);
		background-color: var(--color-primary);
		color: var(--color-primary-text);
		cursor: pointer;
		white-space: nowrap;
		transition: background-color 0.15s;
	}

	.btn-load:hover {
		background-color: var(--color-primary-hover);
	}

	.btn-switch {
		margin-left: 0.25rem;
	}

	@media (max-width: 640px) {
		.form-fields {
			flex-direction: column;
			align-items: stretch;
		}
		.banner__summary {
			gap: 0.75rem;
		}
	}
</style>

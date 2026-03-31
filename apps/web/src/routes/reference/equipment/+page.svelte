<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	// Broselow-based equipment sizing reference
	const sizeTable = [
		{ weight: '3–5 kg',   color: 'Grey/Pink',  ett: '3.5 uncuffed', blade: 'Miller 0–1', lma: '1',   cric: '14–16G', ngFr: '5–8',  foley: '6–8',  chest: '10–14' },
		{ weight: '6–7 kg',   color: 'Red',        ett: '3.5 uncuffed', blade: 'Miller 1',   lma: '1.5', cric: '14–16G', ngFr: '8',    foley: '8',    chest: '14–16' },
		{ weight: '8–9 kg',   color: 'Purple',     ett: '4.0 uncuffed', blade: 'Miller 1',   lma: '1.5', cric: '14G',    ngFr: '8',    foley: '8',    chest: '16–18' },
		{ weight: '10–11 kg', color: 'Yellow',     ett: '4.0 uncuffed', blade: 'Miller 1',   lma: '2',   cric: '14G',    ngFr: '10',   foley: '10',   chest: '16–20' },
		{ weight: '12–14 kg', color: 'White',      ett: '4.5 uncuffed', blade: 'Mac 2',      lma: '2',   cric: '14G',    ngFr: '10',   foley: '10',   chest: '18–22' },
		{ weight: '15–18 kg', color: 'Blue',       ett: '5.0 uncuffed', blade: 'Mac 2',      lma: '2.5', cric: '14G',    ngFr: '10',   foley: '10',   chest: '20–24' },
		{ weight: '19–23 kg', color: 'Orange',     ett: '5.5 uncuffed', blade: 'Mac 2',      lma: '2.5', cric: '14G',    ngFr: '12',   foley: '10',   chest: '22–26' },
		{ weight: '24–29 kg', color: 'Green',      ett: '6.0 cuffed',   blade: 'Mac 3',      lma: '3',   cric: '12G',    ngFr: '12',   foley: '12',   chest: '24–28' },
		{ weight: '30–36 kg', color: 'Tan/Brown',  ett: '6.5 cuffed',   blade: 'Mac 3',      lma: '3',   cric: '12G',    ngFr: '14',   foley: '12',   chest: '28–32' },
		{ weight: '37–50 kg', color: 'Large',      ett: '7.0 cuffed',   blade: 'Mac 3',      lma: '4',   cric: '12G',    ngFr: '14',   foley: '14',   chest: '32–36' },
		{ weight: '> 50 kg',  color: 'Adult',      ett: '7.5–8.0 cuffed', blade: 'Mac 3–4', lma: '4–5', cric: '14G',   ngFr: '16–18', foley: '14–16', chest: '36–40' },
	];

	const ivCatheter = [
		{ weight: '< 5 kg', size: '24G', note: 'Hand or foot veins; scalp veins in neonates' },
		{ weight: '5–20 kg', size: '22–24G', note: 'Antecubital, dorsum of hand, saphenous' },
		{ weight: '20–50 kg', size: '20–22G', note: 'Standard peripheral sites' },
		{ weight: '> 50 kg', size: '18–20G (trauma: 14–16G)', note: 'Adult sites; IO if no peripheral access in 60–90 s' },
	];

	const ioCatheter = [
		{ site: 'Proximal tibia (< 6 yr)', landmark: '2 cm below tibial tuberosity on anteromedial surface', size: '15G (EZ-IO red), 15mm needle' },
		{ site: 'Proximal tibia (≥ 6 yr)', landmark: 'Same site', size: '15G (EZ-IO blue), 25mm needle' },
		{ site: 'Distal femur', landmark: '3 cm above patella on midline anterior surface', size: '15–45mm EZ-IO needle' },
		{ site: 'Humeral head (> 40 kg)', landmark: 'Surgical neck of humerus (adduct arm, elbow flexed)', size: '25–45mm EZ-IO needle' },
	];

	$: weightKg = $patient?.weightKg ?? null;

	function getRow(w: number | null) {
		if (!w) return null;
		if (w <= 5) return sizeTable[0];
		if (w <= 7) return sizeTable[1];
		if (w <= 9) return sizeTable[2];
		if (w <= 11) return sizeTable[3];
		if (w <= 14) return sizeTable[4];
		if (w <= 18) return sizeTable[5];
		if (w <= 23) return sizeTable[6];
		if (w <= 29) return sizeTable[7];
		if (w <= 36) return sizeTable[8];
		if (w <= 50) return sizeTable[9];
		return sizeTable[10];
	}

	$: row = getRow(weightKg);
</script>

<svelte:head><title>Equipment Sizing Reference — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Equipment Sizing Reference</h1>
		<p class="subtitle">Broselow tape · ETT · LMA · IV/IO catheters · NG tubes · Chest tubes</p>
		{#if $hasPatient && row}
			<div class="patient-banner">
				<span class="banner-label">{$weightDisplay} ({row.color}):</span>
				<span class="banner-item">ETT {row.ett}</span>
				<span class="sep">·</span>
				<span class="banner-item">Blade {row.blade}</span>
				<span class="sep">·</span>
				<span class="banner-item">LMA {row.lma}</span>
				<span class="sep">·</span>
				<span class="banner-item">NG {row.ngFr} Fr</span>
				<span class="sep">·</span>
				<span class="banner-item">Chest {row.chest} Fr</span>
			</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">Equipment by Weight (Broselow-based)</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>Weight</th><th>Color</th><th>ETT</th><th>Blade</th><th>LMA</th><th>Cric (needle)</th><th>NG (Fr)</th><th>Foley (Fr)</th><th>Chest (Fr)</th></tr>
				</thead>
				<tbody>
					{#each sizeTable as r}
						<tr class:active-row={row === r}>
							<td class="bold-cell">{r.weight}</td>
							<td class="note-cell">{r.color}</td>
							<td class="mono-cell">{r.ett}</td>
							<td class="mono-cell">{r.blade}</td>
							<td class="mono-cell">{r.lma}</td>
							<td class="mono-cell">{r.cric}</td>
							<td class="mono-cell">{r.ngFr}</td>
							<td class="mono-cell">{r.foley}</td>
							<td class="mono-cell">{r.chest}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<div class="two-col">
		<section>
			<h2 class="section-title">IV Catheter Size by Weight</h2>
			<div class="list-table">
				{#each ivCatheter as r}
					<div class="list-row">
						<span class="list-label">{r.weight}</span>
						<span class="list-val">{r.size}</span>
						<span class="list-note">{r.note}</span>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="section-title">Intraosseous Access Sites</h2>
			<div class="io-list">
				{#each ioCatheter as r}
					<div class="io-card">
						<div class="io-site">{r.site}</div>
						<div class="io-landmark">{r.landmark}</div>
						<div class="io-size">{r.size}</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.patient-banner { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-top: 0.6rem; padding: 0.45rem 0.85rem; background: color-mix(in srgb, var(--color-success, #22c55e) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 30%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; }
	.banner-label { font-weight: 700; color: var(--color-success, #22c55e); }
	.banner-item { color: var(--color-text); }
	.sep { color: var(--color-text-muted); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.45rem 0.7rem; text-align: left; font-size: 0.7rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table tr:last-child td { border-bottom: none; }
	.active-row td { background: color-mix(in srgb, var(--color-primary) 8%, transparent); }
	.active-row .bold-cell { color: var(--color-primary); }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); white-space: nowrap; }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); }
	.two-col { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
	.list-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.list-row { display: grid; grid-template-columns: 110px 80px 1fr; gap: 0.5rem; padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); }
	.list-row:last-child { border-bottom: none; }
	.list-row:nth-child(odd) { background: var(--color-surface); }
	.list-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.list-val { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-primary); font-weight: 600; }
	.list-note { font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; }
	.io-list { display: flex; flex-direction: column; gap: 0.4rem; }
	.io-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.65rem 0.9rem; }
	.io-site { font-size: 0.83rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.io-landmark { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.4; }
	.io-size { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-primary); margin-top: 0.2rem; }
</style>

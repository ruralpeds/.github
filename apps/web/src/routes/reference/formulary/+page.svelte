<script lang="ts">
	const categories = [
		{
			category: 'Analgesics / Sedatives',
			drugs: [
				{ name: 'Morphine', dose: '0.05–0.1 mg/kg IV/IM q2–4h', max: '10 mg/dose', notes: 'Titrate; have naloxone available' },
				{ name: 'Fentanyl', dose: '1–2 mcg/kg IV over 3–5 min', max: '100 mcg/dose', notes: 'Rapid onset; chest wall rigidity with fast push' },
				{ name: 'Ketamine (dissociative)', dose: '1–2 mg/kg IV; 4–5 mg/kg IM', max: '—', notes: 'Bronchodilator; maintains airway tone; use with antisialagogue' },
				{ name: 'Midazolam', dose: '0.05–0.1 mg/kg IV; 0.2 mg/kg IN/IM', max: '5 mg', notes: 'Reverse with flumazenil 0.01 mg/kg' },
				{ name: 'Lorazepam', dose: '0.05–0.1 mg/kg IV/IM', max: '4 mg', notes: 'Longer duration than midazolam' },
				{ name: 'Acetaminophen', dose: '10–15 mg/kg PO/PR q4–6h; 15 mg/kg IV q6h', max: '75 mg/kg/day or 5 doses/day', notes: 'Max 1 g IV per dose; 4 g/day adult' },
				{ name: 'Ibuprofen', dose: '5–10 mg/kg PO q6–8h', max: '40 mg/kg/day or 2.4 g/day', notes: 'Avoid < 6 months; caution with renal/GI disease' },
				{ name: 'Ketorolac', dose: '0.5 mg/kg IV/IM', max: '30 mg IM; 15 mg IV', notes: 'Max 5 days; avoid in renal impairment, bleeding risk' },
			],
		},
		{
			category: 'Anticonvulsants',
			drugs: [
				{ name: 'Lorazepam (seizure)', dose: '0.1 mg/kg IV/IO', max: '4 mg', notes: 'First-line benzodiazepine; repeat once if needed' },
				{ name: 'Midazolam (seizure IM/IN)', dose: '0.2 mg/kg IM or IN', max: '10 mg', notes: 'Preferred if no IV access' },
				{ name: 'Fosphenytoin', dose: 'Loading: 20 mg PE/kg IV at 3 mg PE/kg/min', max: '1500 mg PE', notes: 'Monitor BP/ECG during load; PE = phenytoin equivalents' },
				{ name: 'Levetiracetam', dose: 'Loading: 60 mg/kg IV over 15 min', max: '4500 mg', notes: 'Preferred second-line; minimal drug interactions' },
				{ name: 'Phenobarbital', dose: 'Loading: 20 mg/kg IV at 1 mg/kg/min', max: '1000 mg', notes: 'Neonatal seizures first-line; respiratory depression risk' },
				{ name: 'Valproate', dose: 'Loading: 20–40 mg/kg IV over 5 min', max: '3000 mg', notes: 'Avoid < 2 yr (hepatotoxicity); check ammonia' },
			],
		},
		{
			category: 'Antimicrobials (common)',
			drugs: [
				{ name: 'Amoxicillin', dose: '25–50 mg/kg/day ÷ q8–12h PO', max: '500 mg/dose (standard); 875 mg/dose (high-dose AOM)', notes: '' },
				{ name: 'Azithromycin', dose: '10 mg/kg day 1, then 5 mg/kg days 2–5 PO', max: '500 mg day 1; 250 mg days 2–5', notes: 'Community-acquired pneumonia, pertussis, atypical organisms' },
				{ name: 'Ceftriaxone', dose: '50–100 mg/kg/day IV/IM ÷ q12–24h', max: '2 g/dose', notes: 'Avoid < 28 days (hyperbilirubinemia risk)' },
				{ name: 'Clindamycin', dose: '25–40 mg/kg/day IV ÷ q6–8h; 8–16 mg/kg/day PO ÷ q6–8h', max: '2.7 g/day IV', notes: 'MRSA skin/soft tissue; C. diff risk' },
				{ name: 'TMP-SMX', dose: '8–12 mg/kg/day TMP ÷ q12h PO', max: '320 mg TMP/day', notes: 'MRSA soft tissue (CA-MRSA); UTI' },
				{ name: 'Metronidazole', dose: '30–35 mg/kg/day IV ÷ q8h; 35–50 mg/kg/day PO ÷ q8h', max: '4 g/day', notes: 'Anaerobic/intra-abdominal coverage; C. diff' },
				{ name: 'Acyclovir (IV)', dose: 'Neonatal HSV: 60 mg/kg/day ÷ q8h; Encephalitis: 30–45 mg/kg/day ÷ q8h', max: '—', notes: 'Ensure good hydration; nephrotoxic' },
			],
		},
		{
			category: 'Respiratory',
			drugs: [
				{ name: 'Albuterol nebulized', dose: '2.5 mg (0–20 kg); 5 mg (> 20 kg) q20 min × 3 then q1–4h', max: 'Continuous neb: 0.15–0.3 mg/kg/h', notes: 'MDI: 4–8 puffs with spacer equivalent to neb' },
				{ name: 'Ipratropium nebulized', dose: '0.25–0.5 mg q20 min × 3 (moderate–severe asthma)', max: '0.5 mg/dose', notes: 'Add to albuterol in first hour of severe asthma' },
				{ name: 'Dexamethasone (asthma)', dose: '0.6 mg/kg PO × 1 (single or 2-day course)', max: '16 mg', notes: 'Non-inferior to prednisolone 5-day course; better compliance' },
				{ name: 'Epinephrine racemic (croup)', dose: '0.5 mL of 2.25% (racemic) in 3 mL NS neb; or epi 1:1000 0.5 mL/kg (max 5 mL) neb', max: '—', notes: 'Observe for rebound × 3–4 h after treatment' },
				{ name: 'Budesonide neb (croup)', dose: '2 mg neb × 1 (moderate croup)', max: '2 mg', notes: 'Alternative to oral dexamethasone if vomiting' },
			],
		},
		{
			category: 'GI / Antiemetics',
			drugs: [
				{ name: 'Ondansetron', dose: '0.15 mg/kg IV/IM; 4 mg ODT (< 15 kg) or 8 mg (≥ 15 kg) PO', max: '8 mg/dose', notes: 'Check QTc before IV use' },
				{ name: 'Ranitidine (zantac)', dose: '1 mg/kg IV q8h; 2 mg/kg PO q12h', max: '50 mg IV; 300 mg/day PO', notes: 'Replaced largely by omeprazole/PPIs' },
				{ name: 'Omeprazole', dose: '0.7–1 mg/kg/day PO (infant); 1–2 mg/kg/day PO (child)', max: '20–40 mg/day', notes: 'GERD/erosive esophagitis; IV available for hospitalised' },
				{ name: 'Lactulose', dose: '1–3 mL/kg/day ÷ q12–24h PO (constipation)', max: '60 mL/day', notes: 'Also used for hepatic encephalopathy: 0.5 mL/kg q8h' },
			],
		},
	];

	let searchTerm = '';
	$: filtered = searchTerm.trim()
		? categories.map(cat => ({
				...cat,
				drugs: cat.drugs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || cat.category.toLowerCase().includes(searchTerm.toLowerCase())),
			})).filter(cat => cat.drugs.length > 0)
		: categories;
</script>

<svelte:head><title>Drug Formulary — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Pediatric Drug Formulary</h1>
		<p class="subtitle">Common emergency and inpatient medications · Weight-based dosing · Quick reference</p>
	</div>

	<div class="search-row">
		<input
			type="search"
			bind:value={searchTerm}
			placeholder="Search drugs or categories…"
			class="search-input"
		/>
	</div>

	{#each filtered as cat}
		<section class="drug-cat">
			<h2 class="cat-title">{cat.category}</h2>
			<div class="table-wrap">
				<table class="drug-table">
					<thead><tr><th>Drug</th><th>Dose</th><th>Max</th><th>Notes</th></tr></thead>
					<tbody>
						{#each cat.drugs as d}
							<tr>
								<td class="drug-name">{d.name}</td>
								<td class="mono-cell">{d.dose}</td>
								<td class="mono-cell">{d.max}</td>
								<td class="note-cell">{d.notes}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}

	<div class="disclaimer">
		<strong>⚠ Verify all doses</strong> against your institution's formulary and current guidelines before administration. This reference is a quick guide only.
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.5rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.search-row { position: sticky; top: 0; background: var(--color-bg, #0b1121); padding: 0.5rem 0; z-index: 10; }
	.search-input { width: 100%; max-width: 400px; padding: 0.5rem 0.85rem; font-family: var(--font-body); font-size: 0.875rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); }
	.search-input:focus { outline: none; border-color: var(--color-primary); }
	.drug-cat { display: flex; flex-direction: column; gap: 0.5rem; }
	.cat-title { font-size: 0.95rem; font-weight: 600; color: var(--color-text-secondary); font-family: var(--font-body); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.drug-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.drug-table th { padding: 0.45rem 0.8rem; text-align: left; font-size: 0.71rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.drug-table td { padding: 0.45rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.drug-table tr:last-child td { border-bottom: none; }
	.drug-name { font-weight: 600; color: var(--color-text); white-space: nowrap; font-size: 0.82rem; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); }
	.note-cell { font-size: 0.76rem; color: var(--color-text-muted); line-height: 1.45; }
	.disclaimer { padding: 0.7rem 1rem; background: color-mix(in srgb, var(--color-warning, #f59e0b) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 30%, transparent); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--color-text-muted); }
	.disclaimer strong { color: var(--color-text); }
</style>

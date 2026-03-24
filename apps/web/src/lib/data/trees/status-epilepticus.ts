import type { DecisionTree } from '$lib/d3/tree-schema';

export const statusEpilepticus: DecisionTree = {
	id: 'status-epilepticus-2025',
	title: 'Status Epilepticus — Time-Based Protocol',
	version: '1.0',
	mode: 'both',
	source: 'AES/NCS Guidelines 2024 / PALS 2025',
	lastUpdated: '2025-03',
	root: {
		id: 'seizure-onset',
		label: 'Active Seizure ≥5 min',
		type: 'emergency',
		description: 'Continuous seizure ≥5 min OR ≥2 seizures without return to baseline',
		children: [
			{
				label: '0-5 min',
				node: {
					id: 'phase1',
					label: 'Phase 1: Stabilization',
					type: 'action',
					description: 'ABCs, oxygen, glucose check, IV/IO access',
					panels: [
						{ label: 'Immediate Actions', type: 'list', content: { title: 'TIME ZERO — Start clock', items: ['Ensure airway patent, position on side', 'Apply high-flow oxygen', 'Cardiac monitor + SpO₂', 'Obtain IV/IO access', 'CHECK GLUCOSE IMMEDIATELY', 'Time the seizure — document start time', 'Protect from injury (do NOT restrain)'] } },
						{ label: 'Glucose', type: 'alert', content: { severity: 'emergency', title: 'Glucose is the #1 reversible cause', body: 'If glucose <60 mg/dL: give D10W 2-4 mL/kg IV. NEVER give D50W to children <2 years.' } },
						{ label: 'Dosing', type: 'dosing', content: { drugs: ['dextrose'], notes: 'D10W 2 mL/kg for hypoglycemia.' } },
					],
					wasmCompute: [{ fn: 'calculateDose', args: ['dextrose'], displayKey: 'dexDose', format: 'dose' }],
					children: [
						{
							label: 'Seizure continues at 5 min',
							node: {
								id: 'phase2',
								label: 'Phase 2: First-Line Benzos',
								type: 'emergency',
								description: 'Midazolam IV/IN/IM or Lorazepam IV',
								panels: [
									{
										label: 'With IV Access',
										type: 'table',
										content: {
											headers: ['Agent', 'Route', 'Dose', 'Max'],
											rows: [
												['Midazolam (preferred)', 'IV', '0.1-0.2 mg/kg', '5 mg'],
												['Lorazepam', 'IV', '0.1 mg/kg', '4 mg'],
											],
											caption: 'May repeat ONCE at 5 min if seizure continues',
										},
									},
									{
										label: 'No IV Access',
										type: 'table',
										content: {
											headers: ['Agent', 'Route', 'Dose', 'Max', 'Notes'],
											rows: [
												['Midazolam (preferred)', 'INTRANASAL', '0.2 mg/kg', '10 mg', 'Use atomizer + 5 mg/mL concentration'],
												['Midazolam', 'IM', '0.2 mg/kg', '10 mg', 'Anterolateral thigh'],
												['Diazepam', 'RECTAL', '0.5 mg/kg', '20 mg', 'If no IN/IM option'],
											],
										},
									},
								],
								children: [
									{ label: 'Seizure stops', node: { id: 'post-benzo', label: 'Post-Seizure Monitoring', type: 'stable', description: 'Monitor, obtain IV, consider second-line loading for breakthrough prevention' } },
									{
										label: 'Seizure continues after 2 benzo doses (20 min)',
										node: {
											id: 'phase3',
											label: 'Phase 3: Second-Line',
											type: 'urgent',
											description: 'Levetiracetam (preferred) or Fosphenytoin',
											panels: [
												{
													label: 'Agent Selection',
													type: 'table',
													content: {
														headers: ['Agent', 'Dose', 'Infusion Time', 'Advantage'],
														rows: [
															['Levetiracetam (preferred)', '40-60 mg/kg IV (max 3000 mg)', '15 min', 'Fewer hemodynamic/respiratory side effects'],
															['Fosphenytoin', '20 mg PE/kg IV', 'Max 150 mg PE/min', 'Requires continuous cardiac monitoring'],
															['Phenobarbital (neonates)', '20 mg/kg IV (max 1000 mg)', 'Max 1 mg/kg/min', 'Preferred in neonates. Respiratory depression risk.'],
														],
													},
												},
											],
											children: [
												{ label: 'Seizure stops', node: { id: 'post-second', label: 'Monitoring + Transfer', type: 'stable', description: 'Continue monitoring. Arrange PICU transfer.' } },
												{
													label: 'Seizure continues (40+ min)',
													node: {
														id: 'phase4',
														label: 'Phase 4: REFRACTORY SE',
														type: 'emergency',
														description: 'HIGH MORTALITY. Continuous infusion. Intubation. Emergent transfer.',
														panels: [
															{
																label: 'Options',
																type: 'list',
																content: {
																	title: 'Refractory status epilepticus',
																	items: [
																		'Midazolam continuous infusion: 0.05-2 mg/kg/hr',
																		'Ketamine 1-2 mg/kg bolus → 0.5-3 mg/kg/hr infusion',
																		'Repeat second-line agent (fosphenytoin 5-10 mg PE/kg additional)',
																		'Pentobarbital infusion (requires PICU)',
																	],
																},
															},
															{
																label: 'Critical Actions',
																type: 'alert',
																content: {
																	severity: 'emergency',
																	title: 'Refractory SE = Intubation + Transfer',
																	body: 'Intubation almost always required. Continuous EEG if available. Emergent neurology consult. Initiate transfer IMMEDIATELY.',
																},
															},
														],
													},
												},
											],
										},
									},
								],
							},
						},
					],
				},
			},
		],
	},
	textbook: {
		title: 'Status Epilepticus Management',
		blocks: [
			{ type: 'heading', level: 1, text: 'Overview' },
			{ type: 'paragraph', text: 'Status epilepticus (SE) is defined as continuous seizure activity lasting ≥5 minutes, or two or more seizures without return to baseline between them. It is a medical emergency with a time-dependent prognosis — longer seizure duration correlates with worse outcomes and increasing refractoriness to treatment.' },
			{ type: 'keypoint', text: '<strong>Glucose is the most important reversible cause.</strong> Check at time zero. Hypoglycemia-induced seizures will not respond to anticonvulsants without glucose correction.' },
			{ type: 'heading', level: 1, text: 'First-Line: Benzodiazepines' },
			{ type: 'paragraph', text: 'Benzodiazepines are the first-line treatment and should be given as soon as possible. Intranasal midazolam is as effective as IV lorazepam for first-line treatment and should be used immediately when IV access is not available. Do not delay treatment to obtain IV access.' },
			{ type: 'evidence', level: 'Class I', text: 'IM midazolam is non-inferior to IV lorazepam for prehospital seizure cessation (RAMPART trial). Intranasal delivery achieves similar bioavailability.', source: 'Silbergleit R, et al. NEJM 2012' },
			{ type: 'heading', level: 1, text: 'Differential: AEIOU-TIPS' },
			{ type: 'paragraph', text: 'Always consider reversible causes of altered mental status and seizures: Alcohol/Abuse, Endocrine (DKA, adrenal crisis), Insulin (HYPOGLYCEMIA), Opiates/Overdose, Uremia, Trauma (consider NAT in infants), Infection (meningitis, encephalitis), Psychiatric, Seizure (postictal or non-convulsive).' },
		],
		references: [
			{ id: 'rampart', authors: 'Silbergleit R, Durkalski V, Lowenstein D, et al.', title: 'Intramuscular versus Intravenous Therapy for Prehospital Status Epilepticus', journal: 'N Engl J Med', year: 2012, pmid: '22335736', note: 'RAMPART trial — IM midazolam non-inferior to IV lorazepam' },
			{ id: 'aes2024', authors: 'Glauser T, Shinnar S, Gloss D, et al.', title: 'Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults', journal: 'Epilepsy Currents', year: 2024, note: 'AES/NCS updated SE management guideline' },
		],
	},
};

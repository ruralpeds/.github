import type { DecisionTree } from '$lib/d3/tree-schema';

export const dkaProtocol: DecisionTree = {
	id: 'dka-2025',
	title: 'Diabetic Ketoacidosis (DKA) Protocol',
	version: '1.0',
	mode: 'pediatric',
	source: 'ISPAD 2022 / ADA 2024 Guidelines',
	lastUpdated: '2025-03',
	root: {
		id: 'dka-dx',
		label: 'DKA Diagnosis',
		type: 'assessment',
		description: 'Glucose >200, pH <7.3 or HCO₃ <15, ketonemia/ketonuria',
		panels: [
			{ label: 'Severity', type: 'table', content: { headers: ['Severity', 'pH', 'HCO₃'], rows: [['Mild', '7.2-7.3', '10-15'], ['Moderate', '7.1-7.2', '5-10'], ['Severe', '<7.1', '<5']], caption: 'Classify severity to guide fluid and insulin management' } },
		],
		children: [
			{
				label: 'Confirm DKA',
				node: {
					id: 'initial-resus',
					label: 'Initial Fluid Resuscitation',
					type: 'emergency',
					description: 'NS 10-20 mL/kg over first hour. GRADUAL rehydration.',
					wasmCompute: [{ fn: 'calculateFluidBolus', args: ['normal_saline'], displayKey: 'bolus', format: 'volume' }],
					panels: [
						{ label: 'Fluid Protocol', type: 'list', content: { title: 'CEREBRAL EDEMA PREVENTION = GRADUAL REHYDRATION', items: ['NS 10-20 mL/kg over first hour', 'Severe DKA: limit to 10 mL/kg unless hemodynamically unstable', 'Do NOT exceed 40 mL/kg in first 4 hours', 'Replace deficit evenly over 24-48 hours', 'Start 0.9% NS, transition to 0.45% NS once improving'] } },
						{ label: 'Dextrose', type: 'alert', content: { severity: 'warning', title: 'Add dextrose when glucose <300 mg/dL', body: 'D5-0.45% NS (or D10 if dropping rapidly). Target glucose 150-300 mg/dL while on insulin infusion. Do NOT stop insulin until DKA resolved.' } },
					],
					children: [
						{
							label: 'Check K+',
							node: {
								id: 'potassium',
								label: 'Potassium Management',
								type: 'decision',
								description: 'Total body K+ ALWAYS depleted in DKA',
								panels: [
									{ label: 'K+ Protocol', type: 'table', content: { headers: ['K+ Level', 'Action'], rows: [['K+ > 5.5', 'Do NOT add K+ yet. Recheck in 1-2 hr.'], ['K+ 3.5-5.5', 'Add KCl 20-40 mEq/L to IV fluids'], ['K+ < 3.5', 'HOLD INSULIN. Replace K+ 0.5-1 mEq/kg/hr with cardiac monitoring.']] } },
									{ label: 'Danger', type: 'alert', content: { severity: 'emergency', title: 'Hypokalemia + Insulin = Cardiac Arrest Risk', body: 'NEVER start insulin if K+ <3.5 mEq/L. Replace potassium first. Insulin drives K+ intracellularly, worsening hypokalemia.' } },
								],
								children: [
									{
										label: 'K+ ≥ 3.5 (safe to start insulin)',
										node: {
											id: 'insulin',
											label: 'Insulin Infusion',
											type: 'action',
											description: '0.05-0.1 units/kg/hr. NO IV BOLUS.',
											panels: [
												{ label: 'Insulin', type: 'list', content: { items: ['⚠ Do NOT give IV insulin bolus (increases cerebral edema risk)', '0.1 units/kg/hr for moderate-severe DKA', '0.05 units/kg/hr for mild DKA', 'Preparation: Regular insulin 50 units in 50 mL NS (1 unit/mL)', 'Continue until DKA resolved: pH >7.3, HCO₃ >15, anion gap closed', 'Transition to SubQ: give SubQ insulin 15-30 min BEFORE stopping drip'] } },
											],
											children: [
												{
													label: 'Monitor q1h',
													node: {
														id: 'monitoring',
														label: 'Ongoing Monitoring',
														type: 'assessment',
														description: 'Glucose q1h, BMP q2-4h, neuro checks q1h',
														panels: [
															{ label: 'Schedule', type: 'table', content: { headers: ['Parameter', 'Frequency'], rows: [['Glucose (POC)', 'HOURLY'], ['Electrolytes + VBG', 'Q2-4 hours'], ['Neuro checks (GCS, pupils)', 'Q1 hour'], ['Vitals', 'Q1 hour'], ['Strict I&O', 'Continuous (Foley catheter)']] } },
														],
														children: [
															{ label: 'Improving', node: { id: 'resolving', label: 'DKA Resolving', type: 'stable', description: 'pH >7.3, HCO₃ >15, AG closed → transition to SubQ insulin' } },
															{
																label: 'Neuro deterioration',
																node: {
																	id: 'cerebral-edema',
																	label: 'CEREBRAL EDEMA',
																	type: 'emergency',
																	description: '0.5-1% of DKA. 20-25% mortality. Treat IMMEDIATELY.',
																	panels: [
																		{ label: 'Warning Signs', type: 'list', content: { title: 'Monitor for these — any triggers immediate treatment', items: ['Headache (report immediately)', 'Altered mental status (especially after initial improvement)', 'Recurrence of vomiting', 'Cushing triad: hypertension + bradycardia + irregular respirations', 'Focal neurologic signs', 'Pupil asymmetry'] } },
																		{ label: 'High Risk', type: 'list', content: { items: ['Age <5 years', 'New-onset diabetes', 'Severe DKA (pH <7.1)', 'High BUN at presentation', 'Rapid fluid administration'] } },
																		{ label: 'Treatment', type: 'list', content: { title: 'TREAT IMMEDIATELY — do not wait for imaging', items: ['3% Hypertonic Saline 2-5 mL/kg IV over 10-20 min (PREFERRED)', 'Alternative: Mannitol 0.5-1 g/kg IV over 15-20 min', 'Elevate HOB to 30°', 'Reduce IV fluid rate to maintenance only', 'Prepare for intubation — AVOID hyperventilation (target normocapnia)', 'Emergent CT head if available', 'EMERGENT transfer to PICU'] } },
																	],
																},
															},
														],
													},
												},
											],
										},
									},
									{
										label: 'K+ < 3.5 (HOLD insulin)',
										node: {
											id: 'k-replace',
											label: 'Replace K+ First',
											type: 'urgent',
											description: '0.5-1 mEq/kg/hr with cardiac monitoring. Recheck before starting insulin.',
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
		title: 'Diabetic Ketoacidosis in the Rural ED',
		blocks: [
			{ type: 'heading', level: 1, text: 'Overview' },
			{ type: 'paragraph', text: 'DKA is the most common endocrine emergency in pediatrics. It occurs when insulin deficiency leads to hyperglycemia, lipolysis with ketone body production, and metabolic acidosis. New-onset diabetes accounts for approximately 30% of DKA presentations. Rural EDs must be prepared for prolonged management (12-24+ hours) before transfer, as DKA resolution requires careful, time-dependent titration.' },
			{ type: 'keypoint', text: '<strong>Cerebral edema</strong> is the most feared complication (0.5-1% incidence, 20-25% mortality). Prevention through gradual rehydration and avoidance of rapid osmolality shifts is critical. Risk factors: age <5, new-onset diabetes, severe DKA, high BUN, rapid fluid administration.' },
			{ type: 'heading', level: 1, text: 'Fluid Management' },
			{ type: 'paragraph', text: 'The cornerstone of DKA management is GRADUAL rehydration. The 2022 ISPAD guidelines recommend limiting initial bolus to 10-20 mL/kg NS over the first hour, with no more than 40 mL/kg in the first 4 hours. Total deficit replacement should occur over 24-48 hours, not the traditional 12-24 hours used in non-DKA dehydration.' },
			{ type: 'evidence', level: 'Class I', text: 'The PECARN FLUID trial showed no difference in neurological outcomes between 0.9% NS and 0.45% NS, or between rapid and slow rehydration rates. However, current guidelines still recommend gradual rehydration as standard practice.', source: 'Kuppermann N, et al. NEJM 2018' },
			{ type: 'heading', level: 1, text: 'Potassium' },
			{ type: 'paragraph', text: 'Total body potassium is ALWAYS depleted in DKA, regardless of the serum level. Acidosis shifts potassium extracellularly, so serum K+ may appear normal or even high at presentation. As insulin therapy corrects the acidosis and drives potassium back into cells, serum K+ can drop precipitously. This is the most common cause of iatrogenic cardiac arrest in DKA management.' },
			{ type: 'alert', severity: 'emergency', title: 'Critical Rule', body: 'NEVER start insulin if K+ <3.5 mEq/L. Replace potassium first. Hypokalemia plus insulin is a lethal combination.' },
		],
		references: [
			{ id: 'ispad2022', authors: 'Wolfsdorf JI, Glaser N, Agus M, et al.', title: 'ISPAD Clinical Practice Consensus Guidelines 2022: Diabetic Ketoacidosis and Hyperglycemic Hyperosmolar State', journal: 'Pediatric Diabetes', year: 2022, doi: '10.1111/pedi.13406', note: 'Primary DKA management guideline' },
			{ id: 'fluid-trial', authors: 'Kuppermann N, Ghetti S, Schunk JE, et al.', title: 'Clinical Trial of Fluid Infusion Rates for Pediatric DKA', journal: 'N Engl J Med', year: 2018, pmid: '29897851', note: 'PECARN FLUID trial — no neurological difference between fluid strategies' },
		],
	},
};

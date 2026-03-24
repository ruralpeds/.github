import type { DecisionTree } from '$lib/d3/tree-schema';

export const nrpAlgorithm: DecisionTree = {
	id: 'nrp-2025',
	title: 'Neonatal Resuscitation Algorithm',
	version: '8.0',
	mode: 'neonatal',
	source: 'AAP NRP 8th Edition / AHA 2025 Guidelines',
	lastUpdated: '2025-03',
	root: {
		id: 'birth',
		label: 'Birth',
		type: 'assessment',
		description: 'Antenatal counseling, team briefing, equipment check',
		panels: [
			{
				label: 'Pre-delivery Checklist',
				type: 'list',
				content: {
					title: 'Equipment & Team Preparation',
					items: [
						'Radiant warmer on, towels warm',
						'Suction: bulb syringe + 10F suction catheter',
						'Bag-mask: appropriate size mask, T-piece or self-inflating bag',
						'Oxygen blender set to 21% (term) or 21–30% (preterm)',
						'Pulse oximeter + cardiac monitor available',
						'Intubation equipment ready (if risk factors)',
						'UVC tray available',
						'Epinephrine drawn up: 0.1 mg/mL (1:10,000)',
					],
				},
			},
			{
				label: 'Risk Factors',
				type: 'table',
				content: {
					headers: ['Antepartum', 'Intrapartum'],
					rows: [
						['Prematurity (<37 wk)', 'Emergency C-section'],
						['Multiple gestation', 'Forceps/vacuum delivery'],
						['Oligohydramnios', 'Breech presentation'],
						['Fetal anomaly', 'Prolonged rupture of membranes'],
						['No prenatal care', 'Chorioamnionitis'],
						['Maternal diabetes', 'Meconium-stained fluid'],
						['Maternal drug use', 'Non-reassuring fetal tracing'],
						['Hydrops fetalis', 'Shoulder dystocia'],
					],
				},
			},
		],
		children: [
			{
				label: 'Term? Tone? Breathing/Crying?',
				node: {
					id: 'initial-assessment',
					label: 'Rapid Assessment',
					type: 'decision',
					description: 'Term gestation? Good tone? Breathing or crying?',
					panels: [
						{
							label: 'Assessment Criteria',
							type: 'table',
							content: {
								headers: ['Finding', 'Normal', 'Abnormal'],
								rows: [
									['Gestation', '≥37 weeks', '<37 weeks'],
									['Tone', 'Active flexion', 'Flaccid/limp'],
									['Breathing', 'Crying, vigorous', 'Apnea, gasping, labored'],
								],
							},
						},
					],
					children: [
						{
							label: 'Yes to all',
							node: {
								id: 'routine-care',
								label: 'Routine Care',
								type: 'action',
								description: 'Skin-to-skin, dry, ongoing evaluation',
								panels: [
									{
										label: 'Routine Care Steps',
										type: 'list',
										content: {
											items: [
												'Place skin-to-skin with mother',
												'Dry thoroughly, remove wet linen',
												'Clear airway only if needed (mouth before nose)',
												'Assess color, breathing, activity continuously',
												'Delay cord clamping 30–60 seconds if vigorous',
											],
										},
									},
								],
							},
						},
						{
							label: 'No to any',
							node: {
								id: 'initial-steps',
								label: 'Initial Steps',
								type: 'action',
								description: 'Warm, dry, stimulate, position, suction if needed',
								panels: [
									{
										label: 'Initial Steps Detail',
										type: 'list',
										content: {
											title: 'Within 30 seconds',
											items: [
												'Provide warmth (radiant warmer, plastic wrap if <32 wk)',
												'Position: neutral "sniffing" position, towel roll under shoulders',
												'Dry thoroughly (except VLBW — use plastic wrap instead)',
												'Stimulate: rub back, flick soles of feet',
												'Suction mouth then nose ONLY if airway obstructed',
												'Start pulse oximeter on right hand (pre-ductal)',
												'Attach cardiac monitor leads if available',
											],
										},
									},
									{
										label: 'SpO2 Targets',
										type: 'table',
										content: {
											headers: ['Time After Birth', 'Target SpO2'],
											rows: [
												['1 minute', '60–65%'],
												['2 minutes', '65–70%'],
												['3 minutes', '70–75%'],
												['4 minutes', '75–80%'],
												['5 minutes', '80–85%'],
												['10 minutes', '85–95%'],
											],
											caption: 'Pre-ductal SpO2 targets (right hand)',
										},
									},
								],
								children: [
									{
										label: 'Assess: HR, breathing',
										node: {
											id: 'assess-30s',
											label: 'Reassess at 30 seconds',
											type: 'decision',
											description: 'HR? Breathing? Labored or apnea?',
											children: [
												{
													label: 'HR ≥ 100, breathing',
													node: {
														id: 'post-resus-care',
														label: 'Post-Resuscitation Care',
														type: 'stable',
														description: 'Position, monitor SpO2, consider CPAP if labored',
													},
												},
												{
													label: 'HR < 100 or apnea/gasping',
													node: {
														id: 'ppv',
														label: 'PPV',
														type: 'emergency',
														description: 'Positive pressure ventilation, cardiac monitor',
														panels: [
															{
																label: 'PPV Technique',
																type: 'list',
																content: {
																	title: 'Begin within 60 seconds of birth',
																	items: [
																		'Rate: 40–60 breaths/minute',
																		'Initial PIP: 20–25 cmH2O (term), 20 cmH2O (preterm)',
																		'FiO2: Start at 21% (term) or 21–30% (preterm)',
																		'Watch for chest rise',
																		'MR SOPA if no chest rise',
																	],
																},
															},
															{
																label: 'MR SOPA',
																type: 'table',
																content: {
																	headers: ['Letter', 'Corrective Step'],
																	rows: [
																		['M', 'Mask adjustment — ensure seal'],
																		['R', 'Reposition — neutral/sniffing position'],
																		['S', 'Suction — mouth then nose'],
																		['O', 'Open mouth — slight jaw thrust'],
																		['P', 'Pressure increase — up to 30–40 cmH2O'],
																		['A', 'Alternative airway — LMA or ETT'],
																	],
																	caption: 'MR SOPA ventilation corrective steps',
																},
															},
															{
																label: 'Dosing',
																type: 'dosing',
																content: {
																	drugs: ['epinephrine', 'volume_expansion'],
																	notes: 'Epinephrine only if HR remains < 60 after effective ventilation + compressions',
																},
															},
														],
														wasmCompute: [
															{ fn: 'calculateDose', args: ['epinephrine'], displayKey: 'epiDose', format: 'dose' },
														],
														children: [
															{
																label: 'HR ≥ 100',
																node: {
																	id: 'ppv-success',
																	label: 'PPV Successful',
																	type: 'stable',
																	description: 'Continue post-resuscitation monitoring',
																},
															},
															{
																label: 'HR 60–99',
																node: {
																	id: 'reassess-ppv',
																	label: 'Reassess PPV',
																	type: 'decision',
																	description: 'Chest moving? MR SOPA? Consider intubation',
																	children: [
																		{
																			label: 'Chest rising, HR still < 100',
																			node: {
																				id: 'continue-ppv',
																				label: 'Continue PPV',
																				type: 'action',
																				description: 'Consider intubation, increase FiO2 if needed',
																			},
																		},
																	],
																},
															},
															{
																label: 'HR < 60',
																node: {
																	id: 'compressions',
																	label: 'Chest Compressions + PPV',
																	type: 'emergency',
																	description: 'Intubate if not already. 3:1 ratio.',
																	panels: [
																		{
																			label: 'Compression Technique',
																			type: 'list',
																			content: {
																				title: 'Coordinated CPR — 3:1 ratio',
																				items: [
																					'Two-thumb encircling technique (preferred)',
																					'Compress lower third of sternum',
																					'Depth: 1/3 of AP diameter of chest',
																					'Rate: 3 compressions : 1 breath (90 compressions + 30 breaths/min)',
																					'Intubate if not already done',
																					'Increase FiO2 to 100%',
																					'Consider UVC for IV access',
																				],
																			},
																		},
																		{
																			label: 'When to Stop',
																			type: 'alert',
																			content: {
																				severity: 'warning',
																				title: 'Reassess every 60 seconds',
																				body: 'If HR remains < 60 after 60 seconds of effective compressions + ventilation via ETT → Administer epinephrine. If no heart rate after 20 minutes of continuous adequate resuscitation → Consider stopping.',
																			},
																		},
																	],
																	children: [
																		{
																			label: 'HR ≥ 60',
																			node: {
																				id: 'compressions-success',
																				label: 'Discontinue Compressions',
																				type: 'action',
																				description: 'Continue PPV, wean FiO2 to SpO2 target',
																			},
																		},
																		{
																			label: 'HR still < 60',
																			node: {
																				id: 'epinephrine',
																				label: 'Epinephrine',
																				type: 'emergency',
																				description: 'IV/UVC: 0.01–0.03 mg/kg. Repeat q3–5 min.',
																				wasmCompute: [
																					{ fn: 'calculateDose', args: ['epinephrine'], displayKey: 'epiDose', format: 'dose' },
																				],
																				panels: [
																					{
																						label: 'Epinephrine Dosing',
																						type: 'dosing',
																						content: {
																							drugs: ['epinephrine', 'epinephrine_ett', 'volume_expansion'],
																							notes: 'IV/UVC route strongly preferred. ETT dose is 0.05–0.1 mg/kg if no IV access. Consider volume expansion (10 mL/kg NS or O-neg pRBC) if suspected blood loss.',
																						},
																					},
																				],
																				children: [
																					{
																						label: 'HR ≥ 60',
																						node: {
																							id: 'epi-success',
																							label: 'Post-Resuscitation Care',
																							type: 'stable',
																							description: 'NICU admission, monitor, debrief',
																						},
																					},
																					{
																						label: 'HR still < 60',
																						node: {
																							id: 'refractory',
																							label: 'Refractory Bradycardia',
																							type: 'diagnosis',
																							description: 'Repeat epi q3–5 min. Volume expansion. Consider pneumothorax, congenital anomaly.',
																							panels: [
																								{
																									label: 'Differential',
																									type: 'list',
																									content: {
																										title: 'Consider reversible causes',
																										items: [
																											'Pneumothorax (transilluminate, needle decompress)',
																											'Hypovolemia (volume expansion, consider pRBC)',
																											'Congenital diaphragmatic hernia (intubate, do NOT bag-mask)',
																											'Congenital heart disease (prostaglandin if ductal-dependent)',
																											'Airway obstruction (reposition, suction, consider different ETT)',
																											'Equipment failure (check connections, O2 source)',
																										],
																									},
																								},
																								{
																									label: 'When to Stop',
																									type: 'alert',
																									content: {
																										severity: 'emergency',
																										title: 'Discontinuation of Resuscitation',
																										body: 'If no heart rate after 20 minutes of continuous adequate resuscitation efforts (confirmed by cardiac monitor), cessation of resuscitation may be appropriate. This decision should involve the team and family. Document all interventions and timeline.',
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
									},
								],
							},
						},
					],
				},
			},
		],
	},

	// =========================================================================
	// Textbook Section — educational content for the NRP algorithm
	// =========================================================================
	textbook: {
		title: 'Neonatal Resuscitation: A Textbook Reference',
		blocks: [
			{ type: 'heading', level: 1, text: 'Overview' },
			{
				type: 'paragraph',
				text: 'Approximately 10% of newborns require some assistance to begin breathing at birth, and about 1% require extensive resuscitation measures. The Neonatal Resuscitation Program (NRP) provides a systematic approach to newborn stabilization and resuscitation based on the best available evidence.',
			},
			{
				type: 'keypoint',
				text: 'The most important and effective action in neonatal resuscitation is <strong>ventilation of the lungs</strong>. Establishing effective ventilation is the priority in nearly all neonatal resuscitation scenarios.',
			},

			{ type: 'heading', level: 1, text: 'Anticipation and Preparation' },
			{
				type: 'paragraph',
				text: 'Every delivery should be attended by at least one person skilled in neonatal resuscitation whose sole responsibility is the newborn. When risk factors are present, additional trained personnel should be immediately available.',
			},
			{
				type: 'table',
				headers: ['Equipment Category', 'Items Required'],
				rows: [
					['Thermoregulation', 'Radiant warmer, warm towels, plastic wrap/bag (<32 wk), temperature probe, hat'],
					['Airway', 'Bulb syringe, suction catheter (10F/12F), suction source, face masks (preterm + term sizes)'],
					['Ventilation', 'T-piece resuscitator or self-inflating bag, O2 blender, flow meter, pulse oximeter'],
					['Intubation', 'Laryngoscope (Miller 0, 00), ETT (2.5, 3.0, 3.5), stylet, CO2 detector, tape/securement'],
					['Medications', 'Epinephrine 1:10,000, NS for volume, syringes, UVC tray'],
				],
				caption: 'Minimum equipment for neonatal resuscitation',
			},

			{ type: 'heading', level: 1, text: 'Initial Steps' },
			{
				type: 'paragraph',
				text: 'The initial steps of resuscitation should be completed within 30 seconds ("The Golden Minute"). These include providing warmth, positioning the airway, clearing secretions if needed, drying and stimulating the infant.',
			},
			{
				type: 'evidence',
				level: 'Class I',
				text: 'Delayed cord clamping (≥30 seconds) is recommended for both term and preterm infants who do not require immediate resuscitation.',
				source: 'AHA/AAP 2025 Guidelines, Recommendation 893',
			},

			{ type: 'heading', level: 1, text: 'Positive Pressure Ventilation' },
			{
				type: 'paragraph',
				text: 'If the infant remains apneic, is gasping, or has a heart rate below 100 bpm after the initial steps, positive pressure ventilation (PPV) should be initiated. PPV is the single most important intervention in neonatal resuscitation.',
			},
			{
				type: 'keypoint',
				text: 'For term infants, PPV should be initiated with <strong>21% oxygen (room air)</strong>. For preterm infants <35 weeks, begin with <strong>21–30% oxygen</strong>. Titrate FiO2 based on pre-ductal SpO2 targets.',
			},
			{
				type: 'alert',
				severity: 'warning',
				title: 'MR SOPA',
				body: 'If chest rise is not observed with PPV, perform the MR SOPA corrective steps systematically before proceeding to intubation.',
			},

			{ type: 'heading', level: 1, text: 'Chest Compressions' },
			{
				type: 'paragraph',
				text: 'Chest compressions are indicated when the heart rate remains below 60 bpm despite 30 seconds of effective PPV. The two-thumb encircling technique is preferred. The compression-to-ventilation ratio for neonates is 3:1, delivering 90 compressions and 30 breaths per minute.',
			},
			{
				type: 'evidence',
				level: 'Class IIb',
				text: 'Cardiac compressions in neonates should use the 3:1 compression-to-ventilation ratio rather than 15:2 or 30:2 ratios used in older children and adults.',
				source: 'AHA 2025 Guidelines, Recommendation 901',
			},

			{ type: 'heading', level: 1, text: 'Medications' },
			{
				type: 'paragraph',
				text: 'Epinephrine is the primary medication used in neonatal resuscitation. It is indicated when the heart rate remains below 60 bpm despite effective ventilation and chest compressions. The IV/UVC route is strongly preferred over endotracheal administration.',
			},
			{
				type: 'table',
				headers: ['Drug', 'Route', 'Dose', 'Concentration'],
				rows: [
					['Epinephrine', 'IV/UVC', '0.01–0.03 mg/kg', '1:10,000 (0.1 mg/mL)'],
					['Epinephrine', 'ETT', '0.05–0.1 mg/kg', '1:10,000 (0.1 mg/mL)'],
					['Volume expansion', 'IV/UVC', '10 mL/kg', 'NS or O-neg pRBC'],
				],
				caption: 'NRP medication dosing reference',
			},
			{
				type: 'alert',
				severity: 'emergency',
				title: 'Critical Dosing Note',
				body: 'Use ONLY 1:10,000 (0.1 mg/mL) epinephrine for neonatal resuscitation. The 1:1,000 concentration is TEN TIMES more concentrated and must NOT be used without proper dilution.',
			},
		],
		references: [
			{
				id: 'nrp8',
				authors: 'Weiner GM, ed.',
				title: 'Textbook of Neonatal Resuscitation (NRP), 8th Edition',
				journal: 'American Academy of Pediatrics',
				year: 2021,
				note: 'Primary reference for all NRP algorithms and procedures',
			},
			{
				id: 'aha2025',
				authors: 'Aziz K, Lee HC, Escobedo MB, et al.',
				title: 'Part 5: Neonatal Resuscitation: 2025 American Heart Association Guidelines for CPR and ECC',
				journal: 'Circulation',
				year: 2025,
				doi: '10.1161/CIR.0000000000001029',
				pmid: '33000000',
				note: 'AHA evidence review and updated recommendations',
			},
			{
				id: 'who-cord',
				authors: 'World Health Organization.',
				title: 'Guideline: Delayed Umbilical Cord Clamping for Improved Maternal and Infant Health',
				journal: 'WHO',
				year: 2014,
				note: 'Evidence basis for delayed cord clamping recommendation',
			},
		],
	},
};

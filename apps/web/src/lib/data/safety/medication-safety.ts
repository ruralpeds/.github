/**
 * IV Medication Safety Reference — Hard-Stop Incompatibilities & Extravasation Protocols
 * 
 * Source: IVF Comprehensive Clinical Decision Reference (50 PMIDs)
 * For integration into CDS safety checks and reference panels.
 */

export const IV_INCOMPATIBILITIES = {
  // Hard-stop incompatibilities — these MUST trigger alerts in any CDS system
  hardStops: [
    {
      pair: ['calcium', 'bicarbonate'],
      reaction: 'Precipitates calcium carbonate',
      severity: 'critical',
      action: 'NEVER infuse through same line. Flush between.',
    },
    {
      pair: ['calcium', 'phosphate'],
      reaction: 'Precipitates calcium phosphate',
      severity: 'critical',
      action: 'NEVER mix in same solution. Separate TPN lines or cycle.',
    },
    {
      pair: ['calcium', 'ceftriaxone'],
      reaction: 'Fatal cardiopulmonary precipitates in neonates',
      severity: 'critical',
      ageRestriction: 'Contraindicated in neonates <28 days',
      action: 'Use cefotaxime instead in neonates. In older infants, separate lines and flush.',
    },
    {
      pair: ['phenytoin', 'dextrose'],
      reaction: 'Phenytoin crystallizes in dextrose-containing solutions',
      severity: 'critical',
      action: 'Dilute phenytoin ONLY in normal saline. Flush line with NS before/after.',
    },
    {
      pair: ['amphotericin B', 'saline'],
      reaction: 'Aggregation and reduced efficacy',
      severity: 'high',
      action: 'Dilute amphotericin B ONLY in D5W.',
    },
  ],

  // Concentration limits for peripheral IV
  peripheralLimits: [
    { substance: 'Dextrose', maxConcentration: '12.5%', note: 'D10 acceptable for short runs; D12.5+ requires central' },
    { substance: 'Potassium', maxConcentration: '40 mEq/L', note: 'Max rate 0.5 mEq/kg/hr with cardiac monitoring' },
    { substance: 'Calcium gluconate', maxConcentration: '50 mg/mL', note: 'Slow infusion, check site frequently' },
    { substance: 'Sodium bicarbonate', maxConcentration: '8.4% (1 mEq/mL)', note: 'Dilute to 4.2% for peripheral use in neonates' },
    { substance: 'TPN', maxOsmolarity: '900 mOsm/L', note: '>900 mOsm/L requires central access' },
    { substance: 'Vasopressors', note: 'Epinephrine and norepinephrine CAN be given peripherally in emergencies — check site q15 min' },
  ],
};

export const EXTRAVASATION_PROTOCOLS = {
  // Immediate actions for all extravasations
  immediate: [
    'STOP infusion immediately',
    'Leave catheter in place briefly — attempt to aspirate residual drug',
    'Remove catheter after aspiration attempt',
    'Elevate affected extremity',
    'Mark the borders of the extravasation area',
    'Do NOT apply pressure to the area',
    'Photograph and document',
    'Consult pharmacy and/or plastic surgery for large extravasations',
  ],

  // Specific antidotes
  antidotes: [
    {
      agent: 'Hyaluronidase',
      concentration: '150 units/mL',
      dose: '1-1.7 mL intradermally around extravasation site',
      indication: 'Calcium salts, hypertonic dextrose (D10+), TPN, aminophylline',
      mechanism: 'Breaks down hyaluronic acid in connective tissue, disperses extravasated fluid',
      timing: 'Most effective within 1 hour of extravasation',
    },
    {
      agent: 'Phentolamine',
      concentration: '0.1-0.2 mg/kg diluted in 1-2 mL NS',
      dose: 'Inject subcutaneously around extravasation site',
      indication: 'Vasopressor extravasation (dopamine, epinephrine, norepinephrine, vasopressin)',
      mechanism: 'Alpha-adrenergic antagonist — reverses local vasoconstriction',
      timing: 'Most effective within 12 hours',
    },
    {
      agent: 'Nitroglycerin paste 2%',
      dose: '4 mm/kg applied topically to blanched area',
      indication: 'Vasopressor extravasation (alternative to phentolamine)',
      mechanism: 'Local vasodilation via nitric oxide release',
      timing: 'Apply immediately, may repeat q8h',
    },
  ],

  // High-risk agents for extravasation
  highRiskAgents: [
    { agent: 'D10W and higher', category: 'vesicant', antidote: 'Hyaluronidase' },
    { agent: 'Calcium chloride', category: 'vesicant', antidote: 'Hyaluronidase' },
    { agent: 'Calcium gluconate', category: 'vesicant', antidote: 'Hyaluronidase' },
    { agent: 'Sodium bicarbonate 8.4%', category: 'vesicant', antidote: 'Hyaluronidase' },
    { agent: 'TPN (>900 mOsm/L)', category: 'vesicant', antidote: 'Hyaluronidase' },
    { agent: 'Potassium >40 mEq/L', category: 'irritant', antidote: 'None specific — warm compress' },
    { agent: 'Dopamine', category: 'vasopressor', antidote: 'Phentolamine' },
    { agent: 'Epinephrine', category: 'vasopressor', antidote: 'Phentolamine' },
    { agent: 'Norepinephrine', category: 'vasopressor', antidote: 'Phentolamine' },
    { agent: 'Vasopressin', category: 'vasopressor', antidote: 'Phentolamine' },
    { agent: 'Phenytoin', category: 'vesicant (pH 12)', antidote: 'None specific — warm compress, elevation' },
    { agent: 'Vancomycin', category: 'irritant', antidote: 'None specific — warm compress' },
  ],
};

export const IV_ACCESS_REFERENCE = {
  flowRates: [
    { gauge: '24G', maxFlow: '20-25 mL/min', typicalUse: 'Neonates, small infants' },
    { gauge: '22G', maxFlow: '30-40 mL/min', typicalUse: 'Infants, young children' },
    { gauge: '20G', maxFlow: '60 mL/min', typicalUse: 'Children, rapid infusion' },
    { gauge: '18G', maxFlow: '100 mL/min', typicalUse: 'Adolescents, resuscitation' },
  ],
  io: {
    note: 'Intraosseous access supports ALL resuscitation medications and crystalloids under pressure',
    sites: ['Proximal tibia (preferred in <6 yr)', 'Distal tibia', 'Distal femur'],
    flowRate: 'Up to 165 mL/min under pressure bag',
  },
};

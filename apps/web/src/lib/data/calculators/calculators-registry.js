// ══════════════════════════════════════════════════════════════════
// UNIVERSAL CALCULATOR REGISTRY
// Every calculator & scoring system in the app is registered here.
// Each entry defines which GUI modes display it.
// ══════════════════════════════════════════════════════════════════

// Modes: 'neonatal' = Nursery/NICU, 'pediatric' = ED/PICU
// A calculator can appear in one or both modes.

export const SCORING_CALCULATORS = [
    // ── SEPSIS ──
    {
        id: 'phoenix-sepsis', name: 'Phoenix Sepsis Score', category: 'sepsis',
        description: 'International consensus pediatric sepsis criteria (2024)', scoreRange: '0-8',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { type: 'section', label: 'Respiratory' },
            { name: 'pao2_fio2_ratio', label: 'PaO₂/FiO₂ Ratio', step: '1', min: 0, max: 700, optional: true },
            { name: 'spo2_fio2_ratio', label: 'SpO₂/FiO₂ Ratio', step: '1', min: 0, max: 500, optional: true },
            { name: 'spo2', label: 'SpO₂ (%)', step: '1', min: 0, max: 100, optional: true },
            { name: 'on_invasive_mechanical_ventilation', label: 'Invasive Mechanical Ventilation', type: 'toggle' },
            { type: 'section', label: 'Cardiovascular' },
            { name: 'on_vasoactive', label: 'On Vasoactive Medication', type: 'toggle' },
            { name: 'lactate_mmol_l', label: 'Lactate (mmol/L)', step: '0.1', min: 0, max: 30, optional: true },
            { name: 'systolic_bp', label: 'Systolic BP (mmHg)', step: '1', min: 0, max: 200, optional: true },
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
            { name: 'age_months', label: 'Age (months)', step: '1', min: 0, max: 216, optional: true },
            { type: 'section', label: 'Coagulation' },
            { name: 'platelets', label: 'Platelets (×10³/μL)', step: '1', min: 0, max: 1000, optional: true },
            { name: 'inr', label: 'INR', step: '0.1', min: 0, max: 20, optional: true },
            { name: 'd_dimer_mg_l', label: 'D-dimer (mg/L)', step: '0.1', min: 0, max: 100, optional: true },
            { name: 'fibrinogen_mg_dl', label: 'Fibrinogen (mg/dL)', step: '1', min: 0, max: 1000, optional: true },
            { type: 'section', label: 'Neurological' },
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15, optional: true },
            { name: 'suspected_infection', label: 'Suspected Infection', type: 'toggle' },
        ],
        wasmFn: 'calculate_phoenix_sepsis_json',
    },
    {
        id: 'psofa', name: 'pSOFA', category: 'sepsis',
        description: 'Pediatric Sequential Organ Failure Assessment', scoreRange: '0-24',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { type: 'section', label: 'Respiratory' },
            { name: 'pao2_fio2_ratio', label: 'PaO₂/FiO₂ Ratio', step: '1', min: 0, max: 700, optional: true },
            { name: 'spo2_fio2_ratio', label: 'SpO₂/FiO₂ Ratio', step: '1', min: 0, max: 500, optional: true },
            { name: 'on_respiratory_support', label: 'On Respiratory Support', type: 'toggle' },
            { type: 'section', label: 'Coagulation & Hepatic' },
            { name: 'platelets', label: 'Platelets (×10³/μL)', step: '1', min: 0, max: 1000, optional: true },
            { name: 'bilirubin_mg_dl', label: 'Bilirubin (mg/dL)', step: '0.1', min: 0, max: 30, optional: true },
            { name: 'alt_iu_l', label: 'ALT (IU/L)', step: '1', min: 0, max: 1000, optional: true },
            { name: 'age_months', label: 'Age (months)', step: '1', min: 0, max: 216 },
            { type: 'section', label: 'Cardiovascular' },
            { name: 'map_mmhg', label: 'MAP (mmHg)', step: '1', min: 0, max: 150, optional: true },
            { name: 'dopamine_mcg_kg_min', label: 'Dopamine (mcg/kg/min)', step: '0.1', min: 0, max: 30, optional: true },
            { name: 'dobutamine_mcg_kg_min', label: 'Dobutamine (mcg/kg/min)', step: '0.1', min: 0, max: 30, optional: true },
            { name: 'epinephrine_mcg_kg_min', label: 'Epinephrine (mcg/kg/min)', step: '0.01', min: 0, max: 1, optional: true },
            { name: 'norepinephrine_mcg_kg_min', label: 'Norepinephrine (mcg/kg/min)', step: '0.01', min: 0, max: 1, optional: true },
            { type: 'section', label: 'Neurological & Renal' },
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15, optional: true },
            { name: 'creatinine_mg_dl', label: 'Creatinine (mg/dL)', step: '0.01', min: 0, max: 20, optional: true },
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
        ],
        wasmFn: 'calculate_psofa_json',
    },
    {
        id: 'pelod2', name: 'PELOD-2', category: 'sepsis',
        description: 'Pediatric Logistic Organ Dysfunction Score 2', scoreRange: '0-33',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15, optional: true },
            { name: 'pupils_both_fixed', label: 'Both Pupils Fixed', type: 'toggle' },
            { name: 'lactate_mmol_l', label: 'Lactate (mmol/L)', step: '0.1', min: 0, max: 30, optional: true },
            { name: 'map_mmhg', label: 'MAP (mmHg)', step: '1', min: 0, max: 150, optional: true },
            { name: 'age_months', label: 'Age (months)', step: '1', min: 0, max: 216 },
            { name: 'creatinine_mg_dl', label: 'Creatinine (mg/dL)', step: '0.01', min: 0, max: 20, optional: true },
            { name: 'pao2_fio2_ratio', label: 'PaO₂/FiO₂ Ratio', step: '1', min: 0, max: 700, optional: true },
            { name: 'paco2_mmhg', label: 'PaCO₂ (mmHg)', step: '1', min: 0, max: 150, optional: true },
            { name: 'on_invasive_ventilation', label: 'Invasive Ventilation', type: 'toggle' },
            { name: 'wbc_thousands', label: 'WBC (×10³/μL)', step: '0.1', min: 0, max: 100, optional: true },
            { name: 'platelets_thousands', label: 'Platelets (×10³/μL)', step: '1', min: 0, max: 1000, optional: true },
        ],
        wasmFn: 'calculate_pelod2_json',
    },
    {
        id: 'prism3', name: 'PRISM III', category: 'sepsis',
        description: 'Pediatric Risk of Mortality III', scoreRange: '0-74',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'age_group', label: 'Age Group', type: 'select', options: ['neonate', 'infant', 'child', 'adolescent'] },
            { name: 'systolic_bp', label: 'Systolic BP (mmHg)', step: '1', min: 0, max: 200, optional: true },
            { name: 'heart_rate', label: 'Heart Rate (bpm)', step: '1', min: 0, max: 300, optional: true },
            { name: 'temperature_c', label: 'Temperature (°C)', step: '0.1', min: 25, max: 43, optional: true },
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15, optional: true },
            { name: 'pupil_reaction', label: 'Pupil Reaction', type: 'select', options: ['normal', 'unequal_dilated', 'both_fixed'], optional: true },
            { name: 'ph', label: 'pH', step: '0.01', min: 6.5, max: 8.0, optional: true },
            { name: 'paco2', label: 'PaCO₂ (mmHg)', step: '1', min: 0, max: 150, optional: true },
            { name: 'pao2', label: 'PaO₂ (mmHg)', step: '1', min: 0, max: 600, optional: true },
            { name: 'glucose_mg_dl', label: 'Glucose (mg/dL)', step: '1', min: 0, max: 1000, optional: true },
            { name: 'potassium_meq_l', label: 'Potassium (mEq/L)', step: '0.1', min: 0, max: 10, optional: true },
            { name: 'creatinine_mg_dl', label: 'Creatinine (mg/dL)', step: '0.01', min: 0, max: 20, optional: true },
            { name: 'bun_mg_dl', label: 'BUN (mg/dL)', step: '1', min: 0, max: 200, optional: true },
            { name: 'wbc_thousands', label: 'WBC (×10³/μL)', step: '0.1', min: 0, max: 100, optional: true },
            { name: 'platelets_thousands', label: 'Platelets (×10³/μL)', step: '1', min: 0, max: 1000, optional: true },
            { name: 'pt_seconds', label: 'PT (sec)', step: '0.1', min: 0, max: 50, optional: true },
            { name: 'ptt_seconds', label: 'PTT (sec)', step: '0.1', min: 0, max: 120, optional: true },
        ],
        wasmFn: 'calculate_prism3_json',
    },
    {
        id: 'pim3', name: 'PIM-3', category: 'sepsis',
        description: 'Pediatric Index of Mortality 3', scoreRange: 'Mortality %',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'systolic_bp', label: 'Systolic BP (mmHg)', step: '1', min: 0, max: 200, optional: true },
            { name: 'pupils_fixed', label: 'Both Pupils Fixed (>3mm)', type: 'toggle' },
            { name: 'fio2', label: 'FiO₂ (decimal)', step: '0.01', min: 0.21, max: 1.0, optional: true },
            { name: 'pao2_mmhg', label: 'PaO₂ (mmHg)', step: '1', min: 0, max: 600, optional: true },
            { name: 'base_excess', label: 'Base Excess (mEq/L)', step: '0.1', min: -30, max: 30, optional: true },
            { name: 'mechanical_ventilation', label: 'Mechanical Ventilation (1st hour)', type: 'toggle' },
            { name: 'elective_admission', label: 'Elective Admission', type: 'toggle' },
            { name: 'recovery_from_surgery', label: 'Recovery from Surgery', type: 'toggle' },
            { name: 'low_risk_diagnosis', label: 'Low Risk Diagnosis', type: 'toggle' },
            { name: 'high_risk_diagnosis', label: 'High Risk Diagnosis', type: 'toggle' },
        ],
        wasmFn: 'calculate_pim3_json',
    },

    // ── PEWS ──
    {
        id: 'bedside-pews', name: 'Bedside PEWS', category: 'pews',
        description: 'SickKids Bedside Pediatric Early Warning Score', scoreRange: '0-28',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'heart_rate_score', label: 'Heart Rate Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'systolic_bp_score', label: 'Systolic BP Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'respiratory_rate_score', label: 'Respiratory Rate Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'spo2_score', label: 'SpO₂ Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'work_of_breathing_score', label: 'Work of Breathing Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'capillary_refill_score', label: 'Capillary Refill Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'cns_behavior_score', label: 'CNS/Behavior Score', type: 'select', options: ['0', '1', '2', '3'] },
        ],
        wasmFn: 'calculate_bedside_pews_json',
    },
    {
        id: 'brighton-pews', name: 'Brighton PEWS', category: 'pews',
        description: 'Monaghan Brighton PEWS', scoreRange: '0-11',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'behavior_score', label: 'Behavior Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'cardiovascular_score', label: 'Cardiovascular Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'respiratory_score', label: 'Respiratory Score', type: 'select', options: ['0', '1', '2', '3'] },
            { name: 'nebulizer_q15_or_persistent_postop_vomiting', label: 'Nebulizer Q15min or Persistent Post-op Vomiting', type: 'toggle' },
        ],
        wasmFn: 'calculate_brighton_pews_json',
    },

    // ── NEONATAL ──
    {
        id: 'apgar', name: 'Apgar Score', category: 'neonatal',
        description: 'Delivery room assessment at 1 and 5 minutes', scoreRange: '0-10',
        modes: ['neonatal'],
        fields: [
            { name: 'appearance', label: 'Appearance', type: 'select', options: ['0 - Blue/Pale', '1 - Acrocyanotic', '2 - Completely pink'] },
            { name: 'pulse', label: 'Pulse', type: 'select', options: ['0 - Absent', '1 - <100 bpm', '2 - >=100 bpm'] },
            { name: 'grimace', label: 'Grimace', type: 'select', options: ['0 - No response', '1 - Grimace', '2 - Vigorous cry'] },
            { name: 'activity', label: 'Activity', type: 'select', options: ['0 - Limp', '1 - Some flexion', '2 - Active'] },
            { name: 'respiration', label: 'Respiration', type: 'select', options: ['0 - Absent', '1 - Slow/irregular', '2 - Good/crying'] },
        ],
        wasmFn: 'calculate_apgar_scoring_json',
    },
    {
        id: 'snappe2', name: 'SNAPPE-II', category: 'neonatal',
        description: 'Score for Neonatal Acute Physiology with Perinatal Extension', scoreRange: '0-162',
        modes: ['neonatal'],
        fields: [
            { name: 'mean_bp_lowest', label: 'Lowest Mean BP (mmHg)', step: '1', min: 0, max: 100 },
            { name: 'temperature_lowest_c', label: 'Lowest Temperature (°C)', step: '0.1', min: 30, max: 40 },
            { name: 'po2_fio2_ratio_lowest', label: 'Lowest PO₂/FiO₂ Ratio', step: '0.01', min: 0, max: 10 },
            { name: 'serum_ph_lowest', label: 'Lowest Serum pH', step: '0.01', min: 6.5, max: 8.0 },
            { name: 'multiple_seizures', label: 'Multiple Seizures', type: 'toggle' },
            { name: 'urine_output_ml_kg_hr', label: 'Urine Output (mL/kg/hr)', step: '0.1', min: 0, max: 10 },
            { name: 'birth_weight_grams', label: 'Birth Weight (grams)', step: '1', min: 200, max: 6000 },
            { name: 'small_for_gestational_age', label: 'Small for Gestational Age', type: 'toggle' },
            { name: 'apgar_5_min', label: 'Apgar at 5 min', step: '1', min: 0, max: 10 },
        ],
        wasmFn: 'calculate_snappe2_json',
    },
    {
        id: 'crib2', name: 'CRIB-II', category: 'neonatal',
        description: 'Clinical Risk Index for Babies II (<32 weeks GA)', scoreRange: 'Risk Score',
        modes: ['neonatal'],
        fields: [
            { name: 'sex', label: 'Sex', type: 'select', options: ['male', 'female'] },
            { name: 'birth_weight_grams', label: 'Birth Weight (grams)', step: '1', min: 200, max: 6000 },
            { name: 'gestational_age_weeks', label: 'Gestational Age (weeks)', step: '0.1', min: 22, max: 32 },
            { name: 'base_excess_worst', label: 'Worst Base Excess (mEq/L)', step: '0.1', min: -30, max: 10 },
            { name: 'admission_temperature_c', label: 'Admission Temperature (°C)', step: '0.1', min: 30, max: 40 },
        ],
        wasmFn: 'calculate_crib2_json',
    },
    {
        id: 'sarnat', name: 'Modified Sarnat Staging', category: 'neonatal',
        description: 'HIE staging with hypothermia cooling eligibility', scoreRange: 'Stage 1-3',
        modes: ['neonatal'],
        fields: [
            { name: 'consciousness', label: 'Consciousness', type: 'select', options: ['1 - Hyperalert', '2 - Lethargic', '3 - Comatose'] },
            { name: 'spontaneous_activity', label: 'Spontaneous Activity', type: 'select', options: ['1 - Normal', '2 - Decreased', '3 - No activity'] },
            { name: 'posture', label: 'Posture', type: 'select', options: ['1 - Mild flexion', '2 - Strong flexion', '3 - Decerebration'] },
            { name: 'tone', label: 'Tone', type: 'select', options: ['1 - Normal', '2 - Hypotonia', '3 - Flaccid'] },
            { name: 'primitive_reflexes', label: 'Primitive Reflexes', type: 'select', options: ['1 - Normal', '2 - Weak', '3 - Absent'] },
            { name: 'autonomic', label: 'Autonomic', type: 'select', options: ['1 - Normal', '2 - Constricted pupils/brady', '3 - Dilated/apnea'] },
            { type: 'section', label: 'Cooling Eligibility' },
            { name: 'gestational_age_weeks', label: 'Gestational Age (weeks)', step: '0.1', min: 22, max: 42 },
            { name: 'ph', label: 'Cord/Initial pH', step: '0.01', min: 6.5, max: 8.0, optional: true },
            { name: 'base_excess', label: 'Base Excess (mEq/L)', step: '0.1', min: -30, max: 10, optional: true },
            { name: 'apgar_10_min', label: 'Apgar at 10 min', step: '1', min: 0, max: 10, optional: true },
            { name: 'resuscitation_minutes', label: 'Resuscitation Duration (min)', step: '1', min: 0, max: 60, optional: true },
        ],
        wasmFn: 'calculate_sarnat_scoring_json',
    },
    {
        id: 'finnegan', name: 'Finnegan FNASS', category: 'neonatal',
        description: 'Neonatal Abstinence Scoring System', scoreRange: '0-45',
        modes: ['neonatal'],
        fields: [
            { type: 'section', label: 'CNS Disturbances' },
            { name: 'cry', label: 'Cry', type: 'select', options: ['0 - Normal', '2 - Excessive high-pitched', '3 - Continuous'] },
            { name: 'sleep_after_feeding', label: 'Sleep After Feeding', type: 'select', options: ['0 - >3 hours', '1 - <3 hours', '2 - <2 hours', '3 - <1 hour'] },
            { name: 'moro_reflex', label: 'Moro Reflex', type: 'select', options: ['0 - Normal', '2 - Hyperactive', '3 - Markedly hyperactive'] },
            { name: 'tremors_disturbed', label: 'Tremors (Disturbed)', type: 'select', options: ['0 - None', '1 - Mild', '2 - Moderate-severe'] },
            { name: 'tremors_undisturbed', label: 'Tremors (Undisturbed)', type: 'select', options: ['0 - None', '3 - Mild', '4 - Moderate-severe'] },
            { name: 'increased_muscle_tone', label: 'Increased Muscle Tone', type: 'toggle' },
            { name: 'excoriation', label: 'Excoriation', type: 'toggle' },
            { name: 'myoclonic_jerks', label: 'Myoclonic Jerks', type: 'toggle' },
            { name: 'generalized_convulsions', label: 'Generalized Convulsions', type: 'toggle' },
            { type: 'section', label: 'Metabolic/Vasomotor/Respiratory' },
            { name: 'sweating', label: 'Sweating', type: 'toggle' },
            { name: 'temperature_37_2_to_38_3', label: 'Temp 37.2-38.3°C', type: 'toggle' },
            { name: 'temperature_above_38_4', label: 'Temp >38.4°C', type: 'toggle' },
            { name: 'frequent_yawning', label: 'Frequent Yawning', type: 'toggle' },
            { name: 'mottling', label: 'Mottling', type: 'toggle' },
            { name: 'nasal_stuffiness', label: 'Nasal Stuffiness', type: 'toggle' },
            { name: 'sneezing', label: 'Sneezing', type: 'toggle' },
            { name: 'nasal_flaring', label: 'Nasal Flaring', type: 'toggle' },
            { name: 'resp_rate_above_60', label: 'RR >60', type: 'toggle' },
            { name: 'resp_rate_above_60_with_retractions', label: 'RR >60 with Retractions', type: 'toggle' },
            { type: 'section', label: 'Gastrointestinal' },
            { name: 'excessive_sucking', label: 'Excessive Sucking', type: 'toggle' },
            { name: 'poor_feeding', label: 'Poor Feeding', type: 'toggle' },
            { name: 'regurgitation', label: 'Regurgitation', type: 'toggle' },
            { name: 'projectile_vomiting', label: 'Projectile Vomiting', type: 'toggle' },
            { name: 'loose_stools', label: 'Loose Stools', type: 'toggle' },
            { name: 'watery_stools', label: 'Watery Stools', type: 'toggle' },
        ],
        wasmFn: 'calculate_finnegan_json',
    },
    {
        id: 'silverman-anderson', name: 'Silverman-Anderson', category: 'neonatal',
        description: 'Neonatal respiratory distress retraction score', scoreRange: '0-10',
        modes: ['neonatal'],
        fields: [
            { name: 'upper_chest_movement', label: 'Upper Chest', type: 'select', options: ['0 - Synchronized', '1 - Lag', '2 - See-saw'] },
            { name: 'lower_chest_retractions', label: 'Lower Chest Retractions', type: 'select', options: ['0 - None', '1 - Present', '2 - Marked'] },
            { name: 'xiphoid_retractions', label: 'Xiphoid Retractions', type: 'select', options: ['0 - None', '1 - Present', '2 - Marked'] },
            { name: 'nasal_flaring', label: 'Nasal Flaring', type: 'select', options: ['0 - None', '1 - Minimal', '2 - Marked'] },
            { name: 'expiratory_grunt', label: 'Expiratory Grunt', type: 'select', options: ['0 - None', '1 - Stethoscope only', '2 - Audible'] },
        ],
        wasmFn: 'calculate_silverman_anderson_json',
    },
    {
        id: 'downes', name: 'Downes Score', category: 'neonatal',
        description: 'Modified Downes neonatal respiratory distress assessment', scoreRange: '0-10',
        modes: ['neonatal'],
        fields: [
            { name: 'respiratory_rate', label: 'Respiratory Rate', type: 'select', options: ['0 - <60', '1 - 60-80', '2 - >80'] },
            { name: 'cyanosis', label: 'Cyanosis', type: 'select', options: ['0 - None', '1 - Resolves with O₂', '2 - Despite O₂'] },
            { name: 'retractions', label: 'Retractions', type: 'select', options: ['0 - None', '1 - Mild', '2 - Severe'] },
            { name: 'grunting', label: 'Grunting', type: 'select', options: ['0 - None', '1 - Stethoscope', '2 - Audible'] },
            { name: 'air_entry', label: 'Air Entry', type: 'select', options: ['0 - Clear', '1 - Decreased', '2 - Barely audible'] },
        ],
        wasmFn: 'calculate_downes_json',
    },

    {
        id: 'fio2-blending', name: 'FiO₂ Blending Calculator', category: 'neonatal',
        description: 'Calculate air/O₂ flow mix to achieve target FiO₂', scoreRange: 'L/min',
        modes: ['neonatal', 'pediatric'],
        fields: [
            { name: 'target_fio2', label: 'Target FiO₂ (%)', step: '1', min: 21, max: 100 },
            { name: 'total_flow', label: 'Total Flow Desired (L/min)', step: '0.5', min: 0.5, max: 15 },
        ],
        jsFn: (input) => {
            const target = (input.target_fio2 || 21) / 100;
            const totalFlow = input.total_flow || 5;
            // Air is 0.21, O2 is 1.0 → solve: 0.21×air + 1.0×o2 = target×total, air+o2 = total
            const o2Flow = totalFlow * (target - 0.21) / (1.0 - 0.21);
            const airFlow = totalFlow - o2Flow;
            return {
                title: 'FiO₂ Blending Calculator',
                target_FiO2: (target * 100).toFixed(0) + '%',
                total_flow: totalFlow.toFixed(1) + ' L/min',
                oxygen_flow: Math.max(0, o2Flow).toFixed(1) + ' L/min',
                air_flow: Math.max(0, airFlow).toFixed(1) + ' L/min',
                note: target <= 0.21 ? 'Room air only — no supplemental O₂ needed' :
                      target >= 1.0 ? '100% O₂ — no air blending' :
                      'Set oxygen flowmeter to ' + Math.max(0, o2Flow).toFixed(1) + ' L/min and air to ' + Math.max(0, airFlow).toFixed(1) + ' L/min',
            };
        },
        wasmFn: 'calculate_fio2_blending_json',
    },
    {
        id: 'surfactant-dosing', name: 'Surfactant Dosing', category: 'neonatal',
        description: 'Neonatal surfactant dose calculation by preparation type', scoreRange: 'mL',
        modes: ['neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.01', min: 0.3, max: 6 },
            { name: 'preparation', label: 'Surfactant Preparation', type: 'select', options: ['Poractant alfa (Curosurf) — 200 mg/kg initial', 'Beractant (Survanta) — 100 mg/kg', 'Calfactant (Infasurf) — 105 mg/kg', 'Lucinactant (Surfaxin) — 175 mg/kg'] },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 1;
            const prep = input.preparation || '';
            let dosePerKg, concentration, name, redose;
            if (prep.includes('Poractant')) {
                name = 'Poractant alfa (Curosurf)';
                dosePerKg = 200; concentration = 80; // mg/mL
                redose = '100 mg/kg (1.25 mL/kg) for subsequent doses, up to 2 repeat doses at ≥12h intervals';
            } else if (prep.includes('Beractant')) {
                name = 'Beractant (Survanta)';
                dosePerKg = 100; concentration = 25; // mg/mL
                redose = '100 mg/kg (4 mL/kg) repeat up to 3 additional doses at ≥6h intervals';
            } else if (prep.includes('Calfactant')) {
                name = 'Calfactant (Infasurf)';
                dosePerKg = 105; concentration = 35; // mg/mL
                redose = '105 mg/kg (3 mL/kg) repeat up to 2 additional doses at ≥12h intervals';
            } else {
                name = 'Lucinactant (Surfaxin)';
                dosePerKg = 175; concentration = 30; // mg/mL
                redose = 'Up to 4 doses total in the first 48 hours';
            }
            const totalDose = dosePerKg * wt;
            const volume = totalDose / concentration;
            return {
                title: 'Surfactant Dosing — ' + name,
                patient_weight: wt.toFixed(2) + ' kg',
                initial_dose: totalDose.toFixed(0) + ' mg (' + dosePerKg + ' mg/kg)',
                volume_to_administer: volume.toFixed(1) + ' mL',
                concentration: concentration + ' mg/mL',
                administration: 'Administer via ETT in aliquots (typically 4 aliquots) with position changes. Give over 1-5 minutes.',
                repeat_dosing: redose,
                monitoring: ['Monitor SpO₂ and ventilator pressures continuously during administration', 'Rapid improvement may require quick FiO₂ and PIP reduction', 'Suction ETT only if necessary — avoid for ≥1 hour after dosing'],
            };
        },
        wasmFn: 'calculate_surfactant_dosing_json',
    },

    // ── RESPIRATORY / CARDIAC ──
    {
        id: 'oxygenation-index', name: 'OI / OSI', category: 'respiratory',
        description: 'Oxygenation Index and Oxygen Saturation Index (PARDS severity)', scoreRange: 'OI/OSI',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'fio2', label: 'FiO₂ (decimal 0.21-1.0)', step: '0.01', min: 0.21, max: 1.0 },
            { name: 'mean_airway_pressure', label: 'Mean Airway Pressure (cmH₂O)', step: '0.1', min: 0, max: 50 },
            { name: 'pao2', label: 'PaO₂ (mmHg)', step: '1', min: 0, max: 600, optional: true },
            { name: 'spo2', label: 'SpO₂ (%, valid if ≤97)', step: '1', min: 0, max: 100, optional: true },
        ],
        wasmFn: 'calculate_oxygenation_index_json',
    },
    {
        id: 'vis', name: 'VIS', category: 'respiratory',
        description: 'Vasoactive-Inotropic Score', scoreRange: '0-∞',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'dopamine_mcg_kg_min', label: 'Dopamine (mcg/kg/min)', step: '0.1', min: 0, max: 30 },
            { name: 'dobutamine_mcg_kg_min', label: 'Dobutamine (mcg/kg/min)', step: '0.1', min: 0, max: 30 },
            { name: 'epinephrine_mcg_kg_min', label: 'Epinephrine (mcg/kg/min)', step: '0.01', min: 0, max: 1 },
            { name: 'milrinone_mcg_kg_min', label: 'Milrinone (mcg/kg/min)', step: '0.01', min: 0, max: 1 },
            { name: 'vasopressin_u_kg_min', label: 'Vasopressin (U/kg/min)', step: '0.0001', min: 0, max: 0.01 },
            { name: 'norepinephrine_mcg_kg_min', label: 'Norepinephrine (mcg/kg/min)', step: '0.01', min: 0, max: 1 },
        ],
        wasmFn: 'calculate_vis_json',
    },
    {
        id: 'pram-scoring', name: 'PRAM (Scoring)', category: 'respiratory',
        description: 'Pediatric Respiratory Assessment Measure', scoreRange: '0-12',
        modes: ['pediatric'],
        fields: [
            { name: 'o2_saturation_score', label: 'O₂ Saturation', type: 'select', options: ['0 - ≥95%', '1 - 92-94%', '2 - <92%'] },
            { name: 'suprasternal_retractions', label: 'Suprasternal Retractions', type: 'toggle' },
            { name: 'scalene_muscle_contraction', label: 'Scalene Muscle Contraction', type: 'toggle' },
            { name: 'air_entry_score', label: 'Air Entry', type: 'select', options: ['0 - Normal', '1 - Decreased at bases', '2 - Widespread decrease', '3 - Absent/minimal'] },
            { name: 'wheezing_score', label: 'Wheezing', type: 'select', options: ['0 - Absent', '1 - Expiratory only', '2 - Inspiratory + expiratory', '3 - Audible without stethoscope / silent chest'] },
        ],
        wasmFn: 'calculate_pram_score_json',
    },
    {
        id: 'qtc-scoring', name: 'Corrected QT (QTc)', category: 'respiratory',
        description: 'Bazett & Fridericia QTc formulas', scoreRange: 'ms',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'qt_ms', label: 'QT Interval (ms)', step: '1', min: 200, max: 700 },
            { name: 'heart_rate_bpm', label: 'Heart Rate (bpm)', step: '1', min: 30, max: 300 },
        ],
        wasmFn: 'calculate_qtc_scoring_json',
    },

    // ── TRAUMA ──
    {
        id: 'pediatric-gcs', name: 'Pediatric GCS', category: 'trauma',
        description: 'Glasgow Coma Scale with pediatric modification', scoreRange: '3-15',
        modes: ['pediatric'],
        fields: [
            { name: 'eye_opening', label: 'Eye Opening', type: 'select', options: ['1 - None', '2 - To pain', '3 - To voice', '4 - Spontaneous'] },
            { name: 'verbal_response', label: 'Verbal Response', type: 'select', options: ['1 - None', '2 - Moans', '3 - Cries/inappropriate', '4 - Irritable/confused', '5 - Coos/oriented'] },
            { name: 'motor_response', label: 'Motor Response', type: 'select', options: ['1 - None', '2 - Extension', '3 - Abnormal flexion', '4 - Withdraws', '5 - Localizes', '6 - Obeys/spontaneous'] },
            { name: 'pre_verbal', label: 'Pre-verbal child', type: 'toggle' },
        ],
        wasmFn: 'calculate_pediatric_gcs_json',
    },
    {
        id: 'pts', name: 'Pediatric Trauma Score', category: 'trauma',
        description: 'Triage scoring for pediatric trauma', scoreRange: '-6 to 12',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_score', label: 'Weight', type: 'select', options: ['-1 - <10 kg', '1 - 10-20 kg', '2 - >20 kg'] },
            { name: 'airway_score', label: 'Airway', type: 'select', options: ['-1 - Unmaintainable', '1 - Maintainable', '2 - Normal'] },
            { name: 'sbp_score', label: 'SBP', type: 'select', options: ['-1 - <50 mmHg', '1 - 50-90 mmHg', '2 - >90 mmHg'] },
            { name: 'cns_score', label: 'CNS', type: 'select', options: ['-1 - Coma', '1 - Obtunded', '2 - Awake'] },
            { name: 'open_wound_score', label: 'Open Wound', type: 'select', options: ['-1 - Major/penetrating', '1 - Minor', '2 - None'] },
            { name: 'skeletal_score', label: 'Skeletal', type: 'select', options: ['-1 - Open/multiple', '1 - Closed fracture', '2 - None'] },
        ],
        wasmFn: 'calculate_pts_json',
    },
    {
        id: 'big-score', name: 'BIG Score', category: 'trauma',
        description: 'Base deficit, INR, GCS — rapid trauma mortality prediction', scoreRange: '0-30+',
        modes: ['pediatric'],
        fields: [
            { name: 'base_deficit', label: 'Base Deficit (absolute value)', step: '0.1', min: 0, max: 30 },
            { name: 'inr', label: 'INR', step: '0.1', min: 0.5, max: 10 },
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15 },
        ],
        wasmFn: 'calculate_big_json',
    },
    {
        id: 'pecarn', name: 'PECARN TBI', category: 'trauma',
        description: 'Head injury CT decision rule (age-stratified)', scoreRange: 'Risk Level',
        modes: ['pediatric'],
        fields: [
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
            { name: 'gcs_less_than_15', label: 'GCS < 15', type: 'toggle' },
            { name: 'altered_mental_status', label: 'Altered Mental Status', type: 'toggle' },
            { name: 'palpable_skull_fracture', label: 'Palpable Skull Fracture (<2y)', type: 'toggle' },
            { name: 'signs_basilar_skull_fracture', label: 'Signs of Basilar Skull Fracture (≥2y)', type: 'toggle' },
            { name: 'scalp_hematoma_otp', label: 'Scalp Hematoma (occipital/parietal/temporal, <2y)', type: 'toggle' },
            { name: 'loc_gte_5_seconds', label: 'LOC ≥5 seconds (<2y)', type: 'toggle' },
            { name: 'loc', label: 'LOC (≥2y)', type: 'toggle' },
            { name: 'severe_mechanism', label: 'Severe Mechanism of Injury', type: 'toggle' },
            { name: 'not_acting_normally', label: 'Not Acting Normally (per parent, <2y)', type: 'toggle' },
            { name: 'history_of_vomiting', label: 'History of Vomiting (≥2y)', type: 'toggle' },
            { name: 'severe_headache', label: 'Severe Headache (≥2y)', type: 'toggle' },
        ],
        wasmFn: 'calculate_pecarn_json',
    },

    {
        id: 'rts', name: 'Revised Trauma Score (RTS)', category: 'trauma',
        description: 'Champion 1989 — weighted sum of coded GCS, SBP, respiratory rate', scoreRange: '0-7.84',
        modes: ['pediatric'],
        fields: [
            { name: 'gcs', label: 'GCS', step: '1', min: 3, max: 15 },
            { name: 'sbp', label: 'Systolic BP (mmHg)', step: '1', min: 0, max: 300 },
            { name: 'respiratory_rate', label: 'Respiratory Rate', step: '1', min: 0, max: 80 },
        ],
        jsFn: (input) => {
            const gcsCode = input.gcs === 15 ? 4 : input.gcs >= 13 ? 4 : input.gcs >= 9 ? 3 : input.gcs >= 6 ? 2 : input.gcs >= 4 ? 1 : 0;
            const sbpCode = input.sbp > 89 ? 4 : input.sbp >= 76 ? 3 : input.sbp >= 50 ? 2 : input.sbp >= 1 ? 1 : 0;
            const rrCode = input.respiratory_rate >= 10 && input.respiratory_rate <= 29 ? 4 : input.respiratory_rate > 29 ? 3 : input.respiratory_rate >= 6 ? 2 : input.respiratory_rate >= 1 ? 1 : 0;
            const rts = (0.9368 * gcsCode + 0.7326 * sbpCode + 0.2908 * rrCode);
            let interp = 'Low risk';
            if (rts < 4) interp = 'Critical — very high mortality';
            else if (rts < 6) interp = 'Moderate injury — consider trauma center';
            else if (rts < 7) interp = 'Mild-moderate injury';
            return {
                title: 'Revised Trauma Score (RTS)',
                score: rts.toFixed(2),
                coded_values: { GCS: gcsCode, SBP: sbpCode, RR: rrCode },
                interpretation: interp,
                note: 'RTS = 0.9368×GCS + 0.7326×SBP + 0.2908×RR (coded 0-4). Score <4 predicts high mortality.'
            };
        },
        wasmFn: 'calculate_rts_json',
    },
    {
        id: 'sipa', name: 'SIPA (Shock Index, Ped Age-Adjusted)', category: 'trauma',
        description: 'Age-adjusted HR/SBP ratio to detect occult hemorrhagic shock', scoreRange: 'Normal / Elevated',
        modes: ['pediatric'],
        fields: [
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
            { name: 'heart_rate', label: 'Heart Rate (bpm)', step: '1', min: 0, max: 300 },
            { name: 'sbp', label: 'Systolic BP (mmHg)', step: '1', min: 1, max: 300 },
        ],
        jsFn: (input) => {
            const si = input.sbp > 0 ? (input.heart_rate / input.sbp) : 0;
            const age = input.age_years;
            let threshold, ageGroup;
            if (age < 1) { threshold = 1.22; ageGroup = '< 1 year'; }
            else if (age < 2) { threshold = 1.22; ageGroup = '1-2 years'; }
            else if (age < 4) { threshold = 1.10; ageGroup = '2-4 years'; }
            else if (age < 6) { threshold = 1.00; ageGroup = '4-6 years'; }
            else if (age < 12) { threshold = 0.90; ageGroup = '6-12 years'; }
            else { threshold = 0.85; ageGroup = '≥12 years'; }
            const elevated = si > threshold;
            return {
                title: 'Shock Index, Pediatric Age-Adjusted (SIPA)',
                shock_index: si.toFixed(2),
                age_group: ageGroup,
                threshold: threshold.toFixed(2),
                status: elevated ? '⚠ ELEVATED — concern for occult hemorrhagic shock' : '✓ Normal',
                interpretation: elevated
                    ? 'Elevated SIPA is associated with increased need for transfusion, ICU admission, and higher injury severity.'
                    : 'SIPA within normal range for age. Continue clinical monitoring.',
                reference: 'Acker et al. J Trauma Acute Care Surg 2015; Nordin et al. Ann Surg 2017'
            };
        },
        wasmFn: 'calculate_sipa_json',
    },
    {
        id: 'lund-browder', name: 'Lund-Browder Burn Estimate', category: 'trauma',
        description: 'Age-adjusted TBSA% for pediatric burn area estimation + Parkland fluid calc', scoreRange: 'TBSA %',
        modes: ['pediatric'],
        fields: [
            { type: 'section', label: 'Patient Data' },
            { name: 'age_years', label: 'Age (years)', step: '0.5', min: 0, max: 18 },
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 1, max: 120 },
            { type: 'section', label: 'Head & Neck' },
            { name: 'head_burn', label: 'Head (% affected)', step: '1', min: 0, max: 100 },
            { name: 'neck_burn', label: 'Neck (% affected)', step: '1', min: 0, max: 100 },
            { type: 'section', label: 'Trunk' },
            { name: 'anterior_trunk_burn', label: 'Anterior Trunk (% affected)', step: '1', min: 0, max: 100 },
            { name: 'posterior_trunk_burn', label: 'Posterior Trunk (% affected)', step: '1', min: 0, max: 100 },
            { type: 'section', label: 'Upper Extremities' },
            { name: 'upper_arm_burn', label: 'Upper Arms L+R (% affected)', step: '1', min: 0, max: 100 },
            { name: 'lower_arm_burn', label: 'Lower Arms L+R (% affected)', step: '1', min: 0, max: 100 },
            { name: 'hand_burn', label: 'Hands L+R (% affected)', step: '1', min: 0, max: 100 },
            { type: 'section', label: 'Lower Extremities' },
            { name: 'thigh_burn', label: 'Thighs L+R (% affected)', step: '1', min: 0, max: 100 },
            { name: 'lower_leg_burn', label: 'Lower Legs L+R (% affected)', step: '1', min: 0, max: 100 },
            { name: 'foot_burn', label: 'Feet L+R (% affected)', step: '1', min: 0, max: 100 },
            { type: 'section', label: 'Other' },
            { name: 'genitalia_burn', label: 'Genitalia (% affected)', step: '1', min: 0, max: 100 },
        ],
        jsFn: (input) => {
            const age = input.age_years || 0;
            // Lund-Browder age-adjusted %TBSA for each region (full region = 100%)
            let headPct, thighPct, legPct;
            if (age < 1) { headPct = 19; thighPct = 5.5; legPct = 5; }
            else if (age < 5) { headPct = 17; thighPct = 6.5; legPct = 5; }
            else if (age < 10) { headPct = 13; thighPct = 8; legPct = 5.5; }
            else if (age < 15) { headPct = 11; thighPct = 8.5; legPct = 6; }
            else { headPct = 9; thighPct = 9; legPct = 6.5; }
            const neckPct = 2, antTrunkPct = 13, postTrunkPct = 13;
            const upperArmPct = 8, lowerArmPct = 6, handPct = 5;
            const footPct = 3.5, genPct = 1;
            // Calculate TBSA
            const headBurn = (input.head_burn || 0) / 100 * headPct;
            const neckBurn = (input.neck_burn || 0) / 100 * neckPct;
            const antTrunk = (input.anterior_trunk_burn || 0) / 100 * antTrunkPct;
            const postTrunk = (input.posterior_trunk_burn || 0) / 100 * postTrunkPct;
            const upperArm = (input.upper_arm_burn || 0) / 100 * upperArmPct;
            const lowerArm = (input.lower_arm_burn || 0) / 100 * lowerArmPct;
            const hand = (input.hand_burn || 0) / 100 * handPct;
            const thigh = (input.thigh_burn || 0) / 100 * thighPct;
            const lowerLeg = (input.lower_leg_burn || 0) / 100 * legPct;
            const foot = (input.foot_burn || 0) / 100 * footPct;
            const gen = (input.genitalia_burn || 0) / 100 * genPct;
            const tbsa = headBurn + neckBurn + antTrunk + postTrunk + upperArm + lowerArm + hand + thigh + lowerLeg + foot + gen;
            // Parkland formula
            const wt = input.weight_kg || 0;
            const parkland24 = 4 * wt * tbsa;
            const first8h = parkland24 / 2;
            const next16h = parkland24 / 2;
            const maintenanceRate = wt > 0 ? (wt <= 10 ? wt * 4 : wt <= 20 ? 40 + (wt - 10) * 2 : 60 + (wt - 20)) : 0;
            const result = {
                title: 'Lund-Browder Burn Estimate & Parkland Fluid Resuscitation',
                total_TBSA_percent: tbsa.toFixed(1) + '%',
                burn_area_breakdown: {
                    head: headBurn.toFixed(1) + '%',
                    neck: neckBurn.toFixed(1) + '%',
                    anterior_trunk: antTrunk.toFixed(1) + '%',
                    posterior_trunk: postTrunk.toFixed(1) + '%',
                    upper_arms: upperArm.toFixed(1) + '%',
                    lower_arms: lowerArm.toFixed(1) + '%',
                    hands: hand.toFixed(1) + '%',
                    thighs: thigh.toFixed(1) + '%',
                    lower_legs: lowerLeg.toFixed(1) + '%',
                    feet: foot.toFixed(1) + '%',
                    genitalia: gen.toFixed(1) + '%',
                },
            };
            if (tbsa >= 10 && wt > 0) {
                result.parkland_formula = {
                    total_24h: Math.round(parkland24) + ' mL',
                    first_8h: Math.round(first8h) + ' mL (' + Math.round(first8h / 8) + ' mL/hr)',
                    next_16h: Math.round(next16h) + ' mL (' + Math.round(next16h / 16) + ' mL/hr)',
                    plus_maintenance: Math.round(maintenanceRate) + ' mL/hr',
                    formula: '4 mL × ' + wt + ' kg × ' + tbsa.toFixed(1) + '% TBSA',
                };
                result.note = 'Parkland: Give half in first 8h from time of burn, half over next 16h. Add maintenance fluids for children. Titrate to urine output 1 mL/kg/hr.';
            } else if (tbsa < 10) {
                result.note = 'TBSA <10% — fluid resuscitation per Parkland formula generally not required. Oral hydration may suffice.';
            }
            if (tbsa >= 20) {
                result.severity = '⚠ MAJOR BURN — Refer to burn center';
            } else if (tbsa >= 10) {
                result.severity = 'Moderate burn — Consider burn center referral';
            } else {
                result.severity = 'Minor burn';
            }
            return result;
        },
        wasmFn: 'calculate_lund_browder_json',
    },

    // ── RENAL ──
    {
        id: 'schwartz', name: 'Schwartz eGFR', category: 'renal-scoring',
        description: 'Bedside Schwartz equation for pediatric eGFR', scoreRange: 'mL/min/1.73m²',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'height_cm', label: 'Height (cm)', step: '0.1', min: 20, max: 200 },
            { name: 'serum_creatinine_mg_dl', label: 'Serum Creatinine (mg/dL)', step: '0.01', min: 0.01, max: 20 },
            { name: 'patient_type', label: 'Patient Type', type: 'select', options: ['child', 'neonate', 'preterm'] },
        ],
        wasmFn: 'calculate_schwartz_scoring_json',
    },
    {
        id: 'kdigo', name: 'KDIGO AKI', category: 'renal-scoring',
        description: 'Acute Kidney Injury staging (creatinine + urine output)', scoreRange: 'Stage 0-3',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'baseline_creatinine', label: 'Baseline Creatinine (mg/dL)', step: '0.01', min: 0, max: 20, optional: true },
            { name: 'current_creatinine', label: 'Current Creatinine (mg/dL)', step: '0.01', min: 0.01, max: 20 },
            { name: 'creatinine_48h_ago', label: 'Creatinine 48h Ago (mg/dL)', step: '0.01', min: 0, max: 20, optional: true },
            { name: 'urine_output_ml_kg_hr', label: 'Urine Output (mL/kg/hr)', step: '0.1', min: 0, max: 10, optional: true },
            { name: 'urine_output_duration_hours', label: 'UO Duration (hours)', step: '1', min: 0, max: 48, optional: true },
            { name: 'on_rrt', label: 'On Renal Replacement Therapy', type: 'toggle' },
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
            { name: 'egfr', label: 'eGFR (mL/min/1.73m²)', step: '1', min: 0, max: 200, optional: true },
        ],
        wasmFn: 'calculate_kdigo_json',
    },

    // ── PAIN & SEDATION ──
    {
        id: 'flacc', name: 'FLACC', category: 'pain',
        description: 'Face, Legs, Activity, Cry, Consolability pain scale (2mo-7yr)', scoreRange: '0-10',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'face', label: 'Face', type: 'select', options: ['0 - No expression', '1 - Occasional grimace', '2 - Frequent quivering chin'] },
            { name: 'legs', label: 'Legs', type: 'select', options: ['0 - Normal/relaxed', '1 - Uneasy/restless', '2 - Kicking/drawn up'] },
            { name: 'activity', label: 'Activity', type: 'select', options: ['0 - Lying quietly', '1 - Squirming/tense', '2 - Arched/rigid/jerking'] },
            { name: 'cry', label: 'Cry', type: 'select', options: ['0 - No cry', '1 - Moans/whimpers', '2 - Crying/screaming'] },
            { name: 'consolability', label: 'Consolability', type: 'select', options: ['0 - Content/relaxed', '1 - Reassured by touch', '2 - Difficult to console'] },
        ],
        wasmFn: 'calculate_flacc_json',
    },
    {
        id: 'nips', name: 'NIPS', category: 'pain',
        description: 'Neonatal Infant Pain Scale', scoreRange: '0-7',
        modes: ['neonatal'],
        fields: [
            { name: 'facial_expression', label: 'Facial Expression', type: 'select', options: ['0 - Relaxed', '1 - Grimace'] },
            { name: 'cry', label: 'Cry', type: 'select', options: ['0 - Quiet', '1 - Whimper', '2 - Vigorous cry'] },
            { name: 'breathing_pattern', label: 'Breathing Pattern', type: 'select', options: ['0 - Relaxed', '1 - Change in pattern'] },
            { name: 'arms', label: 'Arms', type: 'select', options: ['0 - Relaxed/restrained', '1 - Flexed/extended'] },
            { name: 'legs', label: 'Legs', type: 'select', options: ['0 - Relaxed/restrained', '1 - Flexed/extended'] },
            { name: 'state_of_arousal', label: 'State of Arousal', type: 'select', options: ['0 - Sleeping/calm', '1 - Fussy'] },
        ],
        wasmFn: 'calculate_nips_json',
    },
    {
        id: 'comfort-b', name: 'COMFORT-B', category: 'pain',
        description: 'Sedation scale for ventilated children', scoreRange: '6-30',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'alertness', label: 'Alertness', type: 'select', options: ['1 - Deeply asleep', '2 - Lightly asleep', '3 - Drowsy', '4 - Alert', '5 - Hyperalert'] },
            { name: 'calmness_agitation', label: 'Calmness/Agitation', type: 'select', options: ['1 - Calm', '2 - Slightly anxious', '3 - Anxious', '4 - Very anxious', '5 - Panicky'] },
            { name: 'respiratory_response', label: 'Respiratory Response', type: 'select', options: ['1 - No resp/cough', '2 - Spontaneous resp', '3 - Occasional cough', '4 - Active breathing', '5 - Fighting ventilator'] },
            { name: 'physical_movement', label: 'Physical Movement', type: 'select', options: ['1 - None', '2 - Occasional slight', '3 - Frequent slight', '4 - Vigorous extremity', '5 - Vigorous body+head'] },
            { name: 'muscle_tone', label: 'Muscle Tone', type: 'select', options: ['1 - Relaxed', '2 - Reduced', '3 - Normal', '4 - Increased', '5 - Extreme rigidity'] },
            { name: 'facial_tension', label: 'Facial Tension', type: 'select', options: ['1 - Relaxed', '2 - Normal', '3 - Some tension', '4 - Full tension', '5 - Facial muscles contorted'] },
        ],
        wasmFn: 'calculate_comfort_b_json',
    },
    {
        id: 'capd', name: 'CAPD', category: 'pain',
        description: 'Cornell Assessment of Pediatric Delirium', scoreRange: '0-32',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { type: 'section', label: 'Reverse-scored (4=Never)' },
            { name: 'eye_contact', label: 'Eye Contact', type: 'select', options: ['0 - Always', '1 - Often', '2 - Sometimes', '3 - Rarely', '4 - Never'] },
            { name: 'purposeful_actions', label: 'Purposeful Actions', type: 'select', options: ['0 - Always', '1 - Often', '2 - Sometimes', '3 - Rarely', '4 - Never'] },
            { name: 'aware_of_surroundings', label: 'Aware of Surroundings', type: 'select', options: ['0 - Always', '1 - Often', '2 - Sometimes', '3 - Rarely', '4 - Never'] },
            { name: 'communicates_needs', label: 'Communicates Needs', type: 'select', options: ['0 - Always', '1 - Often', '2 - Sometimes', '3 - Rarely', '4 - Never'] },
            { type: 'section', label: 'Forward-scored (4=Always)' },
            { name: 'restless', label: 'Restless', type: 'select', options: ['0 - Never', '1 - Rarely', '2 - Sometimes', '3 - Often', '4 - Always'] },
            { name: 'inconsolable', label: 'Inconsolable', type: 'select', options: ['0 - Never', '1 - Rarely', '2 - Sometimes', '3 - Often', '4 - Always'] },
            { name: 'underactive', label: 'Underactive', type: 'select', options: ['0 - Never', '1 - Rarely', '2 - Sometimes', '3 - Often', '4 - Always'] },
            { name: 'slow_responses', label: 'Slow Responses', type: 'select', options: ['0 - Never', '1 - Rarely', '2 - Sometimes', '3 - Often', '4 - Always'] },
        ],
        wasmFn: 'calculate_capd_json',
    },

    // ── BEDSIDE ──
    {
        id: 'maintenance-fluids', name: 'Maintenance Fluids', category: 'bedside',
        description: 'Holliday-Segar 4-2-1 rule', scoreRange: 'mL/hr',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 150 },
        ],
        wasmFn: 'calculate_maintenance_fluids_scoring_json',
    },
    {
        id: 'bsa', name: 'Body Surface Area', category: 'bedside',
        description: 'Mosteller, Haycock, DuBois formulas', scoreRange: 'm²',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'height_cm', label: 'Height (cm)', step: '0.1', min: 20, max: 200 },
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 150 },
        ],
        wasmFn: 'calculate_bsa_json',
    },
    {
        id: 'ebv', name: 'Estimated Blood Volume', category: 'bedside',
        description: 'EBV and maximum allowable blood loss', scoreRange: 'mL',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 150 },
            { name: 'age_group', label: 'Age Group', type: 'select', options: ['premature', 'term_neonate', 'infant', 'child', 'adolescent'] },
            { name: 'starting_hct', label: 'Starting Hct (%)', step: '0.1', min: 10, max: 70 },
            { name: 'target_hct', label: 'Target Hct (%)', step: '0.1', min: 10, max: 70 },
        ],
        wasmFn: 'calculate_ebv_scoring_json',
    },
    {
        id: 'ett-scoring', name: 'ETT Sizing', category: 'bedside',
        description: 'Endotracheal tube sizing by age/weight', scoreRange: 'mm',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18, optional: true },
            { name: 'weight_kg', label: 'Weight (kg, for neonates)', step: '0.1', min: 0.5, max: 10, optional: true },
        ],
        wasmFn: 'calculate_ett_scoring_json',
    },
    {
        id: 'corrected-age', name: 'Corrected Age', category: 'bedside',
        description: 'Corrected age for premature infants', scoreRange: 'weeks',
        modes: ['neonatal'],
        fields: [
            { name: 'chronological_age_weeks', label: 'Chronological Age (weeks)', step: '1', min: 0, max: 200 },
            { name: 'gestational_age_at_birth_weeks', label: 'GA at Birth (weeks)', step: '0.1', min: 22, max: 42 },
        ],
        wasmFn: 'calculate_corrected_age_scoring_json',
    },
    {
        id: 'dehydration', name: 'Dehydration Calculator', category: 'bedside',
        description: 'Fluid deficit calculation', scoreRange: 'mL',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 150 },
            { name: 'percent_dehydration', label: 'Dehydration (%)', step: '0.5', min: 0, max: 20 },
        ],
        wasmFn: 'calculate_dehydration_json',
    },
    {
        id: 'resuscitation', name: 'Resuscitation Doses', category: 'bedside',
        description: 'Weight-based emergency medication dosing', scoreRange: 'mg/mL/J',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 150 },
        ],
        wasmFn: 'calculate_resuscitation_json',
    },
    {
        id: 'weight-est', name: 'Weight Estimation', category: 'bedside',
        description: 'APLS weight estimation formulas', scoreRange: 'kg',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'age_months', label: 'Age (months)', step: '1', min: 0, max: 216, optional: true },
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18, optional: true },
        ],
        wasmFn: 'calculate_weight_estimation_json',
    },
    {
        id: 'anion-gap-scoring', name: 'Anion Gap', category: 'bedside',
        description: 'Anion gap with albumin correction and delta-delta', scoreRange: 'mEq/L',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'sodium', label: 'Na⁺ (mEq/L)', step: '1', min: 100, max: 180 },
            { name: 'chloride', label: 'Cl⁻ (mEq/L)', step: '1', min: 60, max: 130 },
            { name: 'bicarbonate', label: 'HCO₃⁻ (mEq/L)', step: '0.1', min: 0, max: 50 },
            { name: 'albumin_g_dl', label: 'Albumin (g/dL)', step: '0.1', min: 0, max: 6, optional: true },
        ],
        wasmFn: 'calculate_anion_gap_scoring_json',
    },

    // ── NUTRITIONAL / SAFETY ──
    {
        id: 'strongkids', name: 'STRONGkids', category: 'nutritional',
        description: 'Nutritional risk screening tool', scoreRange: '0-5',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'subjective_clinical_assessment', label: 'Reduced subcutaneous fat/muscle mass', type: 'toggle' },
            { name: 'high_risk_disease', label: 'High-risk disease (malnutrition risk)', type: 'toggle' },
            { name: 'nutritional_intake_and_losses', label: 'Reduced intake / excessive losses', type: 'toggle' },
            { name: 'weight_loss_or_poor_gain', label: 'Weight loss or poor weight gain', type: 'toggle' },
        ],
        wasmFn: 'calculate_strongkids_json',
    },
    {
        id: 'humpty-dumpty', name: 'Humpty Dumpty Fall Risk', category: 'nutritional',
        description: 'Pediatric fall prevention scale', scoreRange: '7-23',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'age_score', label: 'Age', type: 'select', options: ['1 - ≥13 years', '2 - 7-12 years', '3 - 3-6 years', '4 - <3 years'] },
            { name: 'gender_score', label: 'Gender', type: 'select', options: ['1 - Female', '2 - Male'] },
            { name: 'diagnosis_score', label: 'Diagnosis', type: 'select', options: ['1 - Other', '2 - Neurological', '3 - Altered oxygenation', '4 - Psychobehavioral'] },
            { name: 'cognitive_impairment_score', label: 'Cognitive Impairment', type: 'select', options: ['1 - Oriented', '2 - Forgets limitations', '3 - Not aware of limitations'] },
            { name: 'environmental_score', label: 'Environment', type: 'select', options: ['1 - Outpatient', '2 - Bed with peer patient', '3 - Hx falls / infant in bed'] },
            { name: 'surgery_sedation_score', label: 'Surgery/Sedation', type: 'select', options: ['1 - >48h ago', '2 - Within 48h', '3 - Within 24h'] },
            { name: 'medication_score', label: 'Medication', type: 'select', options: ['1 - None/other', '2 - 1 high-risk med', '3 - ≥2 high-risk meds'] },
        ],
        wasmFn: 'calculate_humpty_dumpty_json',
    },

    // ── PALS / PROTOCOLS ──
    {
        id: 'pals-cardiac-arrest', name: 'PALS Cardiac Arrest', category: 'protocols',
        description: 'AHA 2020 pediatric cardiac arrest algorithm with weight-based dosing', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'rhythm', label: 'Initial Rhythm', type: 'select', options: ['VF/pVT - Shockable', 'Asystole/PEA - Non-shockable'] },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const shockable = (input.rhythm || '').includes('Shockable');
            const epi = { dose: (0.01 * wt).toFixed(2) + ' mg', concentration: '1:10,000 (0.1 mg/mL)', volume: (0.1 * wt).toFixed(1) + ' mL IV/IO', interval: 'Every 3-5 minutes' };
            const defib1 = Math.round(2 * wt) + ' J';
            const defib2 = Math.round(4 * wt) + ' J';
            const amio = { dose: (5 * wt).toFixed(0) + ' mg', route: 'IV/IO bolus', max: '300 mg' };
            const lido = { dose: (1 * wt).toFixed(1) + ' mg', route: 'IV/IO', concentration: '20 mg/mL' };
            if (shockable) {
                return {
                    title: 'PALS Cardiac Arrest — VF / Pulseless VT',
                    patient_weight: wt + ' kg',
                    algorithm: [
                        '1. Start CPR — push hard (≥⅓ AP diameter), push fast (100-120/min)',
                        '2. SHOCK #1: ' + defib1 + ' (2 J/kg)',
                        '3. Resume CPR immediately × 2 min',
                        '4. SHOCK #2: ' + defib2 + ' (4 J/kg)',
                        '5. Resume CPR × 2 min → Epinephrine',
                        '6. SHOCK #3: ' + defib2 + ' (4 J/kg)',
                        '7. Resume CPR × 2 min → Amiodarone or Lidocaine',
                        '8. Continue cycle: CPR → Rhythm check → Shock if shockable',
                    ],
                    medications: {
                        epinephrine: epi,
                        amiodarone: amio,
                        lidocaine: lido,
                    },
                    cpr_quality: { rate: '100-120/min', depth: '≥⅓ AP chest diameter', recoil: 'Allow full chest recoil', minimize_interruptions: '<10 sec for rhythm checks' },
                    reversible_causes: ['Hypovolemia', 'Hypoxia', 'Hydrogen ion (acidosis)', 'Hypo/hyperkalemia', 'Hypothermia', 'Tension pneumothorax', 'Tamponade', 'Toxins', 'Thrombosis (pulmonary)', 'Thrombosis (coronary)'],
                };
            }
            return {
                title: 'PALS Cardiac Arrest — Asystole / PEA',
                patient_weight: wt + ' kg',
                algorithm: [
                    '1. Start CPR — push hard (≥⅓ AP diameter), push fast (100-120/min)',
                    '2. Epinephrine ASAP',
                    '3. Resume CPR × 2 min',
                    '4. Rhythm check — if shockable → go to VF/pVT pathway',
                    '5. Epinephrine every 3-5 min',
                    '6. Treat reversible causes (Hs and Ts)',
                ],
                medications: { epinephrine: epi },
                cpr_quality: { rate: '100-120/min', depth: '≥⅓ AP chest diameter', recoil: 'Allow full chest recoil' },
                reversible_causes: ['Hypovolemia', 'Hypoxia', 'Hydrogen ion (acidosis)', 'Hypo/hyperkalemia', 'Hypothermia', 'Tension pneumothorax', 'Tamponade', 'Toxins', 'Thrombosis (pulmonary)', 'Thrombosis (coronary)'],
            };
        },
        wasmFn: 'calculate_pals_cardiac_arrest_json',
    },
    {
        id: 'pals-bradycardia', name: 'PALS Bradycardia', category: 'protocols',
        description: 'AHA 2020 pediatric bradycardia with pulse algorithm', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'heart_rate', label: 'Current Heart Rate', step: '1', min: 0, max: 300 },
            { name: 'hemodynamically_stable', label: 'Hemodynamically Stable', type: 'toggle' },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const stable = input.hemodynamically_stable;
            return {
                title: 'PALS Bradycardia with Pulse Algorithm',
                patient_weight: wt + ' kg',
                heart_rate: input.heart_rate + ' bpm',
                initial_steps: ['Maintain airway; assist breathing as needed', 'Cardiac monitor; pulse oximetry', 'Vascular access (IV/IO)', 'ECG if available'],
                assessment: stable ? 'Hemodynamically stable — observe and support' : '⚠ Hemodynamically UNSTABLE — Intervene immediately',
                treatment: stable ? ['Support ABCs', 'Monitor', 'Consider expert consultation'] : [
                    '1. Start CPR if HR <60/min with poor perfusion despite adequate oxygenation/ventilation',
                    '2. Epinephrine: ' + (0.01 * wt).toFixed(2) + ' mg IV/IO (' + (0.1 * wt).toFixed(1) + ' mL of 1:10,000) every 3-5 min',
                    '3. Atropine: ' + (0.02 * wt).toFixed(2) + ' mg IV/IO (min 0.1 mg, max 0.5 mg single dose) — for increased vagal tone or AV block',
                    '4. Consider transcutaneous pacing',
                    '5. Treat underlying cause',
                ],
                causes: ['Hypoxia (most common in children)', 'Hypothermia', 'Head injury (raised ICP)', 'Heart block', 'Heart transplant', 'Toxins/drugs (beta-blockers, calcium channel blockers, digoxin, organophosphates)'],
            };
        },
        wasmFn: 'calculate_pals_bradycardia_json',
    },
    {
        id: 'pals-tachycardia', name: 'PALS Tachycardia', category: 'protocols',
        description: 'AHA 2020 pediatric tachycardia with pulse algorithm', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'qrs_type', label: 'QRS Duration', type: 'select', options: ['Narrow (≤0.09 sec) — likely SVT/sinus', 'Wide (>0.09 sec) — possible VT'] },
            { name: 'hemodynamically_stable', label: 'Hemodynamically Stable', type: 'toggle' },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const narrow = (input.qrs_type || '').includes('Narrow');
            const stable = input.hemodynamically_stable;
            const adenosine1 = (0.1 * wt).toFixed(1) + ' mg';
            const adenosine2 = (0.2 * wt).toFixed(1) + ' mg';
            const cardioJ = Math.round(0.5 * wt) + '-' + Math.round(1 * wt) + ' J';
            if (narrow) {
                return {
                    title: 'PALS Tachycardia — Narrow Complex',
                    patient_weight: wt + ' kg',
                    stability: stable ? 'Stable' : '⚠ UNSTABLE',
                    treatment: stable ? [
                        '1. Vagal maneuvers (ice to face for infants, bearing down for older children)',
                        '2. Adenosine 1st dose: ' + adenosine1 + ' rapid IV push (max 6 mg) — use closest IV site, rapid saline flush',
                        '3. Adenosine 2nd dose: ' + adenosine2 + ' rapid IV push (max 12 mg)',
                        '4. If refractory: Consider expert consultation, procainamide or amiodarone',
                    ] : [
                        '1. Synchronized cardioversion: ' + cardioJ + ' (0.5-1 J/kg)',
                        '2. If ineffective, increase to ' + Math.round(2 * wt) + ' J (2 J/kg)',
                        '3. Consider adenosine if IV access available and no delay',
                    ],
                    svt_vs_sinus: { svt: 'Rate usually >220/min (infant) or >180/min (child), no beat-to-beat variability, abrupt onset', sinus: 'Rate varies with activity, P waves present, gradual onset' },
                };
            }
            return {
                title: 'PALS Tachycardia — Wide Complex',
                patient_weight: wt + ' kg',
                stability: stable ? 'Stable' : '⚠ UNSTABLE',
                warning: 'Wide complex tachycardia in children — treat as VT until proven otherwise',
                treatment: stable ? [
                    '1. Expert consultation recommended',
                    '2. Amiodarone: ' + (5 * wt).toFixed(0) + ' mg IV over 20-60 min (max 300 mg)',
                    '3. OR Procainamide: ' + (15 * wt).toFixed(0) + ' mg IV over 30-60 min (max 100 mg/dose)',
                    '4. Do NOT give adenosine for wide complex unless confirmed SVT with aberrancy',
                ] : [
                    '1. Synchronized cardioversion: ' + cardioJ + ' (0.5-1 J/kg)',
                    '2. If ineffective, increase to ' + Math.round(2 * wt) + ' J (2 J/kg)',
                    '3. Consider amiodarone if refractory',
                ],
            };
        },
        wasmFn: 'calculate_pals_tachycardia_json',
    },
    {
        id: 'pals-sepsis', name: 'Pediatric Sepsis Protocol', category: 'protocols',
        description: 'Surviving Sepsis Campaign 2020 — fluid resuscitation & vasopressor dosing', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'fluid_responsive', label: 'Fluid Responsive (after initial bolus)', type: 'toggle' },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const bolus10 = Math.round(10 * wt);
            const bolus20 = Math.round(20 * wt);
            return {
                title: 'Pediatric Sepsis — Surviving Sepsis Campaign Protocol',
                patient_weight: wt + ' kg',
                first_hour: [
                    '0 min: Recognize sepsis — obtain blood culture, lactate',
                    '0-5 min: Vascular access (IV or IO)',
                    '0-15 min: Start antibiotics (broad-spectrum)',
                    '0-15 min: Fluid bolus — 10-20 mL/kg (' + bolus10 + '-' + bolus20 + ' mL) isotonic crystalloid over 5-20 min',
                    'Reassess after each bolus: perfusion, HR, BP, cap refill',
                    'Repeat boluses up to 40-60 mL/kg in first hour if fluid-responsive',
                    'If NOT fluid-responsive after 40-60 mL/kg → start vasopressors',
                ],
                vasopressors: {
                    first_line: 'Epinephrine 0.05-0.3 mcg/kg/min IV/IO — for COLD shock (poor perfusion, cool extremities)',
                    alternative_first_line: 'Norepinephrine 0.05-0.3 mcg/kg/min IV/IO — for WARM shock (flash cap refill, bounding pulses)',
                    second_line: 'Add vasopressin 0.0003-0.002 units/kg/min if refractory',
                },
                goals: {
                    cap_refill: '<2 seconds',
                    blood_pressure: 'MAP > 5th percentile for age',
                    urine_output: '≥1 mL/kg/hr',
                    mental_status: 'Normal for age',
                    lactate: 'Normalizing trend',
                },
                fluid_caution: 'In resource-limited settings or if signs of fluid overload (rales, hepatomegaly, increased work of breathing), use smaller boluses (10 mL/kg) and reassess frequently.',
                reference: 'Surviving Sepsis Campaign International Guidelines for Management of Septic Shock and Sepsis-Associated Organ Dysfunction in Children, 2020',
            };
        },
        wasmFn: 'calculate_pals_sepsis_json',
    },
    {
        id: 'pals-status-epilepticus', name: 'Status Epilepticus Protocol', category: 'protocols',
        description: 'Stepwise seizure management — benzodiazepines, second-line, refractory', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'iv_access', label: 'IV Access Available', type: 'toggle' },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const iv = input.iv_access;
            return {
                title: 'Status Epilepticus — Stepwise Protocol',
                patient_weight: wt + ' kg',
                stabilization: ['ABCs — position, suction, O2', 'Check glucose (treat if <60 mg/dL)', 'Time the seizure'],
                first_line_0_to_5_min: iv ? [
                    'Lorazepam ' + (0.1 * wt).toFixed(1) + ' mg IV (0.1 mg/kg, max 4 mg)',
                    'May repeat × 1 in 5 min if seizure continues',
                ] : [
                    'Midazolam IM: ' + (0.2 * wt).toFixed(1) + ' mg (0.2 mg/kg, max 10 mg)',
                    'OR Midazolam intranasal: ' + (0.2 * wt).toFixed(1) + ' mg (0.2 mg/kg, max 10 mg)',
                    'OR Diazepam rectal: ' + (0.5 * wt).toFixed(1) + ' mg (0.5 mg/kg, max 20 mg)',
                ],
                second_line_5_to_20_min: [
                    'Levetiracetam: ' + Math.round(60 * wt) + ' mg IV over 15 min (60 mg/kg, max 4500 mg)',
                    'OR Fosphenytoin: ' + Math.round(20 * wt) + ' mg PE IV (20 mg PE/kg, max 1500 mg PE) over 10-20 min',
                    'OR Valproic acid: ' + Math.round(40 * wt) + ' mg IV over 5-10 min (40 mg/kg, max 3000 mg)',
                    'OR Phenobarbital: ' + Math.round(20 * wt) + ' mg IV (20 mg/kg, max 1000 mg) over 10-15 min',
                ],
                refractory_over_20_min: [
                    'Midazolam infusion: ' + (0.1 * wt).toFixed(1) + ' mg/hr start (0.1 mg/kg/hr, titrate to burst suppression)',
                    'OR Pentobarbital: ' + (5 * wt).toFixed(0) + ' mg IV load (5 mg/kg), then 1 mg/kg/hr infusion',
                    'Prepare for intubation / ICU transfer',
                    'Continuous EEG monitoring',
                ],
                note: 'Based on AES 2016 Evidence-Based Guideline & Neurocritical Care Society 2012 Guidelines. Time from seizure onset drives escalation.',
            };
        },
        wasmFn: 'calculate_status_epilepticus_json',
    },
    {
        id: 'pals-anaphylaxis', name: 'Anaphylaxis Protocol', category: 'protocols',
        description: 'Emergency anaphylaxis management with weight-based epinephrine dosing', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const epiIM = Math.min(0.01 * wt, 0.5).toFixed(2);
            const epiVol = (epiIM / 1).toFixed(2);
            const fluidBolus = Math.round(20 * wt);
            return {
                title: 'Anaphylaxis — Emergency Protocol',
                patient_weight: wt + ' kg',
                immediate: [
                    '1. Remove trigger if possible',
                    '2. EPINEPHRINE IM (anterolateral thigh): ' + epiIM + ' mg (' + epiVol + ' mL of 1:1,000)',
                    '3. Place supine (or position of comfort if dyspnea), elevate legs',
                    '4. High-flow O2',
                    '5. Establish IV access',
                    '6. Normal saline bolus: ' + fluidBolus + ' mL (20 mL/kg) for hypotension',
                ],
                repeat_epinephrine: 'May repeat IM epinephrine every 5-15 minutes if symptoms persist',
                adjunct_medications: {
                    albuterol: 'Nebulized 2.5-5 mg for bronchospasm',
                    diphenhydramine: Math.round(1 * wt) + ' mg IV/IM (1 mg/kg, max 50 mg)',
                    ranitidine: Math.round(1 * wt) + ' mg IV (1 mg/kg, max 50 mg)',
                    methylprednisolone: Math.round(1 * wt) + ' mg IV (1 mg/kg, max 125 mg) — prevents biphasic reaction',
                },
                epinephrine_infusion: 'If refractory: 0.1-1 mcg/kg/min IV',
                observation: 'Observe minimum 4-6 hours (up to 24h for severe reactions) for biphasic response',
                discharge: 'Prescribe epinephrine auto-injector, allergist referral, anaphylaxis action plan',
            };
        },
        wasmFn: 'calculate_anaphylaxis_json',
    },
    {
        id: 'pals-dka', name: 'Pediatric DKA Protocol', category: 'protocols',
        description: 'Diabetic ketoacidosis — fluid, insulin, potassium management', scoreRange: 'Protocol',
        modes: ['pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'severity', label: 'DKA Severity', type: 'select', options: ['Mild — pH 7.2-7.3, bicarb 10-15', 'Moderate — pH 7.1-7.2, bicarb 5-10', 'Severe — pH <7.1, bicarb <5'] },
            { name: 'potassium', label: 'Initial Serum K+ (mEq/L)', step: '0.1', min: 1, max: 10 },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const sev = (input.severity || '').split(' ')[0];
            const k = input.potassium || 4;
            const initBolus = Math.round(10 * wt);
            const maintenanceFluids = wt <= 10 ? wt * 4 : wt <= 20 ? 40 + (wt - 10) * 2 : 60 + (wt - 20);
            const insulinRate = (0.05 * wt).toFixed(2);
            let kReplacement;
            if (k < 3) kReplacement = '⚠ HOLD insulin until K+ ≥3.5. Replace aggressively: 0.5-1 mEq/kg/hr with continuous monitoring';
            else if (k < 3.5) kReplacement = '40 mEq/L KCl in IV fluids — replace before starting insulin if possible';
            else if (k < 5.5) kReplacement = '20-40 mEq/L KPhos + KCl in IV fluids (monitor q1-2h)';
            else kReplacement = 'Hold potassium replacement — recheck in 1 hour';
            return {
                title: 'Pediatric DKA Protocol — ' + sev + ' Severity',
                patient_weight: wt + ' kg',
                initial_fluids: [
                    'NS bolus: ' + initBolus + ' mL (10 mL/kg) over 30-60 min — repeat once if needed for perfusion',
                    'Do NOT give >20 mL/kg in first 1-2 hours unless hemodynamically unstable',
                ],
                ongoing_fluids: {
                    rate: 'Replace deficit over 24-48 hours (use 1.5× maintenance)',
                    type: '0.9% NS initially, then 0.45-0.9% NS + dextrose when glucose <300 mg/dL',
                    maintenance: Math.round(maintenanceFluids * 1.5) + ' mL/hr (1.5× maintenance)',
                },
                insulin: {
                    start: 'Begin 1 hour AFTER starting fluids',
                    dose: insulinRate + ' units/hr (' + (0.05) + ' U/kg/hr)',
                    preparation: '50 units regular insulin in 50 mL NS = 1 unit/mL',
                    titration: 'Target glucose decrease 50-100 mg/dL/hr',
                    glucose_management: 'Add D5 to fluids when glucose <300 mg/dL. Add D10 if glucose <200 mg/dL.',
                    do_not: 'Do NOT give insulin bolus. Do NOT stop insulin infusion until anion gap closes.',
                },
                potassium: { initial_K: k + ' mEq/L', recommendation: kReplacement },
                monitoring: ['Glucose every 1 hour', 'BMP every 2-4 hours', 'Neuro checks every 1 hour (cerebral edema risk)', 'Strict I&O', 'Continuous cardiac monitoring'],
                cerebral_edema_warning: {
                    signs: 'Headache, altered mental status, bradycardia, hypertension, irregular breathing, pupil changes',
                    treatment: 'Hypertonic saline 3% — ' + Math.round(5 * wt) + ' mL (5 mL/kg) over 15 min OR Mannitol ' + (0.5 * wt).toFixed(1) + '-' + (1 * wt).toFixed(1) + ' g IV',
                },
            };
        },
        wasmFn: 'calculate_dka_json',
    },
    {
        id: 'rsi-dosing', name: 'RSI Medication Dosing', category: 'protocols',
        description: 'Rapid Sequence Intubation — weight-based induction & paralytic doses', scoreRange: 'Protocol',
        modes: ['pediatric', 'neonatal'],
        fields: [
            { name: 'weight_kg', label: 'Weight (kg)', step: '0.1', min: 0.5, max: 120 },
            { name: 'age_years', label: 'Age (years)', step: '0.1', min: 0, max: 18 },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 10;
            const age = input.age_years || 1;
            const ettSize = age < 0.5 ? '3.5' : age < 1 ? '3.5-4.0' : (4 + age / 4).toFixed(1);
            const ettDepth = age < 1 ? (ettSize * 3).toFixed(0) : (Number(ettSize) * 3).toFixed(0);
            return {
                title: 'Rapid Sequence Intubation — Pediatric Dosing',
                patient: { weight: wt + ' kg', age: age + ' years' },
                equipment: {
                    ett_size: ettSize + ' mm (cuffed)',
                    ett_depth: ettDepth + ' cm at lip',
                    blade: age < 2 ? 'Miller 1 (straight)' : age < 8 ? 'Miller 2 or Mac 2' : 'Mac 3',
                    suction: 'Always available',
                },
                premedication: {
                    atropine: age < 1 || wt < 20 ? (0.02 * wt).toFixed(2) + ' mg IV (0.02 mg/kg, min 0.1 mg) — prevents bradycardia' : 'Consider if using succinylcholine',
                    lidocaine: 'Consider ' + (1.5 * wt).toFixed(1) + ' mg IV (1.5 mg/kg) for ↑ICP',
                },
                induction_agents: {
                    etomidate: (0.3 * wt).toFixed(1) + ' mg IV (0.3 mg/kg) — hemodynamically stable',
                    ketamine: (1.5 * wt).toFixed(1) + ' mg IV (1-2 mg/kg) — maintains BP & airway reflexes, bronchodilator',
                    propofol: (2 * wt).toFixed(1) + ' mg IV (2-3 mg/kg) — ⚠ hypotension risk',
                    midazolam: (0.2 * wt).toFixed(1) + ' mg IV (0.1-0.3 mg/kg) — slow onset',
                },
                paralytics: {
                    rocuronium: (1 * wt).toFixed(1) + ' mg IV (1 mg/kg) — onset 45-60s, duration 30-45 min. Can reverse with sugammadex.',
                    succinylcholine: (2 * wt).toFixed(1) + ' mg IV (1.5-2 mg/kg) — onset 30-45s, duration 5-10 min. ⚠ Contraindicated: hyperkalemia, burns >48h, denervation, malignant hyperthermia history',
                    vecuronium: (0.1 * wt).toFixed(1) + ' mg IV (0.1 mg/kg) — onset 2-3 min, duration 25-40 min',
                },
                sequence: [
                    'Preparation: equipment, monitoring, suction, IV',
                    'Preoxygenation: 100% O2 × 3-5 min (avoid BVM if possible)',
                    'Premedication (atropine, lidocaine if indicated)',
                    'Induction agent push',
                    'Paralytic push — wait for fasciculations to stop',
                    'Intubate — confirm with ETCO2, bilateral breath sounds',
                    'Secure ETT, post-intubation CXR',
                ],
            };
        },
        wasmFn: 'calculate_rsi_json',
    },
    {
        id: 'nrp-protocol', name: 'NRP Neonatal Resuscitation', category: 'protocols',
        description: 'Neonatal Resuscitation Program — stepwise algorithm with SpO2 targets', scoreRange: 'Protocol',
        modes: ['neonatal', 'pediatric'],
        fields: [
            { name: 'weight_kg', label: 'Estimated Weight (kg)', step: '0.1', min: 0.3, max: 6 },
            { name: 'gestational_age', label: 'Gestational Age (weeks)', step: '1', min: 22, max: 42 },
        ],
        jsFn: (input) => {
            const wt = input.weight_kg || 3;
            const ga = input.gestational_age || 38;
            const preterm = ga < 37;
            return {
                title: 'Neonatal Resuscitation Program (NRP) Algorithm',
                patient: { weight: wt + ' kg', gestational_age: ga + ' weeks' },
                initial_steps: [
                    'Warm (term: 36.5-37.5°C' + (preterm ? ', preterm: plastic wrap + radiant warmer' : '') + ')',
                    'Dry (avoid for preterm <32 wk if using plastic wrap)',
                    'Stimulate — gentle rubbing of back/soles',
                    'Position airway — slight neck extension (sniffing position)',
                    'Clear airway only if obstructed',
                    'Assess: breathing, heart rate, tone',
                ],
                spo2_targets_by_minute: { '1 min': '60-65%', '2 min': '65-70%', '3 min': '70-75%', '4 min': '75-80%', '5 min': '80-85%', '10 min': '85-95%' },
                if_not_breathing_or_hr_below_100: [
                    'PPV (positive pressure ventilation) with 21% O2 (term) or 21-30% (preterm <35 wk)',
                    'Rate: 40-60 breaths/min',
                    'MR SOPA: Mask adjust, Reposition, Suction, Open mouth, Pressure increase, Alternative airway',
                    'Assess after 30 sec of effective PPV',
                ],
                if_hr_below_60_despite_ppv: [
                    'Intubate (or laryngeal mask)',
                    'Begin chest compressions: 3 compressions : 1 breath (120 events/min)',
                    'Increase O2 to 100%',
                    'Reassess every 60 sec',
                ],
                if_hr_still_below_60: {
                    epinephrine: {
                        iv_dose: (0.02 * wt).toFixed(2) + ' mg IV/UVC (0.01-0.03 mg/kg of 1:10,000)',
                        ett_dose: (0.1 * wt).toFixed(2) + ' mg ETT (0.05-0.1 mg/kg of 1:10,000)',
                    },
                    volume: Math.round(10 * wt) + ' mL NS or blood (10 mL/kg) if suspected hypovolemia',
                },
                special_considerations: preterm ? [
                    'Delayed cord clamping (30-60 sec if vigorous)',
                    'Plastic wrap for thermal protection (<32 wk)',
                    'Lower starting FiO2 (21-30%)',
                    'Gentle ventilation to avoid pneumothorax',
                    'Consider surfactant for RDS',
                ] : ['Delayed cord clamping (30-60 sec if vigorous)'],
            };
        },
        wasmFn: 'calculate_nrp_json',
    },
];

// ── Custom calculators from localStorage ──
const CUSTOM_CALC_KEY = 'cds-custom-calculators';

export function getCustomCalculators() {
    return JSON.parse(localStorage.getItem(CUSTOM_CALC_KEY) || '[]');
}

export function saveCustomCalculators(calcs) {
    localStorage.setItem(CUSTOM_CALC_KEY, JSON.stringify(calcs));
}

export function addCustomCalculator(calc) {
    const custom = getCustomCalculators();
    custom.push(calc);
    saveCustomCalculators(custom);
}

export function removeCustomCalculator(id) {
    const custom = getCustomCalculators().filter(c => c.id !== id);
    saveCustomCalculators(custom);
}

// ── Tab assignment overrides from localStorage ──
const TAB_ASSIGN_KEY = 'cds-calculator-tab-assignments';

// Available tabs where calculators can be displayed
export const AVAILABLE_TABS = {
    'scoring-calcs': 'Scoring Calculators',
    'assessment': 'Assessment',
    'calculators': 'Lab Calculators',
};

export function getTabAssignments() {
    return JSON.parse(localStorage.getItem(TAB_ASSIGN_KEY) || '{}');
}

export function saveTabAssignments(assignments) {
    localStorage.setItem(TAB_ASSIGN_KEY, JSON.stringify(assignments));
}

// Returns the tab a calculator is assigned to (default: 'scoring-calcs')
export function getCalcTab(calcId) {
    const assignments = getTabAssignments();
    return assignments[calcId] || 'scoring-calcs';
}

// ── Get all calculators (built-in + custom) ──
export function getAllCalculators() {
    return [...SCORING_CALCULATORS, ...getCustomCalculators()];
}

// ── Get all unique categories ──
export function getScoringCategories() {
    const cats = new Set();
    getAllCalculators().forEach(c => cats.add(c.category));
    return Array.from(cats);
}

// ── Filter by mode (and optionally by tab) ──
export function getCalculatorsForMode(mode, tab = 'scoring-calcs') {
    const overrides = JSON.parse(localStorage.getItem('cds-calculator-visibility') || '{}');
    const tabAssignments = getTabAssignments();
    return getAllCalculators().filter(c => {
        // Check tab assignment
        const assignedTab = tabAssignments[c.id] || 'scoring-calcs';
        if (assignedTab !== tab) return false;
        // Check mode visibility
        if (overrides[c.id]) {
            return overrides[c.id].modes.includes(mode);
        }
        return c.modes.includes(mode);
    });
}

// ── Get categories with calculators for a mode ──
export function getCategoriesForMode(mode, tab = 'scoring-calcs') {
    const calcs = getCalculatorsForMode(mode, tab);
    const cats = new Set();
    calcs.forEach(c => cats.add(c.category));
    return Array.from(cats);
}

// Category display names
export const CATEGORY_LABELS = {
    'sepsis': 'Sepsis & Organ Dysfunction',
    'pews': 'Early Warning (PEWS)',
    'neonatal': 'Neonatal',
    'respiratory': 'Respiratory / Cardiac',
    'trauma': 'Trauma',
    'renal-scoring': 'Renal',
    'pain': 'Pain & Sedation',
    'bedside': 'Bedside Formulas',
    'nutritional': 'Nutritional / Safety',
    'protocols': 'PALS / Protocols',
    'burns': 'Burns',
    'custom': 'Custom',
};

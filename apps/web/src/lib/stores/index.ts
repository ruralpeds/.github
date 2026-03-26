export { clinicalMode, modeConfig, hasMode, selectMode, clearMode, MODE_CONFIGS } from './mode';
export type { ClinicalMode, ModeConfig } from './mode';

export { patient, hasPatient, weightDisplay, ageDisplay, brosColor, loadPatient, clearPatient } from './patient';
export type { PatientData, WeightClassification, VitalSignRange, EquipmentSizing } from './patient';

export {
	activeErrors, hasErrors, latestError, validationErrorCount,
	reportError, dismissError, dismissAllErrors, clearErrors, withErrorReporting,
} from './errors';
export type { StoredError } from './errors';

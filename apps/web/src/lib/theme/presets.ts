import type { Theme } from './types';

// =============================================================================
// Shared clinical severity colors — consistent across ALL themes
// These never change because clinical color coding must be universal
// =============================================================================
const CLINICAL_SEVERITY = {
	emergency: '#DC2626',
	emergencyBg: '#FEF2F2',
	urgent: '#EA580C',
	urgentBg: '#FFF7ED',
	warning: '#CA8A04',
	warningBg: '#FEFCE8',
	stable: '#16A34A',
	stableBg: '#F0FDF4',
	info: '#2563EB',
	infoBg: '#EFF6FF'
};

const CLINICAL_SEVERITY_DARK = {
	...CLINICAL_SEVERITY,
	emergencyBg: '#450A0A',
	urgentBg: '#431407',
	warningBg: '#422006',
	stableBg: '#052E16',
	infoBg: '#172554'
};

// Decision tree node palette — shared
const NODE_COLORS = {
	nodeEmergency: '#EF4444',
	nodeUrgent: '#F97316',
	nodeDecision: '#EAB308',
	nodeAction: '#22C55E',
	nodeAssessment: '#3B82F6',
	nodeDiagnosis: '#A855F7'
};

// Typography — shared across all themes
const TYPOGRAPHY = {
	fontHeading: "'DM Serif Display', 'Georgia', serif",
	fontBody: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
	fontMono: "'IBM Plex Mono', 'Menlo', 'Consolas', monospace",
	lineHeightBody: '1.6',
	lineHeightHeading: '1.2'
};

const RADII = {
	sm: '4px',
	md: '8px',
	lg: '12px',
	full: '9999px'
};

// =============================================================================
// CLINICAL LIGHT — Default theme
// Clean, warm, high-readability for typical ED lighting
// =============================================================================
export const clinicalLight: Theme = {
	id: 'clinical-light',
	name: 'Clinical Light',
	description: 'Clean, high-readability light theme for typical ED environments',
	isDark: false,
	colors: {
		background: '#FAFAF9',
		surface: '#FFFFFF',
		surfaceRaised: '#FFFFFF',
		surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
		surfaceInset: '#F5F5F4',

		text: '#1C1917',
		textSecondary: '#44403C',
		textMuted: '#78716C',
		textInverse: '#FAFAF9',

		border: '#D6D3D1',
		borderSubtle: '#E7E5E4',
		borderStrong: '#A8A29E',

		...CLINICAL_SEVERITY,
		...NODE_COLORS,

		primary: '#1D4ED8',
		primaryHover: '#1E40AF',
		primaryActive: '#1E3A8A',
		primaryText: '#FFFFFF',
		accent: '#0891B2',
		accentHover: '#0E7490',

		focusRing: '#3B82F6',
		scrollbar: '#D6D3D1',
		scrollbarHover: '#A8A29E'
	},
	typography: TYPOGRAPHY,
	shadows: {
		sm: '0 1px 2px rgba(28, 25, 23, 0.05)',
		md: '0 4px 6px rgba(28, 25, 23, 0.07), 0 2px 4px rgba(28, 25, 23, 0.04)',
		lg: '0 10px 15px rgba(28, 25, 23, 0.08), 0 4px 6px rgba(28, 25, 23, 0.04)',
		popup: '0 12px 28px rgba(28, 25, 23, 0.12), 0 4px 10px rgba(28, 25, 23, 0.06)'
	},
	radii: RADII
};

// =============================================================================
// CLINICAL DARK — Night shift / low-light theme
// Reduces eye strain during overnight shifts
// =============================================================================
export const clinicalDark: Theme = {
	id: 'clinical-dark',
	name: 'Clinical Dark',
	description: 'Dark theme for night shifts and low-light ED environments',
	isDark: true,
	colors: {
		background: '#0B1121',
		surface: '#111827',
		surfaceRaised: '#1F2937',
		surfaceOverlay: 'rgba(17, 24, 39, 0.95)',
		surfaceInset: '#0F172A',

		text: '#F1F5F9',
		textSecondary: '#CBD5E1',
		textMuted: '#64748B',
		textInverse: '#0B1121',

		border: '#334155',
		borderSubtle: '#1E293B',
		borderStrong: '#475569',

		...CLINICAL_SEVERITY_DARK,
		...NODE_COLORS,

		primary: '#60A5FA',
		primaryHover: '#93BBFD',
		primaryActive: '#3B82F6',
		primaryText: '#0B1121',
		accent: '#22D3EE',
		accentHover: '#67E8F9',

		focusRing: '#60A5FA',
		scrollbar: '#334155',
		scrollbarHover: '#475569'
	},
	typography: TYPOGRAPHY,
	shadows: {
		sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
		md: '0 4px 6px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)',
		lg: '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.2)',
		popup: '0 12px 28px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)'
	},
	radii: RADII
};

// =============================================================================
// HIGH CONTRAST — Accessibility / bright environment theme
// Maximum readability under harsh fluorescent lighting
// =============================================================================
export const highContrast: Theme = {
	id: 'high-contrast',
	name: 'High Contrast',
	description: 'Maximum contrast for bright environments and accessibility',
	isDark: false,
	colors: {
		background: '#FFFFFF',
		surface: '#FFFFFF',
		surfaceRaised: '#FFFFFF',
		surfaceOverlay: 'rgba(255, 255, 255, 0.98)',
		surfaceInset: '#F3F4F6',

		text: '#000000',
		textSecondary: '#1F2937',
		textMuted: '#374151',
		textInverse: '#FFFFFF',

		border: '#000000',
		borderSubtle: '#6B7280',
		borderStrong: '#000000',

		...CLINICAL_SEVERITY,
		...NODE_COLORS,

		primary: '#1D4ED8',
		primaryHover: '#1E3A8A',
		primaryActive: '#172554',
		primaryText: '#FFFFFF',
		accent: '#0E7490',
		accentHover: '#155E75',

		focusRing: '#1D4ED8',
		scrollbar: '#9CA3AF',
		scrollbarHover: '#6B7280'
	},
	typography: TYPOGRAPHY,
	shadows: {
		sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
		md: '0 4px 8px rgba(0, 0, 0, 0.15)',
		lg: '0 10px 20px rgba(0, 0, 0, 0.18)',
		popup: '0 12px 32px rgba(0, 0, 0, 0.22)'
	},
	radii: RADII
};

// =============================================================================
// Theme registry — add new themes here
// =============================================================================
export const THEME_PRESETS: Record<string, Theme> = {
	'clinical-light': clinicalLight,
	'clinical-dark': clinicalDark,
	'high-contrast': highContrast
};

export const DEFAULT_THEME_ID = 'clinical-light';

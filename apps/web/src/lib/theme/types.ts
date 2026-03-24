// Theme Token Schema — Pediatric Emergency CDS
// All visual theming flows through these tokens.
// To create a new theme: define an object matching the Theme type.
// No other code changes required.

export interface ThemeColors {
	// Surfaces
	background: string;
	surface: string;
	surfaceRaised: string;
	surfaceOverlay: string;
	surfaceInset: string;

	// Text
	text: string;
	textSecondary: string;
	textMuted: string;
	textInverse: string;

	// Borders
	border: string;
	borderSubtle: string;
	borderStrong: string;

	// Clinical Severity (consistent across all themes)
	emergency: string;
	emergencyBg: string;
	urgent: string;
	urgentBg: string;
	warning: string;
	warningBg: string;
	stable: string;
	stableBg: string;
	info: string;
	infoBg: string;

	// Interactive
	primary: string;
	primaryHover: string;
	primaryActive: string;
	primaryText: string;
	accent: string;
	accentHover: string;

	// Decision Tree Node Types
	nodeEmergency: string;
	nodeUrgent: string;
	nodeDecision: string;
	nodeAction: string;
	nodeAssessment: string;
	nodeDiagnosis: string;

	// Focus / A11y
	focusRing: string;

	// Scrollbar
	scrollbar: string;
	scrollbarHover: string;
}

export interface ThemeTypography {
	fontHeading: string;
	fontBody: string;
	fontMono: string;
	lineHeightBody: string;
	lineHeightHeading: string;
}

export interface ThemeShadows {
	sm: string;
	md: string;
	lg: string;
	popup: string;
}

export interface ThemeRadii {
	sm: string;
	md: string;
	lg: string;
	full: string;
}

export interface Theme {
	id: string;
	name: string;
	description: string;
	isDark: boolean;
	colors: ThemeColors;
	typography: ThemeTypography;
	shadows: ThemeShadows;
	radii: ThemeRadii;
}

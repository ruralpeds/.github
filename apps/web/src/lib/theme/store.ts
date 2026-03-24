import { writable, derived } from 'svelte/store';
import type { Theme } from './types';
import { THEME_PRESETS, DEFAULT_THEME_ID } from './presets';

// ---------------------------------------------------------------------------
// Storage helpers (SSR-safe)
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'ped-cds-theme';
const CUSTOM_THEMES_KEY = 'ped-cds-custom-themes';

function isBrowser(): boolean {
	return typeof window !== 'undefined';
}

function loadStoredThemeId(): string {
	if (!isBrowser()) return DEFAULT_THEME_ID;
	try {
		return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID;
	} catch {
		return DEFAULT_THEME_ID;
	}
}

function saveThemeId(id: string): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(STORAGE_KEY, id);
	} catch {
		// Storage full or blocked — silently degrade
	}
}

function loadCustomThemes(): Record<string, Theme> {
	if (!isBrowser()) return {};
	try {
		const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function saveCustomThemes(themes: Record<string, Theme>): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
	} catch {
		// silently degrade
	}
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

/** All available themes: presets + user custom themes */
const customThemes = writable<Record<string, Theme>>(loadCustomThemes());

/** The active theme ID */
export const activeThemeId = writable<string>(loadStoredThemeId());

/** Derived: merged registry of all themes */
export const allThemes = derived(customThemes, ($custom) => ({
	...THEME_PRESETS,
	...$custom
}));

/** Derived: the currently active Theme object */
export const theme = derived([activeThemeId, allThemes], ([$id, $all]) => {
	return $all[$id] || $all[DEFAULT_THEME_ID] || THEME_PRESETS[DEFAULT_THEME_ID];
});

/** Derived: is current theme dark? (for conditional rendering) */
export const isDark = derived(theme, ($theme) => $theme.isDark);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Switch to a theme by ID */
export function setTheme(id: string): void {
	activeThemeId.set(id);
	saveThemeId(id);
}

/** Register a custom theme (persisted to localStorage) */
export function addCustomTheme(t: Theme): void {
	customThemes.update((current) => {
		const updated = { ...current, [t.id]: t };
		saveCustomThemes(updated);
		return updated;
	});
}

/** Remove a custom theme */
export function removeCustomTheme(id: string): void {
	customThemes.update((current) => {
		const { [id]: _, ...rest } = current;
		saveCustomThemes(rest);
		return rest;
	});
	// If active theme was removed, fall back to default
	activeThemeId.update((currentId) => {
		if (currentId === id) {
			saveThemeId(DEFAULT_THEME_ID);
			return DEFAULT_THEME_ID;
		}
		return currentId;
	});
}

/** Export current theme as JSON string (for sharing/backup) */
export function exportTheme(t: Theme): string {
	return JSON.stringify(t, null, 2);
}

/** Import a theme from JSON string */
export function importTheme(json: string): Theme | null {
	try {
		const parsed = JSON.parse(json);
		if (parsed.id && parsed.name && parsed.colors && parsed.typography) {
			return parsed as Theme;
		}
		return null;
	} catch {
		return null;
	}
}

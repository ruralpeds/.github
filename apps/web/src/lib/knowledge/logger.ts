// =============================================================================
// Knowledge Management — Logging System
//
// Provides persistent, structured logging for all knowledge management
// operations. Logs are stored in localStorage and can be exported as JSON
// or CSV. Supports configurable retention and level filtering.
// =============================================================================

import type { KnowledgeLogEntry, LogLevel, LogAction } from './types';

const STORAGE_KEY = 'ped-cds-knowledge-logs';
const MAX_LOG_ENTRIES = 5000;
const LOG_PRUNE_BATCH = 500;

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let logCache: KnowledgeLogEntry[] | null = null;

function generateId(): string {
	return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadLogs(): KnowledgeLogEntry[] {
	if (logCache) return logCache;
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		logCache = raw ? JSON.parse(raw) : [];
		return logCache!;
	} catch {
		logCache = [];
		return [];
	}
}

function saveLogs(logs: KnowledgeLogEntry[]): void {
	logCache = logs;
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
	} catch (e) {
		// If storage is full, prune oldest entries and retry
		const pruned = logs.slice(-Math.floor(MAX_LOG_ENTRIES / 2));
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
			logCache = pruned;
		} catch {
			// Storage critically full — clear logs
			logCache = [];
			try { localStorage.removeItem(STORAGE_KEY); } catch {}
		}
	}
}

function pruneIfNeeded(logs: KnowledgeLogEntry[]): KnowledgeLogEntry[] {
	if (logs.length > MAX_LOG_ENTRIES) {
		return logs.slice(-( MAX_LOG_ENTRIES - LOG_PRUNE_BATCH));
	}
	return logs;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Write a log entry */
export function log(
	level: LogLevel,
	action: LogAction,
	message: string,
	options: {
		itemId?: string | null;
		searchId?: string | null;
		details?: Record<string, unknown>;
	} = {}
): KnowledgeLogEntry {
	const entry: KnowledgeLogEntry = {
		id: generateId(),
		timestamp: new Date().toISOString(),
		level,
		action,
		message,
		itemId: options.itemId ?? null,
		searchId: options.searchId ?? null,
		details: options.details ?? {},
	};

	const logs = loadLogs();
	logs.push(entry);
	saveLogs(pruneIfNeeded(logs));

	// Also output to browser console for dev visibility
	const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
	console[consoleMethod](`[Knowledge:${action}] ${message}`, entry.details);

	return entry;
}

/** Convenience: info-level log */
export function logInfo(action: LogAction, message: string, options?: Parameters<typeof log>[3]): KnowledgeLogEntry {
	return log('info', action, message, options);
}

/** Convenience: warn-level log */
export function logWarn(action: LogAction, message: string, options?: Parameters<typeof log>[3]): KnowledgeLogEntry {
	return log('warn', action, message, options);
}

/** Convenience: error-level log */
export function logError(action: LogAction, message: string, options?: Parameters<typeof log>[3]): KnowledgeLogEntry {
	return log('error', action, message, options);
}

/** Get all log entries, optionally filtered */
export function getLogs(filters?: {
	level?: LogLevel;
	action?: LogAction;
	itemId?: string;
	searchId?: string;
	since?: string;
	limit?: number;
}): KnowledgeLogEntry[] {
	let logs = loadLogs();

	if (filters) {
		if (filters.level) logs = logs.filter(l => l.level === filters.level);
		if (filters.action) logs = logs.filter(l => l.action === filters.action);
		if (filters.itemId) logs = logs.filter(l => l.itemId === filters.itemId);
		if (filters.searchId) logs = logs.filter(l => l.searchId === filters.searchId);
		if (filters.since) {
			const sinceDate = new Date(filters.since).getTime();
			logs = logs.filter(l => new Date(l.timestamp).getTime() >= sinceDate);
		}
	}

	// Return newest first
	const sorted = [...logs].reverse();
	return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
}

/** Get total log count */
export function getLogCount(): number {
	return loadLogs().length;
}

/** Clear all logs */
export function clearLogs(): void {
	logCache = [];
	if (typeof window === 'undefined') return;
	try { localStorage.removeItem(STORAGE_KEY); } catch {}
	logInfo('system_init', 'Knowledge logs cleared');
}

/** Export logs as JSON string */
export function exportLogsJSON(filters?: Parameters<typeof getLogs>[0]): string {
	const logs = getLogs(filters);
	return JSON.stringify(logs, null, 2);
}

/** Export logs as CSV string */
export function exportLogsCSV(filters?: Parameters<typeof getLogs>[0]): string {
	const logs = getLogs(filters);
	const headers = ['timestamp', 'level', 'action', 'message', 'itemId', 'searchId', 'details'];
	const rows = logs.map(l => [
		l.timestamp,
		l.level,
		l.action,
		`"${l.message.replace(/"/g, '""')}"`,
		l.itemId ?? '',
		l.searchId ?? '',
		`"${JSON.stringify(l.details).replace(/"/g, '""')}"`,
	]);
	return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

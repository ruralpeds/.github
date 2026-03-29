// =============================================================================
// Knowledge Management Store
//
// Svelte store for managing clinical knowledge items. Provides CRUD operations,
// filtering, sorting, and summary statistics. All mutations are logged via the
// knowledge logger and persisted to localStorage.
// =============================================================================

import { writable, derived, get } from 'svelte/store';
import type {
	KnowledgeItem,
	KnowledgeCategory,
	KnowledgeStatus,
	KnowledgeSummary,
	PubMedResult,
} from './types';
import { logInfo, logWarn, logError, getLogs } from './logger';
import { getSavedSearches, getSearchesDueForRun } from './pubmed';

const STORAGE_KEY = 'ped-cds-knowledge-items';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
	return `ki-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
	return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function loadItems(): KnowledgeItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveItems(items: KnowledgeItem[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		logError('system_error', 'Failed to persist knowledge items — storage may be full');
	}
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const knowledgeItems = writable<KnowledgeItem[]>(loadItems());

// Auto-persist on change
knowledgeItems.subscribe(items => {
	saveItems(items);
});

// ---------------------------------------------------------------------------
// Derived stores
// ---------------------------------------------------------------------------

export const knowledgeCount = derived(knowledgeItems, $items => $items.length);

export const knowledgeSummary = derived(knowledgeItems, ($items): KnowledgeSummary => {
	const byCategory = {} as Record<KnowledgeCategory, number>;
	const byStatus = {} as Record<KnowledgeStatus, number>;
	const byDomain: Record<string, number> = {};

	for (const item of $items) {
		byCategory[item.category] = (byCategory[item.category] || 0) + 1;
		byStatus[item.status] = (byStatus[item.status] || 0) + 1;
		byDomain[item.domain] = (byDomain[item.domain] || 0) + 1;
	}

	const sorted = [...$items].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
	const byCreated = [...$items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

	const searches = getSavedSearches();
	const due = getSearchesDueForRun();

	return {
		totalItems: $items.length,
		byCategory,
		byStatus,
		byDomain,
		recentlyAdded: byCreated.slice(0, 10),
		recentlyModified: sorted.slice(0, 10),
		savedSearches: searches.length,
		searchesDueForRun: due.length,
		lastLogEntries: getLogs({ limit: 20 }),
	};
});

// ---------------------------------------------------------------------------
// CRUD Operations
// ---------------------------------------------------------------------------

/** Create a new knowledge item */
export function createKnowledgeItem(
	input: Omit<KnowledgeItem, 'id' | 'createdAt' | 'modifiedAt'>
): KnowledgeItem {
	const item: KnowledgeItem = {
		...input,
		id: generateId(),
		createdAt: now(),
		modifiedAt: now(),
	};

	knowledgeItems.update(items => [...items, item]);

	logInfo('item_created', `Knowledge item created: "${item.title}"`, {
		itemId: item.id,
		details: {
			category: item.category,
			domain: item.domain,
			status: item.status,
			pmid: item.pmid,
			tags: item.tags,
		},
	});

	return item;
}

/** Update an existing knowledge item */
export function updateKnowledgeItem(
	id: string,
	updates: Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>
): KnowledgeItem | null {
	let updated: KnowledgeItem | null = null;

	knowledgeItems.update(items => {
		const index = items.findIndex(i => i.id === id);
		if (index === -1) return items;

		const oldItem = items[index];
		updated = { ...oldItem, ...updates, modifiedAt: now() };
		const newItems = [...items];
		newItems[index] = updated;

		logInfo('item_updated', `Knowledge item updated: "${updated!.title}"`, {
			itemId: id,
			details: {
				changes: Object.keys(updates),
				oldModifiedAt: oldItem.modifiedAt,
				newModifiedAt: updated!.modifiedAt,
			},
		});

		// Log status changes specifically
		if (updates.status && updates.status !== oldItem.status) {
			logInfo('item_status_changed', `Status changed: "${oldItem.title}" ${oldItem.status} → ${updates.status}`, {
				itemId: id,
				details: { from: oldItem.status, to: updates.status },
			});
		}

		return newItems;
	});

	return updated;
}

/** Delete a knowledge item */
export function deleteKnowledgeItem(id: string): boolean {
	let found = false;

	knowledgeItems.update(items => {
		const index = items.findIndex(i => i.id === id);
		if (index === -1) return items;

		found = true;
		const removed = items[index];

		logInfo('item_deleted', `Knowledge item deleted: "${removed.title}"`, {
			itemId: id,
			details: { category: removed.category, domain: removed.domain },
		});

		return items.filter(i => i.id !== id);
	});

	return found;
}

/** Get a single knowledge item by ID */
export function getKnowledgeItem(id: string): KnowledgeItem | undefined {
	return get(knowledgeItems).find(i => i.id === id);
}

// ---------------------------------------------------------------------------
// Filtering & Search
// ---------------------------------------------------------------------------

export function filterKnowledgeItems(filters: {
	category?: KnowledgeCategory;
	status?: KnowledgeStatus;
	domain?: string;
	search?: string;
	tags?: string[];
}): KnowledgeItem[] {
	let items = get(knowledgeItems);

	if (filters.category) items = items.filter(i => i.category === filters.category);
	if (filters.status) items = items.filter(i => i.status === filters.status);
	if (filters.domain) items = items.filter(i => i.domain === filters.domain);
	if (filters.tags && filters.tags.length > 0) {
		items = items.filter(i => filters.tags!.some(t => i.tags.includes(t)));
	}
	if (filters.search) {
		const q = filters.search.toLowerCase();
		items = items.filter(i =>
			i.title.toLowerCase().includes(q) ||
			i.summary.toLowerCase().includes(q) ||
			i.authors.some(a => a.toLowerCase().includes(q)) ||
			(i.journal && i.journal.toLowerCase().includes(q)) ||
			i.tags.some(t => t.toLowerCase().includes(q))
		);
	}

	return items;
}

/** Get all unique domains from current items */
export function getActiveDomains(): string[] {
	const items = get(knowledgeItems);
	return [...new Set(items.map(i => i.domain))].sort();
}

/** Get all unique tags from current items */
export function getActiveTags(): string[] {
	const items = get(knowledgeItems);
	return [...new Set(items.flatMap(i => i.tags))].sort();
}

// ---------------------------------------------------------------------------
// PubMed Import
// ---------------------------------------------------------------------------

/** Import PubMed results as knowledge items */
export function importFromPubMed(
	results: PubMedResult[],
	options: { domain: string; status?: KnowledgeStatus; tags?: string[] } = { domain: 'general' }
): KnowledgeItem[] {
	const existing = get(knowledgeItems);
	const existingPmids = new Set(existing.filter(i => i.pmid).map(i => i.pmid));

	const newItems: KnowledgeItem[] = [];
	let skipped = 0;

	for (const result of results) {
		if (existingPmids.has(result.pmid)) {
			skipped++;
			continue;
		}

		// Determine category from publication type
		const category = classifyPublicationType(result.publicationType);

		const item = createKnowledgeItem({
			title: result.title,
			category,
			domain: options.domain,
			source: {
				type: 'pubmed',
				fetchedAt: now(),
				query: null,
			},
			publishedAt: result.publishedAt || null,
			summary: result.abstract || '',
			guidelineBody: null,
			pmid: result.pmid,
			doi: result.doi,
			authors: result.authors,
			journal: result.journal,
			tags: options.tags || [],
			status: options.status || 'new',
			version: null,
			url: `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`,
			relatedTreeId: null,
			notes: '',
		});

		newItems.push(item);
	}

	if (skipped > 0) {
		logWarn('pubmed_import', `Skipped ${skipped} duplicate PubMed articles (already tracked)`, {
			details: { skipped, imported: newItems.length },
		});
	}

	logInfo('pubmed_import', `Imported ${newItems.length} articles from PubMed`, {
		details: {
			imported: newItems.length,
			skipped,
			domain: options.domain,
		},
	});

	return newItems;
}

function classifyPublicationType(types: string[]): KnowledgeCategory {
	const lower = types.map(t => t.toLowerCase());
	if (lower.some(t => t.includes('practice guideline') || t.includes('guideline'))) return 'practice-guideline';
	if (lower.some(t => t.includes('systematic review') || t.includes('meta-analysis'))) return 'systematic-review';
	if (lower.some(t => t.includes('randomized controlled trial') || t.includes('clinical trial'))) return 'clinical-trial';
	if (lower.some(t => t.includes('consensus'))) return 'consensus-statement';
	if (lower.some(t => t.includes('review'))) return 'review-article';
	if (lower.some(t => t.includes('case report'))) return 'case-report';
	return 'other';
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Export all knowledge items as JSON */
export function exportKnowledgeJSON(): string {
	const items = get(knowledgeItems);

	logInfo('export_performed', `Exported ${items.length} knowledge items as JSON`, {
		details: { count: items.length, format: 'json' },
	});

	return JSON.stringify({
		exportedAt: now(),
		version: '1.0',
		itemCount: items.length,
		items,
	}, null, 2);
}

/** Export knowledge items as CSV */
export function exportKnowledgeCSV(): string {
	const items = get(knowledgeItems);

	const headers = [
		'id', 'title', 'category', 'domain', 'status', 'createdAt', 'modifiedAt',
		'publishedAt', 'authors', 'journal', 'pmid', 'doi', 'guidelineBody',
		'tags', 'version', 'url', 'relatedTreeId', 'summary'
	];

	const rows = items.map(i => [
		i.id,
		`"${i.title.replace(/"/g, '""')}"`,
		i.category,
		i.domain,
		i.status,
		i.createdAt,
		i.modifiedAt,
		i.publishedAt ?? '',
		`"${i.authors.join('; ').replace(/"/g, '""')}"`,
		i.journal ?? '',
		i.pmid ?? '',
		i.doi ?? '',
		i.guidelineBody ?? '',
		`"${i.tags.join('; ')}"`,
		i.version ?? '',
		i.url ?? '',
		i.relatedTreeId ?? '',
		`"${i.summary.replace(/"/g, '""').slice(0, 500)}"`,
	]);

	logInfo('export_performed', `Exported ${items.length} knowledge items as CSV`, {
		details: { count: items.length, format: 'csv' },
	});

	return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

/** Initialize the knowledge management system — call once on app startup */
export function initKnowledgeSystem(): void {
	const items = get(knowledgeItems);
	const searches = getSavedSearches();

	logInfo('system_init', `Knowledge system initialized: ${items.length} items, ${searches.length} saved searches`, {
		details: {
			itemCount: items.length,
			searchCount: searches.length,
			dueSearches: getSearchesDueForRun().length,
		},
	});
}

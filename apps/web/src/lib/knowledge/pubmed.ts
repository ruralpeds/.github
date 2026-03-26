// =============================================================================
// PubMed Search Service
//
// Integrates with the NCBI E-utilities API to search PubMed for new articles
// and practice guidelines. Supports saved searches with scheduled re-runs,
// result parsing, and import into the knowledge management system.
//
// API Docs: https://www.ncbi.nlm.nih.gov/books/NBK25500/
// =============================================================================

import type { PubMedResult, PubMedSavedSearch } from './types';
import { logInfo, logWarn, logError } from './logger';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ESEARCH_URL = `${EUTILS_BASE}/esearch.fcgi`;
const EFETCH_URL = `${EUTILS_BASE}/efetch.fcgi`;
const ESUMMARY_URL = `${EUTILS_BASE}/esummary.fcgi`;

const STORAGE_KEY_SEARCHES = 'ped-cds-pubmed-searches';

// Rate limit: NCBI allows 3 requests/second without API key
const REQUEST_DELAY_MS = 400;
let lastRequestTime = 0;

// ---------------------------------------------------------------------------
// Predefined search templates for pediatric/neonatal topics
// ---------------------------------------------------------------------------

export const PUBMED_SEARCH_TEMPLATES: { name: string; query: string; domain: string }[] = [
	{
		name: 'Neonatal Resuscitation Guidelines',
		query: '("neonatal resuscitation"[MeSH] OR "NRP"[tiab]) AND ("practice guideline"[pt] OR "guideline"[pt]) AND ("last 1 year"[dp])',
		domain: 'resuscitation',
	},
	{
		name: 'PALS Updates',
		query: '("pediatric advanced life support"[MeSH] OR "PALS"[tiab]) AND ("practice guideline"[pt] OR "guideline"[pt] OR "consensus"[tiab]) AND ("last 1 year"[dp])',
		domain: 'resuscitation',
	},
	{
		name: 'Pediatric Sepsis Guidelines',
		query: '("sepsis"[MeSH] AND ("child"[MeSH] OR "infant"[MeSH] OR "pediatric"[tiab])) AND ("practice guideline"[pt] OR "guideline"[pt]) AND ("last 1 year"[dp])',
		domain: 'sepsis',
	},
	{
		name: 'Pediatric Airway Management',
		query: '("airway management"[MeSH] AND ("child"[MeSH] OR "pediatric"[tiab])) AND ("practice guideline"[pt] OR "review"[pt]) AND ("last 1 year"[dp])',
		domain: 'airway',
	},
	{
		name: 'Neonatal Respiratory Support',
		query: '(("respiratory distress syndrome, newborn"[MeSH] OR "continuous positive airway pressure"[MeSH]) AND "infant, newborn"[MeSH]) AND ("last 1 year"[dp])',
		domain: 'neonatal',
	},
	{
		name: 'Pediatric Cardiac Emergencies',
		query: '("heart arrest"[MeSH] AND ("child"[MeSH] OR "pediatric"[tiab])) AND ("practice guideline"[pt] OR "review"[pt]) AND ("last 1 year"[dp])',
		domain: 'cardiac',
	},
	{
		name: 'Pediatric Trauma Updates',
		query: '("wounds and injuries"[MeSH] AND ("child"[MeSH] OR "pediatric"[tiab])) AND ("practice guideline"[pt]) AND ("last 1 year"[dp])',
		domain: 'trauma',
	},
	{
		name: 'Pediatric DKA Management',
		query: '("diabetic ketoacidosis"[MeSH] AND ("child"[MeSH] OR "pediatric"[tiab])) AND ("last 1 year"[dp])',
		domain: 'metabolic',
	},
	{
		name: 'Neonatal Jaundice Guidelines',
		query: '("jaundice, neonatal"[MeSH] OR "hyperbilirubinemia, neonatal"[MeSH]) AND ("practice guideline"[pt] OR "guideline"[pt]) AND ("last 5 years"[dp])',
		domain: 'neonatal',
	},
	{
		name: 'Status Epilepticus — Pediatric',
		query: '("status epilepticus"[MeSH] AND ("child"[MeSH] OR "pediatric"[tiab])) AND ("practice guideline"[pt] OR "review"[pt]) AND ("last 1 year"[dp])',
		domain: 'neurological',
	},
];

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

async function throttle(): Promise<void> {
	const now = Date.now();
	const elapsed = now - lastRequestTime;
	if (elapsed < REQUEST_DELAY_MS) {
		await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - elapsed));
	}
	lastRequestTime = Date.now();
}

// ---------------------------------------------------------------------------
// PubMed API calls
// ---------------------------------------------------------------------------

/** Search PubMed and return PMIDs */
export async function searchPubMed(
	query: string,
	options: { maxResults?: number; minDate?: string; maxDate?: string } = {}
): Promise<{ pmids: string[]; totalCount: number }> {
	const maxResults = options.maxResults ?? 20;

	const params = new URLSearchParams({
		db: 'pubmed',
		term: query,
		retmax: String(maxResults),
		retmode: 'json',
		sort: 'date',
		usehistory: 'n',
	});

	if (options.minDate) params.set('mindate', options.minDate);
	if (options.maxDate) params.set('maxdate', options.maxDate);

	logInfo('pubmed_fetch', `Searching PubMed: "${query}" (max ${maxResults})`, {
		details: { query, maxResults },
	});

	await throttle();

	try {
		const response = await fetch(`${ESEARCH_URL}?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`PubMed search failed: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		const result = data.esearchresult;
		const pmids: string[] = result.idlist || [];
		const totalCount = parseInt(result.count, 10) || 0;

		logInfo('pubmed_fetch', `PubMed returned ${pmids.length} of ${totalCount} results`, {
			details: { query, pmids, totalCount },
		});

		return { pmids, totalCount };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		logError('search_failed', `PubMed search error: ${message}`, {
			details: { query, error: message },
		});
		throw err;
	}
}

/** Fetch article summaries by PMIDs */
export async function fetchArticleSummaries(pmids: string[]): Promise<PubMedResult[]> {
	if (pmids.length === 0) return [];

	logInfo('pubmed_fetch', `Fetching summaries for ${pmids.length} articles`, {
		details: { pmids },
	});

	await throttle();

	try {
		const params = new URLSearchParams({
			db: 'pubmed',
			id: pmids.join(','),
			retmode: 'json',
		});

		const response = await fetch(`${ESUMMARY_URL}?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`PubMed summary fetch failed: ${response.status}`);
		}

		const data = await response.json();
		const results: PubMedResult[] = [];

		for (const pmid of pmids) {
			const article = data.result?.[pmid];
			if (!article) continue;

			results.push({
				pmid,
				title: article.title || 'Untitled',
				authors: (article.authors || []).map((a: { name: string }) => a.name),
				journal: article.fulljournalname || article.source || 'Unknown',
				publishedAt: article.pubdate || '',
				doi: extractDoi(article.elocationid),
				abstract: '', // Summary endpoint doesn't include abstracts
				meshTerms: [],
				publicationType: article.pubtype || [],
			});
		}

		logInfo('pubmed_fetch', `Parsed ${results.length} article summaries`, {
			details: { count: results.length },
		});

		return results;
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		logError('search_failed', `Failed to fetch article summaries: ${message}`, {
			details: { pmids, error: message },
		});
		throw err;
	}
}

/** Fetch full abstracts for articles by PMIDs */
export async function fetchAbstracts(pmids: string[]): Promise<Map<string, string>> {
	if (pmids.length === 0) return new Map();

	await throttle();

	try {
		const params = new URLSearchParams({
			db: 'pubmed',
			id: pmids.join(','),
			rettype: 'abstract',
			retmode: 'xml',
		});

		const response = await fetch(`${EFETCH_URL}?${params.toString()}`);
		if (!response.ok) {
			throw new Error(`PubMed abstract fetch failed: ${response.status}`);
		}

		const text = await response.text();
		const abstracts = new Map<string, string>();

		// Parse XML to extract abstracts
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/xml');
		const articles = doc.querySelectorAll('PubmedArticle');

		for (const article of articles) {
			const pmidEl = article.querySelector('PMID');
			const abstractEl = article.querySelector('Abstract');
			if (pmidEl && abstractEl) {
				const pmid = pmidEl.textContent || '';
				const abstractTexts = abstractEl.querySelectorAll('AbstractText');
				const fullAbstract = Array.from(abstractTexts)
					.map(el => {
						const label = el.getAttribute('Label');
						const content = el.textContent || '';
						return label ? `${label}: ${content}` : content;
					})
					.join('\n\n');
				abstracts.set(pmid, fullAbstract);
			}
		}

		logInfo('pubmed_fetch', `Fetched ${abstracts.size} abstracts`, {
			details: { requested: pmids.length, fetched: abstracts.size },
		});

		return abstracts;
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		logWarn('search_failed', `Failed to fetch abstracts: ${message}`, {
			details: { pmids, error: message },
		});
		return new Map();
	}
}

/** Run a complete search: find PMIDs, fetch summaries + abstracts */
export async function runFullSearch(
	query: string,
	options: { maxResults?: number; minDate?: string } = {}
): Promise<PubMedResult[]> {
	const { pmids, totalCount } = await searchPubMed(query, options);
	if (pmids.length === 0) return [];

	const articles = await fetchArticleSummaries(pmids);
	const abstracts = await fetchAbstracts(pmids);

	// Merge abstracts into results
	for (const article of articles) {
		article.abstract = abstracts.get(article.pmid) || '';
	}

	logInfo('pubmed_fetch', `Full search complete: ${articles.length} articles with abstracts (${totalCount} total in PubMed)`, {
		details: { query, resultCount: articles.length, totalCount },
	});

	return articles;
}

// ---------------------------------------------------------------------------
// Saved searches — persistence
// ---------------------------------------------------------------------------

function loadSavedSearches(): PubMedSavedSearch[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY_SEARCHES);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveSavedSearches(searches: PubMedSavedSearch[]): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_SEARCHES, JSON.stringify(searches));
	} catch {}
}

export function getSavedSearches(): PubMedSavedSearch[] {
	return loadSavedSearches();
}

export function addSavedSearch(search: Omit<PubMedSavedSearch, 'id' | 'createdAt' | 'lastRunAt' | 'lastResultCount'>): PubMedSavedSearch {
	const newSearch: PubMedSavedSearch = {
		...search,
		id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		createdAt: new Date().toISOString(),
		lastRunAt: null,
		lastResultCount: 0,
	};

	const searches = loadSavedSearches();
	searches.push(newSearch);
	saveSavedSearches(searches);

	logInfo('search_created', `Saved search created: "${newSearch.name}"`, {
		searchId: newSearch.id,
		details: { name: newSearch.name, query: newSearch.query, domain: newSearch.domain },
	});

	return newSearch;
}

export function updateSavedSearch(id: string, updates: Partial<PubMedSavedSearch>): PubMedSavedSearch | null {
	const searches = loadSavedSearches();
	const index = searches.findIndex(s => s.id === id);
	if (index === -1) return null;

	searches[index] = { ...searches[index], ...updates };
	saveSavedSearches(searches);

	logInfo('search_updated', `Saved search updated: "${searches[index].name}"`, {
		searchId: id,
		details: updates,
	});

	return searches[index];
}

export function deleteSavedSearch(id: string): boolean {
	const searches = loadSavedSearches();
	const index = searches.findIndex(s => s.id === id);
	if (index === -1) return false;

	const removed = searches.splice(index, 1)[0];
	saveSavedSearches(searches);

	logInfo('search_deleted', `Saved search deleted: "${removed.name}"`, {
		searchId: id,
	});

	return true;
}

/** Check which saved searches are due to run based on their interval */
export function getSearchesDueForRun(): PubMedSavedSearch[] {
	const searches = loadSavedSearches();
	const now = Date.now();

	return searches.filter(s => {
		if (!s.enabled) return false;
		if (!s.lastRunAt) return true;
		const lastRun = new Date(s.lastRunAt).getTime();
		const intervalMs = s.intervalDays * 24 * 60 * 60 * 1000;
		return (now - lastRun) >= intervalMs;
	});
}

/** Execute a saved search and update its metadata */
export async function executeSavedSearch(id: string): Promise<PubMedResult[]> {
	const searches = loadSavedSearches();
	const search = searches.find(s => s.id === id);
	if (!search) {
		logError('search_failed', `Saved search not found: ${id}`, { searchId: id });
		throw new Error(`Saved search not found: ${id}`);
	}

	logInfo('search_executed', `Running saved search: "${search.name}"`, {
		searchId: id,
		details: { query: search.query },
	});

	try {
		const minDate = search.lastRunAt
			? new Date(search.lastRunAt).toISOString().split('T')[0].replace(/-/g, '/')
			: undefined;

		const results = await runFullSearch(search.query, { minDate });

		updateSavedSearch(id, {
			lastRunAt: new Date().toISOString(),
			lastResultCount: results.length,
		});

		logInfo('search_executed', `Saved search "${search.name}" completed: ${results.length} new results`, {
			searchId: id,
			details: { resultCount: results.length },
		});

		return results;
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		logError('search_failed', `Saved search "${search.name}" failed: ${message}`, {
			searchId: id,
			details: { error: message },
		});
		throw err;
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractDoi(elocationid: string | undefined): string | null {
	if (!elocationid) return null;
	const match = elocationid.match(/doi:\s*(\S+)/i);
	return match ? match[1] : null;
}

/** Build a PubMed guideline-focused query for a topic */
export function buildGuidelineQuery(topic: string, organization?: string): string {
	let query = `("${topic}") AND ("practice guideline"[pt] OR "guideline"[pt] OR "consensus"[tiab])`;
	if (organization) {
		query += ` AND ("${organization}"[Corporate Author] OR "${organization}"[tiab])`;
	}
	query += ' AND ("last 2 years"[dp])';
	return query;
}

// =============================================================================
// Knowledge Management System — Types
//
// Tracks clinical knowledge sources (guidelines, articles, education content)
// with creation/modification dates, PubMed integration, and extensive logging.
// =============================================================================

/** A tracked knowledge item — guideline, article, or education resource */
export interface KnowledgeItem {
	id: string;
	title: string;
	category: KnowledgeCategory;
	/** Clinical domain (e.g., "resuscitation", "sepsis", "airway") */
	domain: string;
	/** Where the content originated */
	source: KnowledgeSource;
	/** ISO date string — when the item was first added to the system */
	createdAt: string;
	/** ISO date string — last modification to this entry */
	modifiedAt: string;
	/** ISO date string — publication date of the source material */
	publishedAt: string | null;
	/** Free-text description or summary */
	summary: string;
	/** Associated guideline body (e.g., "AAP", "AHA", "WHO") */
	guidelineBody: string | null;
	/** PubMed ID if sourced from PubMed */
	pmid: string | null;
	/** DOI */
	doi: string | null;
	/** Authors list */
	authors: string[];
	/** Journal name */
	journal: string | null;
	/** Tags for filtering and search */
	tags: string[];
	/** Current review status */
	status: KnowledgeStatus;
	/** Version of the guideline/content (e.g., "8th Edition", "2025 Update") */
	version: string | null;
	/** Link to the original content */
	url: string | null;
	/** ID of related decision tree, if any */
	relatedTreeId: string | null;
	/** Free-text notes from the user/reviewer */
	notes: string;
}

export type KnowledgeCategory =
	| 'practice-guideline'
	| 'systematic-review'
	| 'clinical-trial'
	| 'consensus-statement'
	| 'textbook'
	| 'education-module'
	| 'protocol'
	| 'review-article'
	| 'case-report'
	| 'other';

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
	'practice-guideline': 'Practice Guideline',
	'systematic-review': 'Systematic Review',
	'clinical-trial': 'Clinical Trial',
	'consensus-statement': 'Consensus Statement',
	'textbook': 'Textbook',
	'education-module': 'Education Module',
	'protocol': 'Protocol',
	'review-article': 'Review Article',
	'case-report': 'Case Report',
	'other': 'Other',
};

export type KnowledgeStatus =
	| 'new'
	| 'under-review'
	| 'approved'
	| 'integrated'
	| 'superseded'
	| 'archived';

export const KNOWLEDGE_STATUS_LABELS: Record<KnowledgeStatus, string> = {
	'new': 'New',
	'under-review': 'Under Review',
	'approved': 'Approved',
	'integrated': 'Integrated',
	'superseded': 'Superseded',
	'archived': 'Archived',
};

export interface KnowledgeSource {
	type: 'pubmed' | 'manual' | 'guideline-alert' | 'import';
	/** When the source was last checked/fetched */
	fetchedAt: string | null;
	/** Raw query that found this item */
	query: string | null;
}

// =============================================================================
// PubMed Search Types
// =============================================================================

/** A saved PubMed search query that runs on a schedule */
export interface PubMedSavedSearch {
	id: string;
	/** Human-readable name for this search */
	name: string;
	/** PubMed query string */
	query: string;
	/** Clinical domain this search covers */
	domain: string;
	/** How often to check (days) */
	intervalDays: number;
	/** ISO date — last time this search was executed */
	lastRunAt: string | null;
	/** Number of results found on last run */
	lastResultCount: number;
	/** Whether this search is active */
	enabled: boolean;
	/** ISO date — when this search was created */
	createdAt: string;
}

/** A result from a PubMed search */
export interface PubMedResult {
	pmid: string;
	title: string;
	authors: string[];
	journal: string;
	publishedAt: string;
	doi: string | null;
	abstract: string;
	meshTerms: string[];
	publicationType: string[];
}

// =============================================================================
// Logging Types
// =============================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type LogAction =
	| 'item_created'
	| 'item_updated'
	| 'item_deleted'
	| 'item_status_changed'
	| 'search_created'
	| 'search_updated'
	| 'search_deleted'
	| 'search_executed'
	| 'search_failed'
	| 'pubmed_fetch'
	| 'pubmed_import'
	| 'guideline_check'
	| 'export_performed'
	| 'bulk_import'
	| 'system_init'
	| 'system_error';

export interface KnowledgeLogEntry {
	id: string;
	timestamp: string;
	level: LogLevel;
	action: LogAction;
	/** Human-readable message */
	message: string;
	/** Related knowledge item ID, if applicable */
	itemId: string | null;
	/** Related search ID, if applicable */
	searchId: string | null;
	/** Additional structured data */
	details: Record<string, unknown>;
}

// =============================================================================
// Dashboard / Summary Types
// =============================================================================

export interface KnowledgeSummary {
	totalItems: number;
	byCategory: Record<KnowledgeCategory, number>;
	byStatus: Record<KnowledgeStatus, number>;
	byDomain: Record<string, number>;
	recentlyAdded: KnowledgeItem[];
	recentlyModified: KnowledgeItem[];
	savedSearches: number;
	searchesDueForRun: number;
	lastLogEntries: KnowledgeLogEntry[];
}

/**
 * apps/web/src/lib/data/textbook/textbook-types.ts
 *
 * TypeScript type definitions for the existing textbook-data.js schema.
 * The raw data uses {sections: [{id, heading, content_html}]} structure.
 * This file adds compile-time safety without rewriting 2039 lines of content.
 *
 * Also exports an adapter to convert to the TextbookSection schema used
 * by ClinicalDecisionTree components (blocks: TextbookBlock[]).
 */

import type { TextbookSection, TextbookBlock } from '$lib/d3/tree-schema';

// ── Raw data schema (matches textbook-data.js) ─────────────────────────────

export interface TextbookMeta {
	title: string;
	subtitle: string;
	year: number;
	disclaimer: string;
}

export interface TextbookRawSection {
	id: string;
	heading: string;
	/** HTML string — rendered directly via {@html ...} in Svelte */
	content_html: string;
}

export interface TextbookRawChapter {
	id: string;
	number: string;
	title: string;
	sections: TextbookRawSection[];
}

// ── Calculator field types (matches calculators-registry.js) ──────────────

export interface CalculatorField {
	type?: 'section' | 'toggle' | 'select';
	name?: string;
	label: string;
	step?: string;
	min?: number;
	max?: number;
	optional?: boolean;
	options?: Array<{ value: string; label: string }>;
}

export interface Calculator {
	id: string;
	name: string;
	category: string;
	description: string;
	scoreRange?: string;
	/** 'neonatal' | 'pediatric' — which modes show this calculator */
	modes: Array<'neonatal' | 'pediatric'>;
	fields: CalculatorField[];
	/** ped-wasm function name — e.g. 'calculate_phoenix_sepsis_json' */
	wasmFn?: string;
}

export type CalculatorCategory =
	| 'sepsis' | 'pews' | 'neonatal' | 'respiratory'
	| 'trauma' | 'renal-scoring' | 'pain' | 'bedside'
	| 'nutritional' | 'protocols' | 'burns' | 'custom';

// ── Typed imports from the raw JS files ───────────────────────────────────

// Re-export the raw JS modules with type assertions.
// TypeScript will check usage against these types at compile time.

export type { TextbookMeta as ITextbookMeta };

// ── Adapter: raw HTML chapter → TextbookSection (blocks format) ─────────────

/**
 * Convert a raw textbook chapter (content_html sections) into the
 * structured `TextbookSection` format used by ClinicalDecisionTree.
 *
 * This is a one-way adapter — it wraps each section's HTML as a
 * paragraph block so existing content renders in the tree's textbook tab.
 */
export function rawChapterToSection(chapter: TextbookRawChapter): TextbookSection {
	const blocks: TextbookBlock[] = [];

	blocks.push({ type: 'heading', level: 1, text: chapter.title });

	for (const section of chapter.sections) {
		blocks.push({ type: 'heading', level: 2, text: section.heading });
		// Wrap the HTML content as a paragraph with raw HTML preserved
		// (Svelte components that render TextbookBlock will need to handle type='raw-html')
		blocks.push({ type: 'paragraph', text: section.content_html });
	}

	return { title: chapter.title, blocks, references: [] };
}

/**
 * Find a chapter by ID from the raw chapters array.
 */
export function findChapter(
	chapters: TextbookRawChapter[],
	chapterId: string
): TextbookRawChapter | undefined {
	return chapters.find(c => c.id === chapterId);
}

/**
 * Search chapter content for a query string (case-insensitive).
 * Returns chapters that contain the query in title or section content.
 */
export function searchTextbook(
	chapters: TextbookRawChapter[],
	query: string
): TextbookRawChapter[] {
	const q = query.toLowerCase();
	return chapters.filter(ch =>
		ch.title.toLowerCase().includes(q) ||
		ch.sections.some(s =>
			s.heading.toLowerCase().includes(q) ||
			s.content_html.toLowerCase().includes(q)
		)
	);
}

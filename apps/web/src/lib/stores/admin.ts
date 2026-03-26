/**
 * Admin module store
 * Handles offline-first auth (localStorage PIN) and shared admin state.
 * No server required — reads static JSON files from the Peds repo.
 */
import { writable, derived, get } from 'svelte/store';

// ── Auth ────────────────────────────────────────────────────────────────────
const ADMIN_PIN_KEY = 'peds-admin-pin';
const DEFAULT_PIN   = '1234'; // change via admin settings panel

export const isAuthenticated = writable(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(ADMIN_PIN_KEY) === 'verified'
    : false
);

export function login(pin: string): boolean {
  // PIN is stored hashed in localStorage; default is '1234'
  const storedHash = localStorage.getItem('peds-admin-hash') || simpleHash(DEFAULT_PIN);
  if (simpleHash(pin) === storedHash) {
    localStorage.setItem(ADMIN_PIN_KEY, 'verified');
    isAuthenticated.set(true);
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(ADMIN_PIN_KEY);
  isAuthenticated.set(false);
}

export function changePin(oldPin: string, newPin: string): boolean {
  const storedHash = localStorage.getItem('peds-admin-hash') || simpleHash(DEFAULT_PIN);
  if (simpleHash(oldPin) !== storedHash) return false;
  localStorage.setItem('peds-admin-hash', simpleHash(newPin));
  return true;
}

/** Very simple hash — not cryptographic, just prevents casual snooping */
function simpleHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

// ── Knowledge registry ───────────────────────────────────────────────────────
export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  description?: string;
  path?: string;
  status: 'active' | 'deprecated' | 'draft';
  tags?: string[];
  created?: string;
  modified?: string;
}

export interface KnowledgeRegistry {
  schema_version: string;
  last_updated: string;
  categories: Record<string, string>;
  entries: Record<string, KnowledgeEntry>;
}

// ── Decision tree registry ────────────────────────────────────────────────────
export interface TreeRegistryEntry {
  id: string;
  filename: string;
  title: string;
  category: string;
  tags: string[];
  created: string;
  modified: string;
  version: string;
  status: string;
  has_theme_bridge: boolean;
  has_shell: boolean;
  has_edu_links: boolean;
}

export interface TreeRegistry {
  trees: TreeRegistryEntry[];
  last_updated: string;
}

// ── Stores ───────────────────────────────────────────────────────────────────
export const knowledgeRegistry = writable<KnowledgeRegistry | null>(null);
export const treeRegistry       = writable<TreeRegistry | null>(null);
export const adminSearch        = writable('');
export const activeCategory     = writable<string>('all');
export const isLoading          = writable(false);
export const adminError         = writable<string | null>(null);

/** Load both registries from static JSON paths */
export async function loadRegistries(): Promise<void> {
  isLoading.set(true);
  adminError.set(null);
  try {
    const [kr, tr] = await Promise.all([
      fetch('/knowledge/registry.json').then(r => r.json()),
      fetch('/decision-trees/REGISTRY.json').then(r => r.json()),
    ]);
    knowledgeRegistry.set(kr);
    treeRegistry.set(tr);
  } catch (e) {
    adminError.set(`Failed to load registries: ${e}`);
  } finally {
    isLoading.set(false);
  }
}

// ── Derived stats ────────────────────────────────────────────────────────────
export const registryStats = derived(knowledgeRegistry, ($kr) => {
  if (!$kr) return null;
  const counts: Record<string, number> = {};
  for (const entry of Object.values($kr.entries)) {
    counts[entry.category] = (counts[entry.category] || 0) + 1;
  }
  return {
    total: Object.keys($kr.entries).length,
    byCategory: counts,
    lastUpdated: $kr.last_updated,
  };
});

export const filteredEntries = derived(
  [knowledgeRegistry, adminSearch, activeCategory],
  ([$kr, $search, $cat]) => {
    if (!$kr) return [];
    const entries = Object.values($kr.entries);
    const q = $search.toLowerCase();
    return entries.filter(e => {
      const matchCat  = $cat === 'all' || e.category === $cat;
      const matchText = !q ||
        e.title.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  }
);

// ── Content gap analysis ─────────────────────────────────────────────────────
export const contentGaps = derived(
  [knowledgeRegistry, treeRegistry],
  ([$kr, $tr]) => {
    if (!$kr || !$tr) return null;

    const eduGuides = Object.values($kr.entries)
      .filter(e => e.category === 'education_guide').length;
    const textbooks = Object.values($kr.entries)
      .filter(e => e.category === 'textbook').length;
    const calcs = Object.values($kr.entries)
      .filter(e => e.category === 'calculator').length;
    const trees = $tr.trees.length;
    const treesMono = $tr.trees.filter(t => !t.has_theme_bridge).length;

    const gaps = [];
    if (treesMono > 0) gaps.push({
      severity: 'high',
      message: `${treesMono} standalone trees not yet separated into data/engine layers`,
      action: 'Migrate to tree-data/ JSON + tree-engine.js'
    });
    if (eduGuides < 28) gaps.push({
      severity: 'medium',
      message: `Education guide registry incomplete (${eduGuides} of ~28 indexed)`,
      action: 'Run ./scripts/knowledge.sh import-guides'
    });
    if (textbooks < 17) gaps.push({
      severity: 'medium',
      message: `Textbook registry incomplete (${textbooks} of ~17 indexed)`,
      action: 'Run ./scripts/knowledge.sh import-textbooks'
    });

    return { eduGuides, textbooks, calcs, trees, treesMono, gaps };
  }
);

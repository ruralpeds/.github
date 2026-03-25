# Education Links Retrofit Plan — Decision Tree Library

> **Repository:** `timothyhartzog/Peds`
> **Date:** 2026-03-24
> **Scope:** Add 📚 Education Resources panel to all 35 clinical decision trees
> **Tracking:** `apps/web/static/decision-trees/REGISTRY.json`

---

## Architecture Overview

### Shared Module Approach

Rather than modifying each of the 35 HTML files individually, the education links system uses a **shared JavaScript module** (`edu-links.js`) that can be injected into every tree with a single `<script>` tag.

```
apps/web/static/
├── theme-bridge.js      ← Theme cycling (existing)
├── shell.js             ← Patient banner (existing)
├── edu-links.js         ← 📚 Education panel (NEW)
└── decision-trees/
    ├── REGISTRY.json    ← Tracking & topic-mapping (NEW)
    ├── index.html       ← Library index
    └── *.html           ← 35 decision tree files
```

### How edu-links.js Works

1. On load, reads `REGISTRY.json` from the same directory
2. Matches current filename to find the tree's entry in the registry
3. Reads the `education_links` object to get topic-specific document mappings
4. Builds a slide-out panel with categorized links (education guides, textbooks, audio textbooks, cheat sheets)
5. All links use relative paths from `decision-trees/` → `../../content/`
6. Falls back to universal core references if registry load fails

### Integration Pattern

Add **one line** to each existing tree HTML, after `shell.js`:

```html
</script><script src="../theme-bridge.js"></script>
<script src="../shell.js"></script>
<script src="../edu-links.js"></script>       <!-- ADD THIS LINE -->
</body></html>
```

---

## Phase 1: Infrastructure (COMPLETE)

- [x] Create `REGISTRY.json` with all 35 trees tracked
- [x] Create `edu-links.js` shared module
- [x] Build glucose management tree as reference implementation
- [x] Map education_links for all 35 trees in registry
- [x] Push to `timothyhartzog/Peds`

## Phase 2: Inject edu-links.js into All Trees

**Scope:** Add `<script src="../edu-links.js"></script>` to all 35 existing trees.

**Method:** Single sed/script operation — each tree already ends with:
```html
</script><script src="../theme-bridge.js"></script>
<script src="../shell.js"></script>
</body></html>
```

Replace with:
```html
</script><script src="../theme-bridge.js"></script>
<script src="../shell.js"></script>
<script src="../edu-links.js"></script>
</body></html>
```

**Execution script:**
```bash
cd apps/web/static/decision-trees
for f in *.html; do
  [ "$f" = "index.html" ] && continue
  # Skip if already has edu-links.js
  grep -q 'edu-links.js' "$f" && continue
  # Inject before </body>
  sed -i 's|</script>\n<script src="../shell.js"></script>|</script>\n<script src="../shell.js"></script>\n<script src="../edu-links.js"></script>|' "$f"
done
```

**Estimated time:** 5 minutes
**Risk:** Zero — edu-links.js is purely additive, no DOM conflicts

## Phase 3: Update Index Page

Add education link counts and status badges to `index.html` library page:
- Show 📚 badge on cards that have mapped education content
- Add "Education Materials" filter to the category sidebar
- Link to REGISTRY.json for programmatic access

## Phase 4: Registry Maintenance

### When Creating New Decision Trees

1. Create the tree HTML with `<script src="../edu-links.js"></script>`
2. Add entry to `REGISTRY.json` with:
   - `id`, `filename`, `title`, `category`, `tags`
   - `created` and `modified` dates
   - `version` (semver)
   - `has_edu_links: true`
   - `education_links` mapping to relevant documents
3. Increment `last_updated` in REGISTRY.json header

### When Creating New Education Guides

1. Create the guide in `content/education-guides/`
2. Add the guide number to `EDU_GUIDE_MAP` in `edu-links.js`
3. Update `REGISTRY.json` to add the guide number to relevant trees' `education_links.education_guides` arrays
4. If a textbook/audio/cheat-sheet set is also created, add the slug to `CONTENT_NAMES` in `edu-links.js` and update relevant trees

### When Modifying Existing Trees

1. Update `modified` date in REGISTRY.json
2. Increment `version` (patch for content, minor for structure, major for redesign)
3. Add changelog entry

---

## Education Link Mapping (Complete)

### Neonatal Trees → Education Content

| Decision Tree | Education Guides | Textbooks | Audio | Cheat Sheets |
|---|---|---|---|---|
| Glucose Management (32–35 wk) | 01b, 05, 08, 11 | endocrine, fen | endocrine, fen | endocrine, fen |
| Cardiac / PDA | 20 | — | — | — |
| Endocrine | 01b | endocrine | endocrine | endocrine |
| FEN | 11 | fen | fen | fen |
| GI & Liver | 13 | gi_liver | gi_liver | gi_liver |
| Hematology | — | hematology | hematology | hematology |
| Infectious Diseases | 17 | infectious_diseases | infectious_diseases | infectious_diseases |
| Neurology | 14, 19 | neurology | neurology | neurology |
| NOWS/NAS | 22 | — | — | — |
| Ophthalmology | 16 | — | — | — |
| Pain & Sedation | — | — | — | — |
| Pulmonary | 09, 10, 13, 15, 21 | pulmonary | pulmonary | pulmonary |
| Renal | — | renal | renal | renal |
| Skin | — | skin | skin | skin |
| Surgical Emergencies | — | surgical_emergencies | surgical_emergencies | surgical_emergencies |
| Transport | 08 | critical_care | critical_care | critical_care |
| Urological | — | urology | urology | urology |
| Discharge Readiness | 01, 05 | — | — | — |
| Newborn Screening | — | — | — | — |
| NRP Resuscitation | 02, 04, 08 | critical_care | critical_care | critical_care |

### Pediatric Trees → Education Content

| Decision Tree | Education Guides | Textbooks |
|---|---|---|
| Obstetric Emergencies | 15 | maternal_infections |
| PALS Algorithm | 04, 14 | critical_care |
| Respiratory Emergencies | 09, 10 | — |
| Sepsis & Shock | 17 | — |
| Shoulder Dystocia | — | — |
| Abdominal Pain | — | — |
| Anaphylaxis | — | — |
| Burns | — | — |
| Cardiac Emergencies | — | — |
| DKA | — | — |
| Orthopedic | — | — |
| Psychiatric | — | — |
| Seizures | — | — |
| SIADH/CSW | — | — |
| Toxicology | — | — |
| Trauma | — | — |

### Gap Analysis

**Trees with no mapped education content (12):**
- neonatal_pain_sedation
- newborn_screening_followup
- shoulder_dystocia
- pediatric_abdominal_pain
- pediatric_anaphylaxis
- pediatric_burns
- pediatric_cardiac_emergencies
- pediatric_dka
- pediatric_orthopedic
- pediatric_psychiatric_emergencies
- pediatric_seizures
- pediatric_toxicology
- pediatric_trauma

These trees will show universal core references (Nursery Care Guide, Level I/II Pathway, Rural Stabilization) via the edu-links.js fallback, but could benefit from dedicated education guides in future batches.

---

## Files Delivered

| File | Path | Purpose |
|---|---|---|
| REGISTRY.json | `apps/web/static/decision-trees/REGISTRY.json` | Tracking & topic mapping |
| edu-links.js | `apps/web/static/edu-links.js` | Shared education panel module |
| Glucose Management Tree | `apps/web/static/decision-trees/neonatal_glucose_management_decision_tree.html` | Reference implementation |
| Literature Review | `content/literature-reviews/glucose_management_32_35wk_literature_review.docx` | Supporting document |
| This Plan | `docs/EDUCATION_LINKS_RETROFIT_PLAN.md` | Project documentation |

---

*Generated 2026-03-24 · Claude · timothyhartzog/Peds*

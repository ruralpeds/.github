# Glucose Management Decision Tree — 32–35 Week Neonates

Interactive D3.js clinical decision tree for bedside glucose management in late preterm (32–35 week) neonates in Level II nursery settings.

## Quick Start

Open `index.html` in any modern browser. No server required — single-file HTML with CDN dependencies only.

## Features

- **Light/Dark Theme**: Toggle via ☀/☾ switch in banner; persists in localStorage
- **Collapsible Tree**: Click nodes to expand/collapse; Expand All / Collapse All buttons
- **ⓘ Info Panels**: Click the teal badge on any node for tabbed reference panels with:
  - Dosing tables (dextrose gel, IV dextrose, GIR calculations)
  - PubMed evidence with DOI citations
  - Alert boxes for emergency/transfer criteria
- **📚 Education Links**: Slide-out panel linking to related education guides, textbooks, audio textbooks, and cheat sheets in this repository
- **⚙ Banner Configuration**: Customize banner colors, title, logo to match your hospital's branding
- **Zoom & Pan**: Mouse wheel zoom, drag to pan, Reset View button

## Decision Branches

1. **Symptomatic Hypoglycemia** (Emergency) → IV D10W bolus + continuous infusion
2. **Asymptomatic <25 mg/dL** (Urgent) → Dextrose gel + feed → escalate to IV if not responding
3. **Asymptomatic 25–39 mg/dL** (Decision) → Feed ± gel → monitor → escalate if needed
4. **Asymptomatic ≥40 mg/dL** (Assessment) → Continue screening → d/c when stable

## Embedding

```html
<!-- iframe -->
<iframe src="index.html" width="100%" height="800px"></iframe>

<!-- JavaScript API -->
<script>
  setBannerTheme({
    bg: '#1a3c6e',
    text: '#fff',
    title: 'Your Hospital — Neonatal Unit',
    logoUrl: 'https://your-logo.png'
  });
  setEduBaseUrl('https://github.com/timothyhartzog/peds/blob/main/content');
</script>
```

## Evidence Base

30 PubMed-sourced references including:
- AAP Clinical Report (Adamkin 2011)
- Cochrane Systematic Review of Dextrose Gel (Edwards 2022)
- ALPS Follow-Up Study (Gyamfi-Bannerman 2024, JAMA)
- ABM Clinical Protocol #1 (Wight 2014, 2021)
- Multiple implementation studies from US hospitals including rural Level 1 sites

## Related Documents

| Document | Path | Type |
|----------|------|------|
| Literature Review | `content/literature-reviews/glucose_management_32_35wk_literature_review.docx` | DOCX |
| Nursery Care Guide Vol II (Hypoglycemia) | `content/education-guides/01b_newborn_nursery_care_guide_vol_ii.docx` | DOCX |
| Feeding & Nutrition 30–35 wk | `content/education-guides/11_feeding_growth_nutrition_30_35wk.docx` | DOCX |
| Level I/II Care Pathway | `content/education-guides/05_level_i_ii_care_pathway.docx` | DOCX |
| Neonatal FEN Textbook | `content/textbooks/neonatal_fen_textbook.docx` | DOCX |
| Endocrine Abnormalities Textbook | `content/textbooks/neonatal_endocrine_abnormalities_textbook.docx` | DOCX |

---

*March 2026 · PubMed-sourced · Hartzog Web Standard v1.0*

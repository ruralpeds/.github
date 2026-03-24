# module_source/

This directory stores **original source documents** that were used to design the clinical content of modules in this project.

## Purpose

Every module in `src/` is built from reference materials — textbooks, clinical guidelines, research reports, and internal documents. Storing these sources here ensures:

1. **Full provenance** — you can always trace why a module's clinical logic was written the way it was
2. **Auditability** — during a medical review, reviewers can compare the module's output against its source
3. **Reproducibility** — if a module needs to be rewritten, the original source is at hand

## How Docs Get Here

Source documents are **automatically copied** into this directory when you use `register_module.sh`:

```bash
# Copy a doc here AND link it to a module in one step:
./scripts/register_module.sh add-source src/protocols/sepsis.rs /path/to/reference.pdf
```

**Do not delete files from this directory.** All documents are tracked in `module_registry.json` and `MODULE_REGISTRY.md`.

## Files in This Directory

See [MODULE_REGISTRY.md](../MODULE_REGISTRY.md) for the full index of documents and which modules they produced.

| File | Used for |
|------|----------|
| `Pediatric_Emergency_Medicine_Rural_ED_Guide.docx` | `src/protocols/sepsis.rs` |
| `Pediatric_Emergency_Medicine_Rural_ED_Guide_Volume_II.docx` | `src/protocols/environmental.rs` |
| `Pediatric_Respiratory_Support_Ventilation_Education_Guide.docx` | `src/respiratory_cds/*` |
| `respiratory_scoring_systems.docx` | `src/protocols/respiratory_scoring.rs` |
| `respiratory_scoring_systems_2.docx` | `src/protocols/respiratory_scoring.rs` |
| `respiratory_scores_ventilation.docx` | `src/protocols/respiratory.rs`, `src/protocols/respiratory_scoring.rs`, `src/respiratory_cds/ventilator.rs` |

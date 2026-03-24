//! ped-neonatal: Mode-aware clinical module.
//!
//! Wraps sci-clinical functions with neonatal/pediatric mode dispatch.
//! Clinical calculations delegate to rust-sci-core; this crate adds
//! mode-specific logic, safety warnings, and WASM-friendly types.
//!
//! TODO: Implement during Phase 3 migration.

pub use ped_core::ClinicalMode;

pub fn placeholder() {}

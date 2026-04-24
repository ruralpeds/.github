# Task 1: DHF Bootstrap for PedNeoSim.jl

**Status**: Phase 6, Week 11 Start  
**Objective**: Establish design history file (DHF) structure for Class C medical device simulator  
**Preflight Confirmation**: false  
**Dependencies**: Phase 5 complete, org-iec62304 ruleset active

---

## What You'll Do

1. **Create DHF Directory Structure**
   - [ ] Create `dhf/` directory with standard subdirectories
   - [ ] Copy template files from `docs/medical-device/IEC_62304_DHF_PATTERN.md`
   - [ ] Create `dhf/README.md` (index with links to all sections)

2. **Write Software Safety Classification**
   - [ ] Create `dhf/classification.md`
   - [ ] Document decision tree: Can cause injury? Serious injury?
   - [ ] Conclude: **Class C** (neonatal ventilator control → death/serious injury possible)
   - [ ] Document implications (§4 testing strategy, mandatory DHF, etc.)

3. **Write Software Safety Plan**
   - [ ] Create `dhf/requirements/SOFTWARE_SAFETY_PLAN.md`
   - [ ] Include: classification, risk strategy, design approach, lifecycle activities, communication plan
   - [ ] Reference ISO 14971 §7 where applicable
   - [ ] Assign reviewers and review dates

4. **Create Requirements Specification**
   - [ ] Create `dhf/requirements/software-requirements.yaml`
   - [ ] Define SW-001–SW-030 (critical + supporting requirements)
   - [ ] Include: title, description, priority, verification method, acceptance criteria
   - [ ] Add traceability matrix at bottom (SW-### → test case IDs)
   - [ ] Example requirements:
     - SW-001: Ventilator simulation (FiO2, PEEP, rate, I:E)
     - SW-002: Weight-based dose calculation
     - SW-010: Input validation (weight, GA, PMA)
     - SW-020: Error logging (no PHI in logs)

5. **Create Hazard Analysis**
   - [ ] Create `dhf/risk/hazard-analysis.yaml`
   - [ ] Identify 5–10 key hazards (use FMEA format)
   - [ ] For each hazard: severity, probability, risk level, detectability
   - [ ] Propose risk controls (RC-###) for each hazard
   - [ ] Document residual risk and acceptance rationale
   - [ ] Example hazards:
     - HZ-001: Incorrect gestational age calculation
     - HZ-003: Dose calculation failure on extreme weight
     - HZ-005: Unit confusion (kg vs lb)

6. **Test the DHF Workflow**
   - [ ] Commit DHF files
   - [ ] Open PR with DHF changes
   - [ ] Verify: rulesets block merge until DHF is current
   - [ ] Verify: any code change requires DHF update
   - [ ] Merge PR

---

## Files to Create

| File | Content |
|------|---------|
| `dhf/README.md` | Index with links to all DHF sections |
| `dhf/classification.md` | Class C classification (PedNeoSim.jl) |
| `dhf/requirements/SOFTWARE_SAFETY_PLAN.md` | Life-cycle strategy + communication |
| `dhf/requirements/software-requirements.yaml` | SW-001–SW-030 requirements + traceability |
| `dhf/risk/hazard-analysis.yaml` | HZ-001–HZ-010 + risk controls + residual risk |

---

## Acceptance Criteria

- ✅ DHF directory structure matches template
- ✅ Classification: Class C with documented rationale
- ✅ Software Safety Plan: ≥1 page, references ISO 14971
- ✅ Requirements: ≥20 SW-### entries with full metadata
- ✅ Hazard analysis: ≥5 hazards with risk controls
- ✅ All residual risks documented + accepted
- ✅ Traceability matrix present (SW-### → test map)
- ✅ Files committed + PR merged

---

## Estimated Effort

- Directory structure: ~15 min
- Classification: ~30 min
- Safety Plan: ~1 hour
- Requirements specification: ~2 hours (20 SW-### entries)
- Hazard analysis: ~1.5 hours (detailed FMEA)
- Review + merge: ~30 min

**Total**: ~5 hours

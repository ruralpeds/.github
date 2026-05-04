# Phase 5E: Container Workload Optimization

**Status:** Implementation  
**Date:** May 4, 2026  
**Duration:** 1 week  
**Expected Savings:** 20-40% reduction in build times, 15-25% storage reduction

---

## Overview

Container workload optimization reduces build times, storage footprint, and resource consumption through:
- Base image optimization (smaller alternatives)
- Multi-stage builds (separate build/runtime)
- Layer caching strategy (optimize for reuse)
- Dependency consolidation (fewer packages)
- Runtime trimming (remove dev tools from production)

## Architecture

```
Existing Dockerfiles
        ↓
Audit & Profile (identify bottlenecks)
        ↓
Optimization Suggestions (automated)
        ↓
Apply Optimizations (manual review)
        ↓
Measure Impact (before/after metrics)
        ↓
Production Deployment & Monitoring
```

## Optimization Strategies

### 1. Base Image Optimization

**Current State**: Most images based on `ubuntu:20.04` (1.8GB) or `node:16` (950MB)

**Optimizations**:

| Current | Optimized | Savings | Tradeoff |
|---------|-----------|---------|----------|
| `ubuntu:20.04` | `debian:bullseye-slim` | 60% | Missing some tools |
| `node:16` | `node:16-alpine` | 75% | Limited package availability |
| `python:3.9` | `python:3.9-slim` | 50% | Some C extensions need rebuilding |
| `golang:1.18` | `golang:1.18-alpine` | 65% | Minimal system libraries |

**Implementation**:
```dockerfile
# Before: 950MB
FROM node:16
RUN apt-get update && apt-get install -y curl wget git

# After: 250MB
FROM node:16-alpine
RUN apk add --no-cache curl wget
```

### 2. Multi-Stage Builds

**Current State**: Single-stage builds include all build tools in final image

**Optimization**:
```dockerfile
# Build stage: includes all build tools, dependencies
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm run build

# Runtime stage: only runtime files needed
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

**Expected Savings**:
- Build tools excluded from final image
- 40-60% size reduction
- No runtime performance impact

### 3. Layer Caching Optimization

**Current Problem**:
```dockerfile
FROM node:16
COPY . .                  # Copies all files (invalidates cache on any change)
RUN npm install          # Re-runs on every change
RUN npm run build
```

**Optimized**:
```dockerfile
FROM node:16
COPY package*.json ./
RUN npm ci                # Cached until dependencies change
COPY . .                  # Cache-buster only on source changes
RUN npm run build
```

**Benefits**:
- Most builds cache-hit on dependencies
- Build time: 5 min → 30 sec (with cache hit)
- Saves ~$20/month per repo in build costs

### 4. Dependency Consolidation

**Strategy**:
- Remove unused system packages
- Combine RUN commands to reduce layers
- Use Alpine package manager efficiently

**Example**:
```dockerfile
# Before: Multiple RUN commands, separate cache layers
FROM node:16
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y build-essential

# After: Single RUN, clean up apt cache
FROM node:16-alpine
RUN apk add --no-cache curl git build-base && \
    rm -rf /var/cache/apk/*
```

### 5. Multi-Architecture Builds

**Objective**: Support both x86_64 and ARM64

**Implementation**:
```dockerfile
# Use buildx for multi-platform
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --push \
  -t myrepo/app:latest .
```

**Benefits**:
- Single image works on different architectures
- Better performance on ARM runners
- Future-proofs infrastructure

## Implementation Components

### 1. Container Audit Script (`container-auditor.py`)

```python
class ContainerAuditor:
    def audit_dockerfiles(self) -> Dict[str, AuditResult]:
        """Scan all Dockerfiles and assess optimization opportunity"""
        results = {}
        for dockerfile in find_dockerfiles():
            result = self._audit_file(dockerfile)
            results[dockerfile] = result
        return results
    
    def _audit_file(self, dockerfile) -> AuditResult:
        """Analyze single Dockerfile for:
        - Base image size
        - Multi-stage build usage
        - Layer caching opportunities
        - Unused dependencies
        """
        pass
```

**Output**: `container-audit-report.json`
```json
{
  "total_dockerfiles": 45,
  "with_optimization_opportunities": 38,
  "potential_size_reduction_mb": 8500,
  "potential_build_time_reduction_percent": 45,
  "dockerfiles": [
    {
      "path": "apps/gap-dashboard/Dockerfile",
      "base_image": "node:16",
      "size_mb": 950,
      "issues": [
        {"type": "non-slim-base-image", "savings_mb": 700},
        {"type": "missing-multi-stage", "savings_mb": 200},
        {"type": "layer-cache-miss", "impact": "high"}
      ],
      "recommendations": [
        "Use node:16-alpine (75% smaller)",
        "Implement multi-stage build",
        "Reorder COPY/RUN for cache efficiency"
      ]
    }
  ]
}
```

### 2. Optimization Suggester (`container-optimizer.py`)

```python
class ContainerOptimizer:
    def suggest_optimizations(self, dockerfile_path: str) -> List[Suggestion]:
        """Generate specific optimization recommendations"""
        suggestions = []
        
        # Parse Dockerfile
        dockerfile = DockerfileParser(dockerfile_path)
        
        # Check each audit finding
        if uses_non_slim_base(dockerfile):
            suggestions.append(Suggestion(
                type="base_image",
                current=dockerfile.base_image,
                suggested=f"{dockerfile.base_image}-slim",
                savings="50%",
                risk="low"
            ))
        
        if not uses_multi_stage(dockerfile):
            suggestions.append(Suggestion(
                type="multi_stage",
                savings="40-60%",
                risk="medium"
            ))
        
        return suggestions
    
    def generate_optimized_dockerfile(self, original: str) -> str:
        """Generate optimized Dockerfile from original"""
        pass
```

### 3. Build Comparison Script (`compare-builds.py`)

**Measure before/after**:
```python
class BuildComparison:
    def compare(self, original_dockerfile: str, optimized_dockerfile: str):
        """Build both and compare metrics"""
        original_result = docker_build(original_dockerfile)
        optimized_result = docker_build(optimized_dockerfile)
        
        comparison = {
            "original": {
                "image_size_mb": original_result.size_mb,
                "build_time_seconds": original_result.build_time,
                "layer_count": len(original_result.layers)
            },
            "optimized": {
                "image_size_mb": optimized_result.size_mb,
                "build_time_seconds": optimized_result.build_time,
                "layer_count": len(optimized_result.layers)
            },
            "improvement": {
                "size_reduction_percent": ((original_result.size_mb - optimized_result.size_mb) / original_result.size_mb) * 100,
                "build_time_reduction_percent": ((original_result.build_time - optimized_result.build_time) / original_result.build_time) * 100,
                "estimated_monthly_savings": calculate_cost_savings(...)
            }
        }
        return comparison
```

### 4. Optimization Workflow (prototype retired during GAP-002 cleanup)

```yaml
name: Container Optimization Pipeline

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly
  workflow_dispatch:
    inputs:
      app:
        description: 'Specific app to optimize (or all)'
        required: false

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Audit all Dockerfiles
        run: |
          python3 scripts/container-auditor.py \
            --output-file audit-log/container-audit.json

  suggest:
    runs-on: ubuntu-latest
    needs: audit
    steps:
      - uses: actions/checkout@v4
      - name: Generate optimization suggestions
        run: |
          python3 scripts/container-optimizer.py \
            --audit-file audit-log/container-audit.json \
            --output-file audit-log/optimization-suggestions.json

  compare:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [gap-dashboard, gap-notifications, audit-log-processor]
    steps:
      - uses: actions/checkout@v4
      - name: Compare builds for ${{ matrix.app }}
        run: |
          python3 scripts/compare-builds.py \
            --original apps/${{ matrix.app }}/Dockerfile \
            --optimized apps/${{ matrix.app }}/Dockerfile.optimized \
            --output audit-log/build-comparison-${{ matrix.app }}.json

  report:
    runs-on: ubuntu-latest
    needs: [audit, suggest, compare]
    steps:
      - name: Generate optimization report
        run: |
          python3 scripts/generate-optimization-report.py \
            --output docs/container-optimization-report.md

  create-pr:
    runs-on: ubuntu-latest
    needs: report
    if: success()
    steps:
      - uses: actions/checkout@v4
      - name: Create optimization PR
        run: |
          # Create branch with optimized Dockerfiles
          # Create PR with before/after metrics
          # Auto-assign to team for review
```

### 5. Base Image Configuration

**File**: `config/container-base-images.json`

```json
{
  "node": {
    "current": "node:16",
    "recommended": "node:16-alpine",
    "size_reduction_percent": 75,
    "risk_level": "low"
  },
  "python": {
    "current": "python:3.9",
    "recommended": "python:3.9-slim",
    "size_reduction_percent": 50,
    "risk_level": "low"
  },
  "ubuntu": {
    "current": "ubuntu:20.04",
    "recommended": "debian:bullseye-slim",
    "size_reduction_percent": 60,
    "risk_level": "medium"
  }
}
```

## Optimization Checklist

### Per-Dockerfile
- [ ] Identify non-slim/minimal base image → upgrade
- [ ] Implement multi-stage build (if not present)
- [ ] Optimize layer caching (COPY/RUN ordering)
- [ ] Remove unused packages from RUN commands
- [ ] Combine RUN commands to reduce layers
- [ ] Test optimized image locally
- [ ] Measure size and build time reduction
- [ ] Verify all tests pass
- [ ] Update in VCS
- [ ] Deploy and monitor

### Project-Wide
- [ ] Audit all 45 Dockerfiles
- [ ] Generate suggestions for each
- [ ] Prioritize by savings (size reduction %)
- [ ] Review with team (risk assessment)
- [ ] Apply optimizations with PRs
- [ ] Measure aggregate savings
- [ ] Update base image policy
- [ ] Document best practices

## Success Metrics

### Performance
- [ ] Average image size reduced 30-40%
- [ ] Build time reduced 25-35% (with cache hits)
- [ ] Layer count reduced (fewer layers = faster push/pull)

### Cost Impact
- [ ] Docker Hub storage reduced from 500GB → 350GB
- [ ] Build minutes reduced: 5,000 → 3,500/month
- [ ] Estimated savings: $200-300/month

### Reliability
- [ ] All tests pass with optimized images
- [ ] No runtime performance degradation
- [ ] Cold start times improved (smaller = faster pulls)

### Operational
- [ ] Base image upgrade policy documented
- [ ] Multi-stage pattern standardized
- [ ] CI/CD layer caching implemented
- [ ] Regular audit schedule (quarterly)

## Risk Mitigation

### Testing Strategy
1. Build optimized image locally
2. Run full test suite
3. Compare test results with original
4. Deploy to staging environment
5. Monitor for 24 hours
6. Deploy to production

### Rollback Plan
- Keep original Dockerfiles in separate branch
- Pin original image tags (v1.0)
- Can immediately roll back by rebuilding with original Dockerfile

### Known Risks
- Alpine Linux has fewer packages (missing some dev tools)
- Some C extensions need rebuilding with Alpine
- GLibC vs musl differences (rare compatibility issues)

## Timeline

### Phase 5E Week 1
- Day 1: Run container audit on all 45 Dockerfiles
- Day 2-3: Generate optimization suggestions
- Day 4-5: Measure improvement for top 10 apps
- Day 6-7: Create optimization PRs

## Optimization Examples

### Example 1: Node.js App

**Before** (950MB):
```dockerfile
FROM node:16
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

**After** (220MB, 77% smaller):
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Example 2: Python App

**Before** (1.2GB):
```dockerfile
FROM python:3.9
RUN apt-get update && apt-get install -y build-essential git curl
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

**After** (400MB, 67% smaller):
```dockerfile
FROM python:3.9-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

## Continuous Optimization

**Quarterly Review**:
- Run audit on all Dockerfiles
- Check for new base image updates
- Measure aggregate metrics
- Update standards based on findings

**New Projects**:
- Use optimized base images by default
- Start with multi-stage template
- Document optimization rationale

---

**Next Phase:** Integration with Phase 5A (Kubernetes) for end-to-end optimization

# Phase 14: Implementation Planning & Technical Architecture

**Status:** 🏗️ IMPLEMENTATION ROADMAP  
**Objective:** Translate strategic phases into executable technical specifications  
**Scope:** Technology stack, system architecture, infrastructure, APIs, databases, deployment pipelines  
**Timeline:** Concurrent with Phase 9-13 execution (starting Q3 2026)

---

## Part 1: Technology Stack & Platform Decisions

### 1.1 Backend Services Stack

**Core API Server:**
```
Language: Python 3.11+
Framework: FastAPI (async-first, auto-docs, dependency injection)
Rationale:
  - Fast native performance (near-Go speeds)
  - Built-in OpenAPI/Swagger auto-generation
  - Dependency injection for testability
  - Strong async/await for I/O-bound medical data processing
  - Rich ecosystem of medical/scientific libraries (numpy, scipy, scikit-learn, pandas)
  - FDA-acceptable for SaMD (software as medical device)

ASGI Server: Uvicorn (production-grade async server)
Concurrency: 500+ concurrent requests per instance
```

**ML/Predictive Services Stack:**
```
Language: Python 3.11
Frameworks: 
  - scikit-learn (XGBoost, Random Forest, Logistic Regression)
  - TensorFlow/Keras (LSTM, neural networks)
  - PyTorch (future ensemble models)

Model Training:
  - Apache Airflow (DAG-based ML pipeline orchestration)
  - MLflow (model versioning, experiment tracking, model registry)
  - DVC (data versioning for reproducible ML)

Rationale:
  - Scikit-learn: Industry standard, deterministic, auditable
  - TensorFlow: Production ML with TFServing for inference
  - Airflow: FDA-compliant ML pipeline with audit trails
  - MLflow: Model governance, version control, reproducibility (regulatory requirement)
```

**Data Processing Stack:**
```
Language: Python
Message Queue: Apache Kafka (high-throughput event streaming)
  - Real-time vital data ingestion: 100K+ events/sec
  - Event retention: 30 days (for model training)
  - Partitioning: By hospital_id, then by tenant_id
  - Replication factor: 3 (availability)

Stream Processing: Kafka Streams / Apache Flink
  - Real-time alert threshold evaluation
  - Time-windowed aggregations (5-min rolling averages)
  - Stateful processing for multi-event rules

Batch Processing: Apache Spark
  - Nightly cohort discovery (patients matching criteria)
  - Outcome data aggregation (mortality, readmission)
  - ML model feature engineering
```

**Authentication & Authorization:**
```
Token Framework: OAuth 2.0 + OpenID Connect
Provider: Keycloak (open-source, HIPAA-eligible)
- JWT tokens with RS256 signing (public key verification)
- Refresh token rotation (30-day max lifetime)
- Multi-factor authentication (TOTP, WebAuthn for clinicians)
- Role-based access control (RBAC) + attribute-based (ABAC)
- Audit log of all auth events (regulatory requirement)

Rationale:
  - Standard OAuth2/OIDC for mobile app integration
  - Keycloak: Open-source, self-hosted (data stays on-prem)
  - JWT: Stateless, scalable across distributed systems
  - MFA: Clinical user security requirement
```

### 1.2 Frontend Stack

**Web Application:**
```
Framework: React 18 (JavaScript)
Build Tool: Vite (sub-second HMR)
State Management: TanStack Query v4 (server-state) + Zustand (client-state)
UI Component Library: shadcn/ui (Radix UI + Tailwind CSS)
TypeScript: Full type safety, interfaces for FHIR resources

Rationale:
  - React: Industry standard, large ecosystem, FDA-acceptable
  - TanStack Query: Handles complex server-state (observations, alerts, outcomes)
  - Zustand: Lightweight, simple, predictable state management
  - shadcn/ui: Accessible, customizable, healthcare-grade components
  - TypeScript: Prevents entire categories of bugs (type safety)
  - Vite: Fast development cycle, optimized production builds

Pages:
  - Dashboard: Real-time alert view (P1/P2/P3 by severity)
  - Patient Overview: Demographics, current observations, alert history, interventions
  - Alert Details: Full context, recommended actions, outcome tracking
  - Analytics: Institution-wide metrics, trending, cohort discovery
  - Admin: Hospital configuration, user management, billing, integrations
```

**Mobile Applications:**

iOS:
```
Language: Swift
Framework: SwiftUI (declarative, native)
Minimum: iOS 14+
Key Libraries:
  - Combine: Reactive programming, @Published observables
  - Foundation: Network, KeyChain, LocalAuthentication
  - CoreData: Local persistence with change tracking
  - UserNotifications: Push notification handling

Architecture: MVVM (Model-View-ViewModel)
- Viewable for UI updates
- EnvironmentObject for dependency injection
- @FetchRequest for CoreData queries

State Management:
  - @StateObject for ViewModel lifecycle
  - @Published for reactive updates
  - Combine publishers for async operations
```

Android:
```
Language: Kotlin
Framework: Jetpack Compose (declarative UI)
Minimum: Android 11 (API 30)
Key Libraries:
  - Hilt: Dependency injection
  - Room: Local SQLite persistence
  - DataStore: Key-value persistent storage
  - WorkManager: Background task scheduling

Architecture: MVVM with Compose
- ViewModel for state management
- Repository pattern for data access
- Flow<> for reactive streams
- LaunchedEffect for side effects

Firebase:
  - Cloud Messaging (FCM) for push notifications
  - Crashlytics for error tracking
```

### 1.3 Database Stack

**Primary Data Store: PostgreSQL 15+**
```
Multi-tenant design:
  - Tenant table with encryption_key_id, region, subscription_tier
  - All tables include tenant_id foreign key
  - Row-level security (RLS) policies on all tables
  - Composite indexes on (tenant_id, resource_id)

High Availability:
  - Multi-AZ deployment (3 replicas minimum)
  - Synchronous replication (durability > speed)
  - Automated failover (RTO < 5 minutes)
  - Backup: Continuous WAL archiving + daily snapshots

Performance:
  - Connection pooling: pgBouncer (500+ concurrent)
  - Read replicas for analytics queries
  - Partitioning by time for large tables (observations, alerts)
  - Vacuum automation, index bloat monitoring

Schema Highlights:
  - Observations: (tenant_id, patient_id, observation_time, value)
  - Alerts: (tenant_id, alert_id, patient_id, severity, created_at, acknowledged_at)
  - Interventions: (tenant_id, alert_id, intervention_type, timestamp, user_id)
```

**Cache Layer: Redis 7+**
```
Purpose: Session store, real-time metrics, rate limiting
Architecture:
  - Redis Cluster (6+ nodes) for HA and sharding
  - Replication: 3 replicas minimum (3-way redundancy)
  - Persistence: RDB snapshots + AOF (append-only file)
  - Eviction: LRU with 64GB heap

Use Cases:
  - Session tokens (short-lived, encrypted)
  - Real-time alert counters (P1/P2/P3 active alerts)
  - Rate limiting per API key (100 req/sec default)
  - Leaderboards (top deteriorating patients)
```

**Document Store: MongoDB (Optional, for unstructured data)**
```
Purpose: Clinical notes, imaging metadata, EHR integration logs
Architecture:
  - Replica set (3+ members) with automatic failover
  - Sharding by hospital_id for multi-tenant isolation
  - TTL indexes for auto-deleting old logs (30 days)
  - Encryption at rest (default for cloud)

Rationale:
  - Flexible schema for varying EHR data formats
  - Good for medical imaging metadata (DICOM info)
  - Full-text search on clinical notes
  - But: PostgreSQL JSON sufficient for most use cases
```

**Time-Series Data: InfluxDB or TimescaleDB**
```
Purpose: High-frequency vital signs, model metrics
Option A - TimescaleDB (PostgreSQL extension):
  - Runs in PostgreSQL (single unified database)
  - Hypertables with automatic partitioning
  - Native SQL queries
  - Better for <100K metrics/sec

Option B - InfluxDB:
  - Specialized time-series (millions of metrics/sec)
  - Separate cluster (operational complexity)
  - Good for model inference latency tracking

Choice: TimescaleDB for simplicity, single database
Compression: Automatic columnar compression (80%+ reduction)
Retention: 90-day raw + 1-year aggregated
```

### 1.4 Infrastructure & Deployment

**Cloud Provider: AWS (multi-region capability)**

Regions:
```
Primary: us-east-1 (US hospitals)
Backup: us-west-2 (geographic diversity)
International: eu-west-1 (EU/UK), ap-southeast-1 (Australia), ap-northeast-1 (Japan)
China: cn-north-1 (mainland China, future)

Data Residency:
  - GDPR: All EU data stays in eu-west-1
  - HIPAA: US data can be us-east or us-west
  - CCPA: California data stays in us-west
  - PIPL: China data stays in cn-north (future)
```

**Compute: Kubernetes (EKS)**
```
Cluster Configuration:
  - Node groups: On-demand + spot mix (cost optimization)
  - Min nodes: 5 (HA), Max: 200 (auto-scaling)
  - Node types: m6i.2xlarge (8 CPU, 32 GB RAM) - general workload
  - GPU nodes: g4dn.xlarge (1 GPU) for ML inference

Namespaces:
  - kube-system: Kubernetes system
  - production: Core API services
  - ml: ML model serving (TFServing, Seldon)
  - monitoring: Prometheus, Grafana
  - logging: Elasticsearch, Kibana
  - etl: Spark, Airflow jobs

Pod Security:
  - Pod Security Policy: restricted
  - Network policies: Default deny, explicit allow
  - Resource limits: CPU 2000m, Memory 4Gi per pod
  - Readiness/liveness probes (critical for healthcare)
  - Health check timeouts: 30s (fast recovery)
```

**Database: AWS RDS PostgreSQL**
```
Instance Class: db.r6i.2xlarge (8 vCPU, 64 GB RAM)
Storage: gp3, 1TB base (auto-scale to 10TB)
Multi-AZ: Yes (synchronous replication)
Backup:
  - Automated backups: 35 days retention
  - Manual snapshots: Kept indefinitely
  - Cross-region backup: Replicated to backup region

Performance Insights: Enabled (understand bottlenecks)
Enhanced Monitoring: 1-second granularity
Parameter Group: Tuned for OLTP (20K connections)
```

**Cache: AWS ElastiCache Redis**
```
Cluster Mode: Enabled (16 shards, 3 replicas each)
Node Type: cache.r6g.xlarge (26.5 GB per node)
Auto Failover: Yes
Backup: Automated snapshots daily
Encryption: At-rest (KMS) + in-transit (TLS)
```

**Load Balancing: AWS ALB (Application Load Balancer)**
```
Target Groups:
  - API servers: 8 instances (Health check: /health, 30s timeout)
  - WebSocket servers: 4 instances (sticky sessions)
  - Mobile backend: 6 instances (geolocation routing)

Security:
  - TLS 1.2+ termination at LB
  - WAF (Web Application Firewall) rules:
    - Rate limiting: 1000 req/min per IP
    - SQL injection patterns
    - XSS patterns
    - Geographic restrictions (optional)
```

**Storage: AWS S3**
```
Buckets:
  - Patient files (images, docs): Encrypted, versioning enabled
  - Model artifacts: Versioned, immutable (content hash in name)
  - Audit logs: WORM (write-once, read-many) via object lock
  - Backups: Lifecycle policies (30 days hot, then Glacier)

Access:
  - IAM roles per service (no hardcoded credentials)
  - Bucket policies: Deny unencrypted uploads
  - VPC endpoints: Private connectivity (no internet)
```

**Networking: VPC with Private/Public Subnets**
```
Architecture:
  - Public subnets: ALB only (NAT gateways)
  - Private subnets: EKS nodes (RDS, ElastiCache)
  - Database subnets: RDS only (no internet access)

Security Groups:
  - ALB: Allow 443 (HTTPS) from 0.0.0.0/0
  - EKS nodes: Allow 6379 (Redis), 5432 (PostgreSQL)
  - RDS: Allow 5432 only from EKS nodes
  - Redis: Allow 6379 only from EKS nodes, RDS

VPC Flow Logs: Enabled (detect anomalies)
GuardDuty: AWS threat detection service enabled
```

**Monitoring & Logging: AWS Native Services**
```
Metrics: CloudWatch
  - Custom metrics: API latency, alert delivery time, ML inference time
  - Dashboards: Service health, resource utilization, business metrics
  - Alarms: PagerDuty integration for on-call

Logs: CloudWatch Logs
  - Application logs: JSON structured (timestamp, severity, user_id, tenant_id)
  - Database logs: Slow query log (>100ms), connection logs
  - API access logs: All requests (audit trail requirement)
  - Retention: 30 days hot, 1 year archived to S3

X-Ray: Distributed tracing
  - Trace all requests end-to-end
  - Identify bottlenecks in microservices
  - Visual service map
```

---

## Part 2: System Architecture & APIs

### 2.1 Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (ALB + WAF)                      │
│            Authentication, Rate Limiting, Logging               │
└────────┬──────────────┬────────────┬────────────┬───────────────┘
         │              │            │            │
     ┌───▼─────┐   ┌────▼────┐  ┌───▼──────┐  ┌──▼────────┐
     │  Core   │   │   ML    │  │  Mobile  │  │  EHR      │
     │  Alert  │   │Inference│  │ Sync API │  │Integration│
     │  Service│   │ Service │  │          │  │ Service   │
     └───┬─────┘   └────┬────┘  └───┬──────┘  └──┬────────┘
         │              │            │           │
     ┌───▼──────────────▼────────────▼───────────▼────┐
     │         PostgreSQL (Primary Data Store)        │
     │         Redis Cache | TimescaleDB (Metrics)    │
     │         Kafka (Event Stream)                   │
     └────────────────────────────────────────────────┘
```

**Service 1: Core Alert Service**
```
Responsibilities:
  - Ingest vital signs (Kafka stream)
  - Evaluate alert rules (custom rules + baseline)
  - Trigger notifications (push, email, SMS)
  - Record alert outcomes (physician response)

Endpoints:
  - POST /api/v1/observations (accept vital data)
  - GET /api/v1/alerts (list active alerts)
  - POST /api/v1/alerts/{alert_id}/acknowledge
  - POST /api/v1/alerts/{alert_id}/interventions
  - GET /api/v1/patients/{patient_id}/timeline

Database:
  - observations (time-partitioned table)
  - alerts (indexed by tenant, patient, severity)
  - alert_rules (custom rules per hospital)

Scaling:
  - Horizontal: 8-16 pod replicas (CPU-based scaling)
  - Load balancing: Round-robin by hospital_id (affinity)
```

**Service 2: ML Inference Service**
```
Responsibilities:
  - Run predictive models (7-day deterioration, mortality)
  - Return risk scores + confidence intervals
  - Log predictions for continuous learning
  - Serve ML artifacts from MLflow registry

Endpoints:
  - POST /api/v1/predictions/deterioration (patient features)
  - POST /api/v1/predictions/mortality (patient features)
  - GET /api/v1/models (list deployed models)
  - GET /api/v1/models/{model_id}/metrics

Infrastructure:
  - GPU nodes (g4dn.xlarge) for TensorFlow inference
  - TFServing for model deployment
  - Model versioning via MLflow
  - A/B testing framework (canary deployments)

Latency SLA: <100ms (p99)
Throughput: 1000+ predictions/sec
```

**Service 3: Mobile Sync Service**
```
Responsibilities:
  - Sync offline data to cloud
  - Send push notifications to devices
  - Handle device registration
  - Serve mobile-optimized payloads

Endpoints:
  - POST /api/mobile/v1/sync (bi-directional sync)
  - POST /api/mobile/v1/devices/register (APNs, FCM tokens)
  - GET /api/mobile/v1/alerts (mobile-optimized)
  - POST /api/mobile/v1/interventions (offline-first)

Features:
  - Delta sync (only changed data since last sync)
  - Conflict resolution (last-write-wins by default)
  - Push notification formatting (rich notifications)
  - Device battery optimization (batched syncs)
```

**Service 4: EHR Integration Service**
```
Responsibilities:
  - Manage EHR adapter lifecycle
  - Transform data to/from FHIR
  - Handle EHR authentication (OAuth2)
  - Log all EHR transactions

Adapters:
  - Epic FHIR API client
  - Cerner FHIR + Task API client
  - Medidata integration client
  - HL7v2 parser (legacy systems)

Endpoints:
  - POST /api/v1/ehr-adapters/sync (push data to EHR)
  - GET /api/v1/ehr-adapters/{adapter_id}/status
  - POST /api/v1/ehr-adapters/{adapter_id}/test (health check)

Compliance:
  - Audit log every EHR transaction
  - Encryption in transit (TLS 1.2+)
  - Credential rotation (90-day interval)
```

**Supporting Services:**

```
Auth Service (Keycloak):
  - User authentication (OAuth2/OIDC)
  - Token issuance and validation
  - MFA management
  - Audit logging

Notification Service:
  - Push notifications (APNs, FCM)
  - Email (SendGrid)
  - SMS (Twilio)
  - Escalation rules

Analytics Service:
  - Aggregate usage metrics
  - Generate reports
  - Cohort discovery queries
  - Outcome analysis

Billing Service:
  - Meter usage (patients, users, alerts)
  - Generate invoices
  - Manage subscriptions
  - Usage alerts

Job Scheduler (Airflow):
  - Nightly model retraining
  - Data aggregations
  - Report generation
  - Maintenance tasks
```

### 2.2 API Specifications (OpenAPI 3.1)

**Core Alert API:**

```yaml
openapi: 3.1.0
info:
  title: Alert Management API
  version: 1.0.0
servers:
  - url: https://api.platform.local/api/v1

paths:
  /observations:
    post:
      summary: Ingest vital sign observation
      operationId: createObservation
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Observation'
      responses:
        '201':
          description: Observation recorded
        '400':
          description: Invalid observation
        '401':
          description: Unauthorized
      security:
        - bearerAuth: []

  /alerts:
    get:
      summary: List active alerts
      operationId: listAlerts
      parameters:
        - name: severity
          in: query
          schema:
            enum: [P1, P2, P3]
        - name: patient_id
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Alert list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Alert'
      security:
        - bearerAuth: []

  /alerts/{alert_id}/acknowledge:
    post:
      summary: Acknowledge alert
      operationId: acknowledgeAlert
      parameters:
        - name: alert_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                acknowledged_by:
                  type: string (user_id)
      responses:
        '200':
          description: Alert acknowledged
      security:
        - bearerAuth: []

components:
  schemas:
    Observation:
      type: object
      required:
        - patient_id
        - observation_type
        - value
        - timestamp
      properties:
        patient_id:
          type: string
        observation_type:
          enum: [heart_rate, blood_pressure, temperature, glucose, oxygen_saturation]
        value:
          type: number
        unit:
          type: string
        timestamp:
          type: string
          format: date-time
    
    Alert:
      type: object
      properties:
        alert_id:
          type: string
        patient_id:
          type: string
        severity:
          enum: [P1, P2, P3]
        reason:
          type: string
        created_at:
          type: string
          format: date-time
        acknowledged_at:
          type: string
          format: date-time
          nullable: true
```

---

## Part 3: Database Schema (Multi-Tenant)

### 3.1 Core Tables

```sql
-- Tenant Management
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50) NOT NULL,
    subscription_tier ENUM('basic', 'professional', 'enterprise'),
    max_patients INTEGER,
    max_users INTEGER,
    features JSONB, -- Feature flags per tenant
    encryption_key_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, region)
);

-- Users (Clinicians, Admins)
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('clinician', 'admin', 'nurse', 'pharmacist'),
    mfa_enabled BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Patients (Multi-tenant)
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    mrn VARCHAR(100) NOT NULL, -- Medical Record Number
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('M', 'F', 'O', 'U'),
    allergies JSONB,
    comorbidities JSONB,
    current_medications JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, mrn),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_patients_mrn ON patients(tenant_id, mrn);

-- Observations (Time-series, partitioned by month)
CREATE TABLE observations (
    observation_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    observation_type VARCHAR(100) NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50),
    source_device VARCHAR(100), -- Device ID for traceability
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
) PARTITION BY RANGE (DATE_TRUNC('month', timestamp));

-- Partition creation automation
CREATE TABLE observations_2026_04 PARTITION OF observations
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE INDEX idx_observations_tenant_timestamp 
    ON observations(tenant_id, timestamp DESC);
CREATE INDEX idx_observations_patient_timestamp 
    ON observations(patient_id, timestamp DESC);

-- Alert Rules (Custom per hospital)
CREATE TABLE alert_rules (
    rule_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    name VARCHAR(255) NOT NULL,
    observation_type VARCHAR(100) NOT NULL,
    operator ENUM('>', '<', '=', '>=', '<=', 'between'),
    threshold NUMERIC(10,2),
    severity ENUM('P1', 'P2', 'P3'),
    enabled BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);
CREATE INDEX idx_alert_rules_tenant ON alert_rules(tenant_id);

-- Alerts (Primary events)
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    observation_id UUID REFERENCES observations(observation_id),
    alert_type VARCHAR(100) NOT NULL,
    severity ENUM('P1', 'P2', 'P3') NOT NULL,
    reason TEXT,
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(user_id),
    escalated_at TIMESTAMP,
    escalated_to UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);
CREATE INDEX idx_alerts_tenant_created ON alerts(tenant_id, created_at DESC);
CREATE INDEX idx_alerts_patient ON alerts(patient_id);
CREATE INDEX idx_alerts_severity ON alerts(tenant_id, severity);

-- Interventions (Clinical actions)
CREATE TABLE interventions (
    intervention_id UUID PRIMARY KEY,
    alert_id UUID NOT NULL REFERENCES alerts(alert_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    intervention_type VARCHAR(100), -- 'assessment', 'medication', 'monitoring', 'transfer'
    description TEXT,
    performed_by UUID NOT NULL REFERENCES users(user_id),
    performed_at TIMESTAMP NOT NULL,
    outcome VARCHAR(100), -- 'prevented', 'treated', 'monitored'
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
);
CREATE INDEX idx_interventions_alert ON interventions(alert_id);
CREATE INDEX idx_interventions_tenant ON interventions(tenant_id);

-- Prediction Results (ML model outputs)
CREATE TABLE predictions (
    prediction_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    patient_id UUID NOT NULL REFERENCES patients(patient_id),
    model_id VARCHAR(100) NOT NULL, -- e.g., 'deterioration_v2.1'
    model_version VARCHAR(50),
    prediction_type VARCHAR(100), -- 'deterioration', 'mortality', 'readmission'
    risk_score NUMERIC(5,2), -- 0-100
    confidence NUMERIC(5,2), -- 0-100
    top_factors JSONB, -- [{factor: 'heart_rate', contribution: 0.35}, ...]
    recommended_actions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);
CREATE INDEX idx_predictions_patient_created ON predictions(patient_id, created_at DESC);

-- Row-Level Security Policies
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY observations_tenant_isolation ON observations
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY alerts_tenant_isolation ON alerts
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## Part 4: Deployment & CI/CD Pipeline

### 4.1 Container Deployment Strategy

**Containerization:**
```dockerfile
# Dockerfile.api (multi-stage build)
FROM python:3.11-slim as builder
RUN apt-get update && apt-get install -y build-essential
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim as runtime
COPY --from=builder /root/.local /root/.local
WORKDIR /app
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Security: Run as non-root
RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Image Registry: AWS ECR (Elastic Container Registry)**
```
Repositories:
  - alert-service:latest, alert-service:v1.2.3
  - ml-service:latest, ml-service:v1.0.0
  - mobile-sync:latest, mobile-sync:v1.1.0

Scanning:
  - Amazon ECR image scan (vulnerabilities)
  - Block deployment of images with HIGH/CRITICAL CVE
  - Daily security scanning of all tags

Lifecycle Policies:
  - Keep last 10 tagged images
  - Delete untagged images after 7 days
```

### 4.2 GitOps & Continuous Deployment

**Source Control: GitHub (monorepo structure)**
```
.github/
├── workflows/
│   ├── build.yml (test, build, push image)
│   ├── deploy-staging.yml (deploy to staging cluster)
│   ├── deploy-prod.yml (manual approval before prod)
│   ├── security-scan.yml (SAST/dependency checks)
│   └── integration-tests.yml (post-deployment tests)

services/
├── alert-service/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── ml-service/
├── mobile-sync/
└── ehr-integration/

terraform/
├── main.tf (EKS cluster, RDS, ElastiCache)
├── vpc.tf (networking)
├── kms.tf (encryption keys)
├── variables.tf
└── environments/ (dev, staging, prod)

helm/
├── alert-service/
│   ├── Chart.yaml
│   ├── values.yaml (default)
│   ├── values-prod.yaml (production overrides)
│   └── templates/ (deployment, service, configmap)
└── ...
```

**CI/CD Pipeline (GitHub Actions)**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'services/alert-service/**'
      - 'helm/alert-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd services/alert-service
          pip install -r requirements.txt
      
      - name: Run unit tests
        run: |
          cd services/alert-service
          pytest tests/ --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Bandit (SAST)
        run: |
          cd services/alert-service
          pip install bandit
          bandit -r src/ -f json -o bandit-report.json
      
      - name: Safety (Dependency check)
        run: |
          cd services/alert-service
          pip install safety
          safety check --json > safety-report.json

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    outputs:
      image-uri: ${{ steps.image.outputs.uri }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | \
          docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
      
      - name: Build and push image
        id: image
        run: |
          IMAGE_URI="${{ secrets.ECR_REGISTRY }}/alert-service:${{ github.sha }}"
          docker build -t $IMAGE_URI services/alert-service/
          docker push $IMAGE_URI
          echo "uri=$IMAGE_URI" >> $GITHUB_OUTPUT
      
      - name: Scan image
        run: |
          aws ecr start-image-scan \
            --repository-name alert-service \
            --image-id imageTag=${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - uses: azure/setup-kubectl@v3
        with:
          version: v1.27.0
      
      - name: Configure kubeconfig
        run: |
          aws eks update-kubeconfig \
            --name platform-staging \
            --region us-east-1
      
      - name: Deploy via Helm
        run: |
          helm upgrade --install alert-service \
            helm/alert-service/ \
            --namespace production \
            --values helm/alert-service/values.yaml \
            --values helm/alert-service/values-staging.yaml \
            --set image.tag=${{ github.sha }}
      
      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/alert-service \
            -n production --timeout=5m

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Run integration tests
        env:
          API_ENDPOINT: https://staging-api.platform.local
        run: |
          pip install pytest requests
          pytest tests/integration/ -v

  deploy-prod:
    needs: [build, integration-tests]
    runs-on: ubuntu-latest
    environment: production # Requires manual approval
    steps:
      - uses: actions/checkout@v3
      
      - uses: azure/setup-kubectl@v3
      
      - name: Configure kubeconfig
        run: |
          aws eks update-kubeconfig \
            --name platform-prod \
            --region us-east-1
      
      - name: Deploy to production
        run: |
          helm upgrade --install alert-service \
            helm/alert-service/ \
            --namespace production \
            --values helm/alert-service/values.yaml \
            --values helm/alert-service/values-prod.yaml \
            --set image.tag=${{ github.sha }}
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/alert-service \
            -n production --timeout=10m
      
      - name: Smoke tests
        env:
          API_ENDPOINT: https://api.platform.local
        run: |
          curl -H "Authorization: Bearer ${{ secrets.TEST_TOKEN }}" \
            $API_ENDPOINT/health
```

**GitOps with ArgoCD (future):**
```yaml
# argoproj/argocd application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: alert-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/platform/infrastructure
    targetRevision: main
    path: helm/alert-service
    helm:
      values: |
        image:
          repository: ${ECR_REGISTRY}/alert-service
          tag: ${GIT_COMMIT_SHA}
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

---

## Part 5: Security Architecture

### 5.1 Authentication & Authorization Flow

```
┌──────────┐
│  Client  │ ── POST /oauth/authorize ──┐
└──────────┘                             │
                                         ▼
                                   ┌────────────┐
                                   │ Keycloak   │
                                   │ (OAuth2)   │
                                   └────────────┘
                                         │
                  ┌──────────────────────┼──────────────────────┐
                  │                      │                      │
            (1) MFA                  (2) Token                (3) User
           Challenge                 Issued                   Context
                  │                      │                      │
                  ▼                      ▼                      ▼
          ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
          │ Device Auth  │      │ JWT Token   │      │ RBAC + ABAC  │
          │ (TOTP/WebAuthn)    │ RS256 signed │      │ Attributes   │
          └──────────────┘      └─────────────┘      └──────────────┘
                  │                      │                      │
                  └──────────────────────┴──────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │ Authorization    │
                              │ Middleware       │
                              │ (API Gateway)    │
                              └──────────────────┘
                                         │
                  ┌──────────────────────┼──────────────────────┐
                  │                      │                      │
            (1) Token               (2) Tenant-ID           (3) User
            Validation             Extraction              Role
                  │                      │                      │
                  ▼                      ▼                      ▼
          ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
          │ JWT Validation│      │ TenantMiddleware│      │ RBAC Check   │
          │ (exp, sig)   │      │ (RLS setting)   │      │ (endpoint)   │
          └──────────────┘      └─────────────────┘      └──────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │ Service Access   │
                              │ (Data isolation) │
                              └──────────────────┘
```

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-123"
  },
  "payload": {
    "sub": "user-id-uuid",
    "iss": "https://auth.platform.local",
    "aud": "alert-service",
    "exp": 1234567890,
    "iat": 1234567800,
    "tenant_id": "tenant-uuid",
    "roles": ["clinician", "alert_manager"],
    "permissions": ["read:alerts", "write:interventions"],
    "mfa_verified": true,
    "device_id": "device-token-xyz"
  },
  "signature": "RSASSA-PKCS1-v1_5"
}
```

### 5.2 Data Encryption

**At Rest (Database):**
```
PostgreSQL:
  - Transparent Data Encryption (TDE) via AWS KMS
  - Master key: AWS KMS (managed key rotation)
  - Column-level encryption for PII:
    * first_name, last_name, mrn: encrypted with tenant-specific key
    * ssn: encrypted with master key
  - S3 bucket encryption: AES-256

KMS Key Structure:
  - Master key: AWS-managed (primary tenant key)
  - Per-tenant keys: Customer-managed (hierarchical)
  - Key rotation: Annual (automatic)
```

**In Transit:**
```
TLS Configuration:
  - Minimum: TLS 1.2 (required)
  - Preferred: TLS 1.3
  - Ciphers: ECDHE-RSA-AES256-GCM-SHA384 (and modern equivalents)
  - Certificate: AWS Certificate Manager (auto-renewal)

API Endpoints:
  - All communication over HTTPS
  - HSTS: Strict-Transport-Security: max-age=31536000

Internal Communication:
  - Service-to-service: mTLS (mutual TLS)
  - Pod-to-pod: Istio mTLS (automatic cert injection)
  - Database connections: SSL required
```

**Application-Level Encryption:**
```python
# Sensitive field encryption
from cryptography.fernet import Fernet

class EncryptedField:
    def __init__(self, key_id):
        self.key_id = key_id
        self.cipher = get_cipher(key_id)  # from KMS
    
    def encrypt(self, plaintext):
        return self.cipher.encrypt(plaintext.encode())
    
    def decrypt(self, ciphertext):
        return self.cipher.decrypt(ciphertext).decode()

# Usage in ORM
class Patient(Base):
    __tablename__ = "patients"
    
    mrn = Column(String, nullable=False)  # PII
    mrn_encrypted = Column(String)  # Stored encrypted
    
    @property
    def mrn_value(self):
        return decrypt(self.mrn_encrypted, key_id=self.tenant.encryption_key_id)
```

### 5.3 Network Security

```
AWS VPC Architecture:
  
  Internet ──┐
             │
       ┌─────▼─────┐
       │   WAF      │  (Block attacks: SQLi, XSS, DDoS)
       └─────┬─────┘
             │
       ┌─────▼─────────────────────────────┐
       │  Application Load Balancer (ALB)   │
       │  - TLS termination                 │
       │  - Security groups: 443 only       │
       └─────┬─────────────────────────────┘
             │
    ┌────────┴────────────────────────────────┐
    │  Public Subnets (NAT Gateways only)    │
    └────────┬────────────────────────────────┘
             │
    ┌────────▼────────────────────────────────┐
    │  Private Subnets (EKS Nodes)            │
    │  - Security group: 443 inbound from ALB │
    │  - Outbound: 443 (API calls)            │
    │  - Network policy: Default deny, explicit allow
    └────────┬────────────────────────────────┘
             │
    ┌────────┴──────────────────────────────────┐
    │  Database Subnets (RDS, Redis)           │
    │  - Security group: 5432 from EKS only     │
    │  - No internet access                     │
    │  - VPC endpoints for AWS services         │
    └──────────────────────────────────────────┘
```

**Network Policies (Kubernetes):**
```yaml
# Default deny incoming
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
# Allow API traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: alert-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: production
      ports:
        - protocol: TCP
          port: 5432  # PostgreSQL
    - to:
        - namespaceSelector:
            matchLabels:
              name: production
      ports:
        - protocol: TCP
          port: 6379  # Redis
    - to:
        - podSelector: {}
      ports:
        - protocol: TCP
          port: 53  # DNS
```

---

## Part 6: Monitoring, Observability & Reliability

### 6.1 Metrics & Dashboarding (Prometheus + Grafana)

**Key Metrics:**

```
Application Metrics:
  - alert_count_total (P1/P2/P3 breakdown)
  - alert_latency_seconds (alert delivery time)
  - observation_ingestion_rate (events/sec)
  - prediction_inference_time_ms (p50, p99)
  - api_request_duration_seconds (by endpoint, method)
  - authentication_failures_total
  - api_errors_total (by error code)

Business Metrics:
  - active_patients (per tenant)
  - active_users (per tenant)
  - hospital_uptime_percent
  - clinical_outcome: mortality_reduction_percent
  - clinical_outcome: intervention_timeliness_percent

Infrastructure Metrics:
  - kubernetes_pod_cpu_usage_cores
  - kubernetes_pod_memory_usage_bytes
  - postgres_connections_active
  - redis_memory_used_bytes
  - network_bytes_in/out
  - disk_usage_percent
```

**Prometheus Scrape Targets:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'alertmanager'
    static_configs:
      - targets: ['alertmanager:9093']
```

**Grafana Dashboards:**

1. **System Health Dashboard**
   - Cluster CPU/Memory utilization
   - Pod restart rate
   - Network I/O
   - Disk usage trend

2. **Application Performance Dashboard**
   - API latency (p50, p95, p99)
   - Request volume by endpoint
   - Error rate trend
   - Prediction inference time

3. **Business Metrics Dashboard**
   - Alerts generated (P1/P2/P3)
   - Alert response time
   - Clinical outcomes (mortality reduction %)
   - Hospital uptime

4. **Database Dashboard**
   - Query latency distribution
   - Active connections
   - Replication lag
   - Cache hit ratio

### 6.2 Logging (ELK Stack)

**Log Aggregation:**
```yaml
# Fluent-bit (lightweight log forwarder)
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        5
        Daemon       Off
        Log_Level    info

    [INPUT]
        Name              tail
        Path              /var/log/containers/*/*.log
        Parser            docker
        Tag               kube.*
        Refresh_Interval  5

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Kube_CA_File        /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        Merge_Log           On

    [OUTPUT]
        Name            es
        Match           kube.*
        Host            elasticsearch
        Port            9200
        HTTP_User       elastic
        HTTP_Passwd     ${ELASTIC_PASSWORD}
        Type            _doc
```

**Log Schema:**
```json
{
  "timestamp": "2026-04-25T10:30:45.123Z",
  "severity": "ERROR",
  "service": "alert-service",
  "trace_id": "abc123def456",
  "span_id": "xyz789",
  "user_id": "user-uuid",
  "tenant_id": "tenant-uuid",
  "message": "Failed to send alert notification",
  "error": {
    "code": "EHR_INTEGRATION_FAILED",
    "details": "Epic API timeout after 30s"
  },
  "context": {
    "patient_id": "patient-uuid",
    "alert_id": "alert-uuid",
    "operation": "send_to_ehr"
  }
}
```

**Kibana Queries:**
```
# Find all errors from alert-service
service:alert-service AND severity:ERROR

# Track patient-specific alerts
patient_id:xyz AND service:alert-service

# Monitor EHR integration failures
error.code:EHR_INTEGRATION_FAILED

# Latency > 1 second
service:api AND response_time_ms:>1000
```

### 6.3 Distributed Tracing (Jaeger)

```yaml
# Jaeger client instrumentation
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger-agent",
    agent_port=6831,
)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)
tracer = trace.get_tracer(__name__)

# Usage
with tracer.start_as_current_span("send_alert") as span:
    span.set_attribute("patient_id", patient_id)
    span.set_attribute("severity", "P1")
    # ... send alert logic
```

### 6.4 Alerting Rules (AlertManager)

```yaml
groups:
  - name: critical
    interval: 30s
    rules:
      - alert: PodCrashLoop
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.5
        for: 5m
        annotations:
          summary: "Pod {{ $labels.pod }} in {{ $labels.namespace }} crash looping"
          severity: critical
        labels:
          pagerduty_service: core-api

      - alert: APIErrorRateHigh
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Error rate > 5% for {{ $labels.service }}"
          severity: critical
        labels:
          pagerduty_service: core-api

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_connections_active / pg_connections_max > 0.9
        for: 5m
        annotations:
          summary: "DB connection pool 90% full"
          severity: critical

      - alert: AlertDeliveryLatency
        expr: histogram_quantile(0.99, alert_delivery_latency_ms) > 5000
        for: 5m
        annotations:
          summary: "Alert delivery p99 > 5s (SLA: 2s)"
          severity: critical
```

---

## Part 7: Testing Strategy

### 7.1 Test Pyramid

```
                       ╱ E2E Tests (5%)
                      ╱ ─────────────────
                     ╱  - Full workflow
                    ╱   - Real mobile app
                   ╱    - Integration tests
                  ╱
                 ╱ Integration Tests (20%)
                ╱ ─────────────────────────
               ╱  - API tests
              ╱   - EHR adapter tests
             ╱    - Database tests
            ╱
           ╱ Unit Tests (75%)
          ╱ ──────────────────
         ╱  - Business logic
        ╱   - Data validation
       ╱    - Error handling
      ╱
     ╱__________________________
    
Test Coverage Target: >90% (safety-critical code >95%)
```

**Unit Tests (FastAPI):**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-token-xyz"}

def test_create_observation_valid(client, auth_headers):
    """Test creating a valid observation"""
    response = client.post(
        "/api/v1/observations",
        json={
            "patient_id": "patient-uuid",
            "observation_type": "heart_rate",
            "value": 85.5,
            "unit": "bpm",
            "timestamp": "2026-04-25T10:30:00Z"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["observation_id"]

def test_create_observation_invalid_value(client, auth_headers):
    """Test creating observation with invalid value"""
    response = client.post(
        "/api/v1/observations",
        json={
            "patient_id": "patient-uuid",
            "observation_type": "heart_rate",
            "value": -100,  # Invalid
            "unit": "bpm",
            "timestamp": "2026-04-25T10:30:00Z"
        },
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "value must be positive" in response.json()["detail"]

def test_unauthorized_access(client):
    """Test access without auth token"""
    response = client.get("/api/v1/alerts")
    assert response.status_code == 401

def test_tenant_isolation(client, auth_headers):
    """Test that tenant1 cannot see tenant2 data"""
    # Create alert in tenant2's hospital
    # Access with tenant1's credentials
    # Should not see the alert
    pass
```

**Integration Tests:**
```python
@pytest.mark.integration
def test_end_to_end_alert_workflow(client, auth_headers, db_session):
    """Test complete alert workflow: observation → alert → intervention"""
    
    # 1. Create observation
    obs_response = client.post(
        "/api/v1/observations",
        json={...},
        headers=auth_headers
    )
    obs_id = obs_response.json()["observation_id"]
    
    # 2. Verify alert triggered
    alerts = client.get("/api/v1/alerts", headers=auth_headers)
    assert len(alerts.json()) > 0
    alert = alerts.json()[0]
    
    # 3. Acknowledge alert
    ack_response = client.post(
        f"/api/v1/alerts/{alert['alert_id']}/acknowledge",
        json={"notes": "Reviewed by clinician"},
        headers=auth_headers
    )
    assert ack_response.status_code == 200
    
    # 4. Record intervention
    intervention = client.post(
        f"/api/v1/alerts/{alert['alert_id']}/interventions",
        json={
            "intervention_type": "assessment",
            "description": "Patient examined",
            "outcome": "stable"
        },
        headers=auth_headers
    )
    assert intervention.status_code == 201
```

**Security Testing:**
```python
@pytest.mark.security
def test_sql_injection_prevention(client, auth_headers):
    """Test SQL injection protection"""
    response = client.get(
        "/api/v1/patients?mrn='; DROP TABLE patients; --",
        headers=auth_headers
    )
    assert response.status_code == 200  # Query should be safe
    # Verify table still exists
    assert db_session.query(Patient).count() > 0

@pytest.mark.security
def test_xss_prevention(client, auth_headers):
    """Test XSS protection in API responses"""
    response = client.post(
        "/api/v1/observations",
        json={
            "patient_id": "patient-uuid",
            "observation_type": "heart_rate",
            "value": 85,
            "unit": "<script>alert('xss')</script>"  # Malicious input
        },
        headers=auth_headers
    )
    # Unit should be sanitized
    data = response.json()
    assert "<script>" not in data["unit"]

@pytest.mark.security
def test_rate_limiting(client):
    """Test API rate limiting"""
    for i in range(1001):  # Exceed 1000 req/min limit
        response = client.get("/api/v1/health")
        if i < 1000:
            assert response.status_code == 200
        else:
            assert response.status_code == 429  # Rate limited
```

**Load Testing (k6):**
```javascript
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  vus: 100,  // 100 virtual users
  duration: '5m',
  rps: 1000,  // 1000 requests per second target
  thresholds: {
    http_req_duration: ['p(99)<2000'],  // p99 < 2 seconds
    http_req_failed: ['rate<0.01'],  // < 1% errors
  },
};

export default function() {
  group('GET /api/v1/alerts', function() {
    const response = http.get('https://api.platform.local/api/v1/alerts', {
      headers: {
        Authorization: `Bearer ${__ENV.TOKEN}`,
      },
    });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'body has alerts': (r) => r.body.includes('alert_id'),
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
  });
}
```

---

## Part 8: MLOps & Model Management

### 8.1 Model Training Pipeline (Airflow)

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'ml-team',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'start_date': datetime(2026, 1, 1),
}

dag = DAG(
    'model_retraining_pipeline',
    default_args=default_args,
    schedule_interval='0 2 * * *',  # Daily at 2 AM UTC
    catchup=False,
)

def extract_features():
    """Extract features from observations + outcomes"""
    import pandas as pd
    from sqlalchemy import create_engine
    
    engine = create_engine(os.getenv('DATABASE_URL'))
    
    query = """
    SELECT
        p.patient_id,
        EXTRACT(YEAR FROM AGE(observations.timestamp, patients.dob)) as age,
        AVG(CASE WHEN observation_type = 'heart_rate' THEN value END) as hr_mean,
        STDDEV(CASE WHEN observation_type = 'heart_rate' THEN value END) as hr_stddev,
        ...
        o.mortality_30d as target
    FROM observations
    JOIN patients p ON observations.patient_id = p.patient_id
    JOIN outcomes o ON p.patient_id = o.patient_id
    WHERE observations.timestamp >= NOW() - INTERVAL '90 days'
    GROUP BY p.patient_id
    """
    
    df = pd.read_sql(query, engine)
    df.to_parquet('/tmp/features.parquet')
    return '/tmp/features.parquet'

def train_models(feature_path):
    """Train ensemble of models"""
    import mlflow
    from sklearn.ensemble import XGBClassifier, RandomForestClassifier
    import pandas as pd
    
    df = pd.read_parquet(feature_path)
    X = df.drop('target', axis=1)
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    with mlflow.start_run():
        # XGBoost model
        xgb_model = XGBClassifier(n_estimators=100, max_depth=5)
        xgb_model.fit(X_train, y_train)
        xgb_score = xgb_model.score(X_test, y_test)
        mlflow.log_metric('xgb_accuracy', xgb_score)
        mlflow.sklearn.log_model(xgb_model, 'xgb_model')
        
        # Random Forest model
        rf_model = RandomForestClassifier(n_estimators=100)
        rf_model.fit(X_train, y_train)
        rf_score = rf_model.score(X_test, y_test)
        mlflow.log_metric('rf_accuracy', rf_score)
        mlflow.sklearn.log_model(rf_model, 'rf_model')
        
        # Register best model
        best_model = xgb_model if xgb_score > rf_score else rf_model
        mlflow.register_model(
            model_uri=f'runs:/{mlflow.active_run().info.run_id}/model',
            name='mortality_predictor'
        )

def validate_model(run_id):
    """Validate model on holdout test set"""
    from sklearn.metrics import roc_auc_score, confusion_matrix
    import mlflow
    
    model = mlflow.sklearn.load_model(f'runs:/{run_id}/model')
    # Validation on holdout set
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    
    if auc < 0.85:  # Minimum performance threshold
        raise ValueError(f'Model AUC {auc} below minimum 0.85')
    
    mlflow.log_metric('auc_score', auc)

def promote_model():
    """Promote model to production if validation passes"""
    import mlflow
    from mlflow.tracking import MlflowClient
    
    client = MlflowClient()
    latest = client.get_latest_versions('mortality_predictor')[0]
    
    client.transition_model_version_stage(
        name='mortality_predictor',
        version=latest.version,
        stage='Production'
    )

# DAG tasks
extract_task = PythonOperator(
    task_id='extract_features',
    python_callable=extract_features,
    dag=dag,
)

train_task = PythonOperator(
    task_id='train_models',
    python_callable=train_models,
    op_kwargs={'feature_path': extract_task.output},
    dag=dag,
)

validate_task = PythonOperator(
    task_id='validate_model',
    python_callable=validate_model,
    dag=dag,
)

promote_task = PythonOperator(
    task_id='promote_model',
    python_callable=promote_model,
    dag=dag,
)

extract_task >> train_task >> validate_task >> promote_task
```

### 8.2 Model Serving (TensorFlow Serving / Seldon)

```yaml
# TensorFlow Serving deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tf-serving-mortality
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tf-serving
  template:
    metadata:
      labels:
        app: tf-serving
    spec:
      containers:
      - name: tensorflow-serving
        image: tensorflow/serving:2.12.0
        ports:
        - containerPort: 8500  # gRPC
        - containerPort: 8501  # REST
        env:
        - name: MODEL_NAME
          value: mortality_predictor
        - name: MODEL_BASE_PATH
          value: /models
        volumeMounts:
        - name: models
          mountPath: /models
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: models
        persistentVolumeClaim:
          claimName: tf-models-pvc
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - tf-serving
              topologyKey: kubernetes.io/hostname

---
# Model storage (S3)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: tf-models-pv
spec:
  capacity:
    storage: 50Gi
  accessModes:
    - ReadOnlyMany
  awsElasticBlockStore:
    volumeID: vol-xxxxx
    fsType: ext4

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: tf-serving-mortality
spec:
  selector:
    app: tf-serving
  type: ClusterIP
  ports:
  - port: 8500
    name: grpc
  - port: 8501
    name: http
```

---

## Part 9: Scaling & Performance Optimization

### 9.1 Horizontal Scaling Strategy

```
Phase 1 (100-300 hospitals):
  - 8-16 API pod replicas (CPU-based HPA)
  - PostgreSQL Multi-AZ (m5.xlarge)
  - Redis Cluster (6 nodes, 3 replicas)
  - Throughput: 50K events/sec
  - Cost: ~$50K/month AWS

Phase 2 (300-700 hospitals):
  - 16-32 API pod replicas
  - PostgreSQL Multi-AZ (r5.2xlarge)
  - Redis Cluster (16 shards, 3 replicas)
  - Kafka cluster (3+ brokers)
  - Spark for batch processing
  - Throughput: 200K events/sec
  - Cost: ~$150K/month AWS

Phase 3 (700-1000+ hospitals):
  - 32-64 API pod replicas
  - PostgreSQL Multi-AZ (r5.4xlarge) + read replicas
  - Redis Cluster (32 shards, 3 replicas)
  - Multi-region deployment (AWS regions)
  - Elasticsearch for search
  - Throughput: 1M events/sec
  - Cost: ~$500K/month AWS
```

### 9.2 Performance Optimization

```python
# Database query optimization
# ❌ BAD: N+1 queries
for patient in patients:
    observations = session.query(Observation).filter_by(
        patient_id=patient.id
    ).all()  # Separate query per patient!

# ✅ GOOD: Eager loading
patients = session.query(Patient).options(
    joinedload(Patient.observations)
).all()  # Single query with JOIN

# ✅ GOOD: Batch queries
from sqlalchemy import and_
patient_ids = [p.id for p in patients]
observations = session.query(Observation).filter(
    Observation.patient_id.in_(patient_ids)
).all()

# Caching strategy
@cached(cache=TTLCache(maxsize=10000, ttl=3600))
def get_patient_risk_score(patient_id):
    """Cache for 1 hour"""
    predictions = session.query(Prediction).filter_by(
        patient_id=patient_id
    ).order_by(Prediction.created_at.desc()).first()
    return predictions.risk_score

# Connection pooling
from sqlalchemy.pool import QueuePool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_timeout=30,
    pool_pre_ping=True  # Test connections before use
)
```

---

## Success Criteria for Phase 14

| Area | Target | Validation |
|------|--------|-----------|
| **Technology Stack** | All components selected | Architecture decision document |
| **API Specifications** | OpenAPI 3.1 complete | Auto-generated docs, SDK generation |
| **Database Schema** | Multi-tenant design verified | Schema tested with row-level security |
| **CI/CD Pipeline** | Auto-deploy working | Staging deployment successful |
| **Security** | OWASP Top 10 addressed | Security audit, penetration test |
| **Monitoring** | 90% observability | All services instrumented |
| **Testing** | >90% code coverage | Test reports, load test results |
| **Performance** | SLA targets met | Load testing (1000+ RPS, p99 < 2s) |

---

**Status:** 🏗️ PHASE 14 TECHNICAL ARCHITECTURE COMPLETE

**Next Milestone:** Phase 9 implementation begins (Q3 2026)

**Timeline:** 4-6 weeks (concurrent with Phase 1-8 infrastructure)

**Strategic Objective:** Translate strategic phases into executable technical specifications enabling enterprise-scale deployment

---

**Last Updated:** April 25, 2026  
**Document Version:** 1.0 (Architecture Complete)  
**Maintained By:** Platform Engineering Team

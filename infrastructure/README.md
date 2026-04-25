# Enterprise Medical Device Platform: Infrastructure as Code

**Purpose:** Deploy compliant infrastructure for FDA medical device platform  
**Compliance:** IEC 62304, CFR Part 11, HIPAA  
**Version:** 1.0 (April 25, 2026)

---

## Quick Start: Infrastructure Deployment

### Prerequisites

1. **AWS Account & Credentials**
   ```bash
   # Configure AWS credentials
   aws configure
   # Use IAM user with permissions for EC2, RDS, EKS, KMS, S3, VPC, IAM, Secrets Manager
   
   # Verify credentials
   aws sts get-caller-identity
   ```

2. **Terraform Installation**
   ```bash
   # Install Terraform >= 1.0
   terraform --version
   ```

3. **kubectl Installation**
   ```bash
   # Install kubectl for Kubernetes management
   kubectl version --client
   ```

4. **TLS Certificate**
   - Create a certificate in AWS Certificate Manager (ACM) for your domain
   - Get the certificate ARN: `arn:aws:acm:region:account:certificate/id`

### Phase 1: Terraform Setup

```bash
# 1. Navigate to infrastructure directory
cd infrastructure/terraform

# 2. Copy terraform.tfvars template
cp terraform.tfvars.example terraform.tfvars

# 3. Edit terraform.tfvars with your values
vim terraform.tfvars
# IMPORTANT: Update:
#   - aws_region
#   - certificate_arn (from AWS ACM)
#   - certificate_domain
#   - s3_audit_backup_bucket_name (must be globally unique)

# 4. Verify no hardcoded credentials
grep -r "password\|secret\|token" terraform.tfvars
# Should return NOTHING (all secrets in tfvars, never in code)
```

### Phase 2: Terraform Planning & Validation

```bash
# 1. Initialize Terraform (downloads providers & modules)
terraform init

# 2. Validate configuration syntax
terraform validate

# 3. Check formatting
terraform fmt --check

# 4. Generate plan
terraform plan -out=tfplan

# 5. Review plan (especially security-critical resources)
terraform show tfplan | grep -A 5 "aws_db_instance\|aws_kms_key\|aws_s3_bucket"

# Expected changes:
# - 1 VPC
# - 3 public subnets + 3 private subnets
# - 1 Internet Gateway + 1 NAT Gateway
# - 1 RDS instance (Multi-AZ)
# - 2 KMS keys (RDS + S3)
# - 1 S3 bucket (audit backups)
# - 1 EKS cluster
# - 1 EKS node group (3 nodes)
# - Kubernetes namespaces (platform, monitoring, ingress-nginx)
# - Prometheus + Grafana Helm releases
```

### Phase 3: Infrastructure Deployment

```bash
# 1. Apply Terraform plan (creates AWS resources)
terraform apply tfplan
# This takes ~20-30 minutes

# 2. Save outputs to file
terraform output -json > outputs.json

# 3. Verify EKS cluster is running
aws eks describe-cluster \
  --name platform-cluster \
  --region us-east-1 \
  --query 'cluster.status'
# Expected: "ACTIVE"

# 4. Configure kubectl context
aws eks update-kubeconfig \
  --region us-east-1 \
  --name platform-cluster

# 5. Verify kubectl connection
kubectl cluster-info
kubectl get nodes
# Should show 3 nodes in READY state
```

### Phase 4: Kubernetes Deployment

```bash
# 1. Deploy platform manifests
kubectl apply -f kubernetes/01-platform-deployment.yaml

# 2. Verify deployments
kubectl -n platform get pods
kubectl -n platform get svc

# 3. Wait for platform-api to be ready (startup probe takes ~3-5 min)
kubectl -n platform wait --for=condition=ready pod \
  -l app=platform,tier=api --timeout=600s

# 4. Verify PostgreSQL StatefulSet
kubectl -n platform get statefulset audit-trail-db
kubectl -n platform logs audit-trail-db-0

# 5. Initialize database schema
kubectl -n platform exec -it audit-trail-db-0 -- \
  psql -U audit_trail_user -d audit_trail -f /docker-entrypoint-initdb.d/01-init.sql
```

### Phase 5: Monitoring & Alerting Setup

```bash
# 1. Deploy Prometheus alert rules
kubectl create configmap prometheus-alerts \
  -f prometheus/02-platform-alerts.yaml \
  -n monitoring

# 2. Deploy Grafana dashboards
kubectl create configmap grafana-dashboards \
  -f grafana/03-platform-dashboards.json \
  -n monitoring

# 3. Verify Prometheus is scraping metrics
# Forward port: kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit: http://localhost:9090/targets
# All targets should show "UP"

# 4. Verify Grafana dashboards
# Forward port: kubectl port-forward -n monitoring svc/grafana 3000:3000
# Visit: http://localhost:3000
# Login with admin/[password from terraform output]
# Verify all alert panels show healthy state
```

---

## Compliance Verification

### IEC 62304 Deployment Control

```bash
# Verify software lifecycle (design → implementation → V&V → deployment)
cd ..
git log --oneline | head -20
# Should show: technical flows + runbooks + infrastructure code commits

# Verify SLSA v1.0 provenance
gh release view v1.0.0 --json assets
# Should include: SBOM, attestations, build logs

# Verify code signing
cosign verify ghcr.io/company/platform:v1.0.0
# Expected: Valid signature with GitHub OIDC token
```

### CFR Part 11 Audit Trail Verification

```bash
# 1. Connect to audit trail database
PGPASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id platform/rds/master-password \
  --query SecretString --output text) \
  psql -h $(terraform output -raw rds_endpoint) \
    -U audit_trail_user -d audit_trail

# 2. Verify immutability constraint
SELECT constraint_name, constraint_definition 
FROM information_schema.check_constraints 
WHERE table_name='audit_trail';
# Should show: "audit_trail_immutable" constraint

# 3. Verify table structure
\d audit_trail
# Should show: event_id, timestamp, user_id, action_type, merkle_chain_hash, signature

# 4. Test insert (should succeed)
INSERT INTO audit_trail (event_id, timestamp, unix_timestamp, user_id, action_type, 
  resource_type, resource_id, event_json, event_hash, signature, signature_timestamp,
  merkle_chain_hash)
VALUES ('TEST-001', NOW(), EXTRACT(EPOCH FROM NOW())::BIGINT, 'admin', 'test_action',
  'TEST', 'test-id', '{"test":"data"}', 'abc123', 'sig', NOW(), 'merkle123');

# 5. Test delete (should FAIL)
DELETE FROM audit_trail WHERE event_id='TEST-001';
# Expected error: "Permission denied"

# 6. Test update (should FAIL)
UPDATE audit_trail SET action_type='MODIFIED' WHERE event_id='TEST-001';
# Expected error: "Permission denied"

# 7. Verify audit trail has entries
SELECT COUNT(*) FROM audit_trail;
```

### HIPAA Compliance Checks

```bash
# 1. Verify encryption at rest
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].StorageEncrypted'
# Expected: true

aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].KmsKeyId'
# Should return KMS key ARN

# 2. Verify encryption in transit (TLS 1.3)
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].EnableIAMDatabaseAuthentication'
# Expected: true (IAM auth enforces TLS)

# 3. Verify S3 backup encryption
aws s3api get-bucket-encryption \
  --bucket $(terraform output -raw s3_backup_bucket)
# Expected: ServerSideEncryptionConfiguration with KMS key

# 4. Verify MFA delete protection (optional but recommended)
aws s3api get-bucket-versioning \
  --bucket $(terraform output -raw s3_backup_bucket)
# Check: MFADelete setting

# 5. Verify backup encryption
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].PreferredBackupWindow'
# Verify backup window (should be off-peak hours, e.g., 03:00-04:00 UTC)
```

### Monitoring & Alerting Verification

```bash
# 1. Test Prometheus scraping
PROMETHEUS_POD=$(kubectl -n monitoring get pods -l app=prometheus -o jsonpath='{.items[0].metadata.name}')
kubectl -n monitoring port-forward $PROMETHEUS_POD 9090:9090 &

# Visit http://localhost:9090/graph
# Verify metrics are being scraped:
# - http_requests_total
# - auth_failures_total
# - audit_trail_max_timestamp
# - container_memory_usage_bytes

# 2. Test alert rules loading
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups | length'
# Should be > 0 (at least platform_critical_alerts + platform_recording_rules)

# 3. Verify Grafana dashboards
GRAFANA_POD=$(kubectl -n monitoring get pods -l app=grafana -o jsonpath='{.items[0].metadata.name}')
kubectl -n monitoring port-forward $GRAFANA_POD 3000:3000 &

# Visit http://localhost:3000
# Login: admin / [password from terraform output]
# Verify dashboards:
# - Platform: Compliance, Incident Response & Audit Trail
# - Check all panels show metrics (no "no data" messages)

# 4. Test alert firing
# Manually trigger an alert by causing an error
kubectl -n platform scale deployment platform-api --replicas=0
# Wait 2 minutes, verify alert "SystemUnavailabilityAboveThreshold" fires in Prometheus
kubectl -n platform scale deployment platform-api --replicas=3
```

---

## Operations: Backup & Recovery

### Backup Procedures

```bash
# 1. Manual database backup
aws rds create-db-snapshot \
  --db-instance-identifier platform-audit-trail-db \
  --db-snapshot-identifier platform-backup-$(date +%Y%m%d-%H%M%S)

# 2. Verify backup completed
aws rds describe-db-snapshots \
  --db-snapshot-identifier platform-backup-20260425-120000 \
  --query 'DBSnapshots[0].Status'
# Expected: "available"

# 3. Export backup to S3 (for long-term retention)
aws rds start-export-task \
  --export-task-identifier platform-export-20260425 \
  --source-arn arn:aws:rds:us-east-1:123456789012:snapshot:platform-backup-20260425-120000 \
  --s3-bucket-name $(terraform output -raw s3_backup_bucket) \
  --s3-prefix backups/ \
  --iam-role-arn arn:aws:iam::123456789012:role/ExportRole

# 4. Verify backup in S3
aws s3 ls $(terraform output -raw s3_backup_bucket)/backups/
```

### Disaster Recovery Test

```bash
# 1. Create snapshot from current database
SNAPSHOT_ID=platform-test-restore-$(date +%s)
aws rds create-db-snapshot \
  --db-instance-identifier platform-audit-trail-db \
  --db-snapshot-identifier $SNAPSHOT_ID

# 2. Wait for snapshot to complete
while true; do
  STATUS=$(aws rds describe-db-snapshots --db-snapshot-identifier $SNAPSHOT_ID \
    --query 'DBSnapshots[0].Status' --output text)
  if [ "$STATUS" == "available" ]; then break; fi
  echo "Status: $STATUS (waiting...)"
  sleep 30
done

# 3. Restore to new instance (test only)
TEST_INSTANCE_ID=platform-audit-trail-restore-test
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier $TEST_INSTANCE_ID \
  --db-snapshot-identifier $SNAPSHOT_ID \
  --db-instance-class db.r6i.xlarge

# 4. Wait for restore to complete (~10 min)
aws rds wait db-instance-available --db-instance-identifier $TEST_INSTANCE_ID

# 5. Connect to restored database and verify
RESTORE_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier $TEST_INSTANCE_ID \
  --query 'DBInstances[0].Endpoint.Address' --output text)

PGPASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id platform/rds/master-password \
  --query SecretString --output text) \
  psql -h $RESTORE_ENDPOINT -U audit_trail_user -d audit_trail \
  -c "SELECT COUNT(*) as event_count FROM audit_trail;"

# 6. Delete test instance
aws rds delete-db-instance \
  --db-instance-identifier $TEST_INSTANCE_ID \
  --skip-final-snapshot

echo "✅ Disaster recovery test successful"
```

---

## Maintenance & Updates

### Database Maintenance

```bash
# 1. View maintenance window
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].PreferredMaintenanceWindow'
# Currently: sun:04:00-sun:05:00 UTC

# 2. Apply pending maintenance
aws rds modify-db-instance \
  --db-instance-identifier platform-audit-trail-db \
  --apply-immediately

# 3. View RDS parameter group (for optimization)
aws rds describe-db-parameters \
  --db-parameter-group-name platform-audit-trail-params \
  --query 'Parameters[?Source==`user`]'

# 4. Monitor slow query log
aws rds describe-db-log-files \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DescribeDBLogFiles[*].[LogFileName, LastWritten]'
```

### EKS Node Updates

```bash
# 1. Check for available EKS updates
aws eks describe-cluster \
  --name platform-cluster \
  --query 'cluster.version'

# 2. Update EKS control plane (blue-green deployment)
aws eks update-cluster-version \
  --name platform-cluster \
  --kubernetes-version 1.29

# 3. Update EKS node group (rolling update)
aws eks update-nodegroup-version \
  --cluster-name platform-cluster \
  --nodegroup-name platform-node-group

# 4. Verify nodes are updated
kubectl get nodes -o wide | awk '{print $6}'
# All nodes should show new version
```

### Certificate Renewal

```bash
# 1. Verify certificate expiration
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw certificate_arn) \
  --query 'Certificate.DomainValidationOptions[0].ValidationEmails'

# 2. ACM auto-renewal (AWS handles automatically if using ACM)
# No action needed; AWS renews 60 days before expiration

# 3. Update ALB with new certificate (if manual renewal)
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:region:account:listener/... \
  --certificates CertificateArn=$(terraform output -raw certificate_arn)
```

---

## Cost Management

### Optimize Costs (Non-Compliance Critical)

```bash
# 1. View cost estimate
terraform plan -json | jq '.resource_changes[] | select(.type=="aws_*") | {type, change: .change.actions}'

# 2. Enable Reserved Instance discounts (for production)
# Estimate 3-year commitment: ~40% savings on compute

# 3. Enable S3 Intelligent-Tiering
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket $(terraform output -raw s3_backup_bucket) \
  --id AutoArchive \
  --intelligent-tiering-configuration \
    Id=AutoArchive,Filter={Prefix=backups/},Status=Enabled,Tierings='[{Days=30,AccessTier=ARCHIVE_ACCESS},{Days=90,AccessTier=DEEP_ARCHIVE_ACCESS}]'

# 4. Set S3 lifecycle policy to delete old backups
aws s3api put-bucket-lifecycle-configuration \
  --bucket $(terraform output -raw s3_backup_bucket) \
  --lifecycle-configuration '{Rules:[{Id=DeleteOldBackups,Filter={Prefix=backups/},Status=Enabled,Expiration={Days:90}}]}'
```

---

## Troubleshooting

### EKS Cluster Issues

```bash
# 1. Check cluster events
kubectl get events -A --sort-by='.lastTimestamp' | tail -20

# 2. Check node status
kubectl describe nodes | grep -A 20 "Conditions:"

# 3. Check pod logs
kubectl -n platform logs platform-api-0 --tail=50

# 4. Check resource usage
kubectl top nodes
kubectl top pods -n platform

# 5. Check PVC status
kubectl -n platform get pvc
kubectl -n platform describe pvc audit-trail-db-pvc
```

### Database Connection Issues

```bash
# 1. Verify security group allows access
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --query 'SecurityGroups[0].IpPermissions[]'

# 2. Test database connectivity from pod
kubectl -n platform exec -it platform-api-0 -- \
  nc -zv $(terraform output -raw rds_endpoint) 5432

# 3. Check RDS logs
aws logs tail /aws/rds/instance/platform-audit-trail-db --follow
```

---

## Documentation References

- **Kubernetes Manifests:** `./kubernetes/01-platform-deployment.yaml`
- **Database Migrations:** `./database/001-audit-trail-init.sql` through `004-risk-management.sql`
- **Prometheus Alerts:** `./prometheus/02-platform-alerts.yaml`
- **Grafana Dashboards:** `./grafana/03-platform-dashboards.json`
- **Operational Runbooks:** `../operations-runbooks/`

---

## Support & Escalation

For infrastructure issues:
1. Check CloudWatch logs: `aws logs tail /aws/eks/platform-cluster/cluster --follow`
2. Check EKS events: `kubectl get events -A`
3. Review Prometheus alerts: `http://prometheus:9090/alerts`
4. Contact: On-call engineer (PagerDuty)

Last Updated: April 25, 2026  
Next Review: July 25, 2026

# Terraform Variables: Enterprise Medical Device Platform
# Compliance: IEC 62304, CFR Part 11, HIPAA
# Version: 1.0 (April 25, 2026)

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "platform"
}

variable "compliance_tags" {
  description = "Compliance tags for all resources"
  type        = map(string)
  default = {
    compliance      = "hipaa,fda-medical-device,iec-62304,cfr-part-11"
    version         = "v1.0.0"
    created_date    = "2026-04-25"
    terraform       = "true"
  }
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

# Database
variable "db_instance_class" {
  description = "RDS instance class for audit trail database"
  type        = string
  default     = "db.r6i.xlarge"
  # r6i: memory-optimized for audit trail lookups
  # xlarge: 4 vCPU, 32 GB RAM
  # Estimated 50GB/year growth; 100GB PVC in k8s
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS database (GB)"
  type        = number
  default     = 100
}

variable "db_storage_type" {
  description = "RDS storage type (gp3 = general purpose SSD)"
  type        = string
  default     = "gp3"
}

variable "db_iops" {
  description = "RDS provisioned IOPS (for gp3)"
  type        = number
  default     = 3000
}

variable "db_throughput" {
  description = "RDS throughput in MB/s (for gp3)"
  type        = number
  default     = 125
}

variable "db_backup_retention_days" {
  description = "Database backup retention period (days)"
  type        = number
  default     = 30
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment for high availability"
  type        = bool
  default     = true
}

variable "db_engine_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.3"
}

variable "db_enable_encryption" {
  description = "Enable encryption at rest for RDS"
  type        = bool
  default     = true
}

variable "db_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

# KMS Encryption
variable "kms_enable_key_rotation" {
  description = "Enable automatic key rotation for KMS keys"
  type        = bool
  default     = true
}

variable "kms_rotation_period_days" {
  description = "Key rotation period (days)"
  type        = number
  default     = 90
}

# S3 Backup Storage
variable "s3_audit_backup_bucket_name" {
  description = "S3 bucket for audit trail backups"
  type        = string
  default     = "audit-trail-backups"
}

variable "s3_backup_retention_days" {
  description = "S3 backup retention period (days)"
  type        = number
  default     = 90
}

variable "s3_enable_versioning" {
  description = "Enable versioning for S3 backups"
  type        = bool
  default     = true
}

variable "s3_enable_encryption" {
  description = "Enable encryption for S3 backups"
  type        = bool
  default     = true
}

# EKS Cluster
variable "eks_node_count" {
  description = "Number of EKS worker nodes"
  type        = number
  default     = 3

  validation {
    condition     = var.eks_node_count >= 3
    error_message = "At least 3 nodes required for high availability."
  }
}

variable "eks_node_instance_type" {
  description = "EC2 instance type for EKS nodes"
  type        = string
  default     = "t3.2xlarge"
  # t3.2xlarge: 8 vCPU, 32 GB RAM
  # Suitable for medical device workloads
}

variable "eks_node_disk_size_gb" {
  description = "Disk size for EKS nodes (GB)"
  type        = number
  default     = 100
}

variable "eks_enable_logging" {
  description = "Enable EKS control plane logging"
  type        = bool
  default     = true
}

variable "eks_log_retention_days" {
  description = "CloudWatch log retention (days)"
  type        = number
  default     = 30
}

# Monitoring
variable "enable_prometheus" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "enable_grafana" {
  description = "Enable Grafana dashboards"
  type        = bool
  default     = true
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch logs retention period (days)"
  type        = number
  default     = 30
}

# Security
variable "enable_security_group_logging" {
  description = "Enable VPC Flow Logs for security group"
  type        = bool
  default     = true
}

variable "enable_alb_access_logs" {
  description = "Enable ALB access logs"
  type        = bool
  default     = true
}

variable "certificate_arn" {
  description = "ARN of TLS certificate for HTTPS"
  type        = string
  description = "Required for production deployment"
}

variable "certificate_domain" {
  description = "Domain name for TLS certificate"
  type        = string
  default     = "platform.example.com"
}

# HIPAA & Compliance
variable "enable_hipaa_compliance_checks" {
  description = "Enable HIPAA compliance checks"
  type        = bool
  default     = true
}

variable "audit_trail_verification_enabled" {
  description = "Enable daily audit trail verification"
  type        = bool
  default     = true
}

variable "audit_trail_verification_schedule" {
  description = "Cron schedule for audit trail verification (UTC)"
  type        = string
  default     = "0 2 * * *"
  # 2 AM UTC daily
}

# FDA & Regulatory
variable "fda_submission_prepared" {
  description = "Set to true when FDA submission package is ready"
  type        = bool
  default     = false
}

variable "fda_submission_date" {
  description = "Planned FDA submission date (YYYY-MM-DD)"
  type        = string
  default     = "2026-10-15"
}

# Backup & Disaster Recovery
variable "backup_enabled" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_schedule" {
  description = "Backup schedule (cron format, UTC)"
  type        = string
  default     = "0 3 * * *"
  # 3 AM UTC daily
}

variable "rto_minutes" {
  description = "Recovery Time Objective (minutes)"
  type        = number
  default     = 60
}

variable "rpo_minutes" {
  description = "Recovery Point Objective (minutes)"
  type        = number
  default     = 15
}

# Cost optimization (non-compliance-critical settings)
variable "enable_spot_instances" {
  description = "Enable Spot instances for cost savings (non-critical workloads only)"
  type        = bool
  default     = false
}

variable "enable_reserved_instances" {
  description = "Enable Reserved Instances discount"
  type        = bool
  default     = false
}

# Tagging strategy
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

locals {
  tags = merge(
    var.compliance_tags,
    {
      Environment = var.environment
      Project     = var.project_name
      Terraform   = "true"
    },
    var.additional_tags
  )
}

# Terraform Configuration: Enterprise Medical Device Platform Infrastructure
# Compliance: IEC 62304, CFR Part 11, HIPAA
# Version: 1.0 (April 25, 2026)

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  # Remote backend (use S3 for state management)
  backend "s3" {
    bucket         = "terraform-state-medical-device"
    key            = "platform/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# ============================================================================
# NETWORKING: VPC, Subnets, Internet Gateway, NAT Gateway, Route Tables
# ============================================================================

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Internet Gateway for public subnets
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public subnets (for ALB and NAT Gateway)
resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                              = "${var.project_name}-public-subnet-${count.index + 1}"
    "kubernetes.io/role/elb"          = "1"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Private subnets (for EKS nodes and RDS)
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                                   = "${var.project_name}-private-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb"     = "1"
    "karpenter.sh/discovery"               = "${var.project_name}-cluster"
  }
}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateway in public subnet for private subnet egress
resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.project_name}-nat"
  }

  depends_on = [aws_internet_gateway.main]
}

# Public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Route table associations for public subnets
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private route table (with NAT Gateway for egress)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[0].id
    }
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

# Route table associations for private subnets
resource "aws_route_table_association" "private" {
  count          = 3
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ============================================================================
# SECURITY GROUPS
# ============================================================================

# Security group for ALB (Application Load Balancer)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  # Allow HTTPS inbound
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP inbound (redirect to HTTPS)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# Security group for EKS nodes
resource "aws_security_group" "eks_nodes" {
  name        = "${var.project_name}-eks-nodes-sg"
  description = "Security group for EKS worker nodes"
  vpc_id      = aws_vpc.main.id

  # Allow traffic from ALB
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Allow node-to-node communication
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-nodes-sg"
  }
}

# Security group for RDS database
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS audit trail database"
  vpc_id      = aws_vpc.main.id

  # Allow PostgreSQL from EKS nodes
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# ============================================================================
# KMS ENCRYPTION (HIPAA §164.312(a)(2)(ii) Encryption & Decryption)
# ============================================================================

# KMS key for database encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS audit trail database encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = var.kms_enable_key_rotation

  tags = {
    Name = "${var.project_name}-rds-key"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# KMS key for S3 backup encryption
resource "aws_kms_key" "s3" {
  description             = "KMS key for S3 backup encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = var.kms_enable_key_rotation

  tags = {
    Name = "${var.project_name}-s3-key"
  }
}

resource "aws_kms_alias" "s3" {
  name          = "alias/${var.project_name}-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# ============================================================================
# RDS: PostgreSQL Audit Trail Database
# Compliance: CFR Part 11 §11.10 Data Integrity
# ============================================================================

# DB subnet group (must span multiple AZs for Multi-AZ)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# RDS instance (Multi-AZ for high availability)
resource "aws_db_instance" "audit_trail" {
  identifier            = "${var.project_name}-audit-trail-db"
  engine                = "postgres"
  engine_version        = var.db_engine_version
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  storage_type          = var.db_storage_type
  iops                  = var.db_iops
  storage_throughput    = var.db_throughput

  # High availability
  multi_az            = var.db_multi_az
  availability_zone   = data.aws_availability_zones.available.names[0]

  # Credentials (rotate periodically)
  db_name  = "audit_trail"
  username = "audit_trail_user"
  password = random_password.db_password.result

  # Network
  db_subnet_group_name            = aws_db_subnet_group.main.name
  vpc_security_group_ids          = [aws_security_group.rds.id]
  publicly_accessible             = false

  # Encryption (HIPAA §164.312(a)(2)(ii))
  storage_encrypted      = var.db_enable_encryption
  kms_key_id             = aws_kms_key.rds.arn

  # Backup & retention
  backup_retention_period = var.db_backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot   = true

  # Deletion protection (safety measure)
  deletion_protection = var.db_deletion_protection
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-audit-trail-final-snapshot-${formatdate("YYYYMMDD-hhmmss", timestamp())}"

  # Performance Insights
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn

  # Parameters
  parameter_group_name = aws_db_parameter_group.audit_trail.name

  tags = {
    Name = "${var.project_name}-audit-trail-db"
  }

  depends_on = [aws_db_parameter_group.audit_trail]
}

# Parameter group with audit trail specific settings
resource "aws_db_parameter_group" "audit_trail" {
  name   = "${var.project_name}-audit-trail-params"
  family = "postgres15"

  # Enable audit logging
  parameter {
    name  = "log_statement"
    value = "all"
    apply_method = "immediate"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "0"
    apply_method = "immediate"
  }

  # Constraint for immutability
  parameter {
    name  = "max_connections"
    value = "200"
    apply_method = "pending-reboot"
  }

  tags = {
    Name = "${var.project_name}-audit-trail-params"
  }
}

# Generate random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store database password in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${var.project_name}/rds/master-password"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-db-password-secret"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id      = aws_secretsmanager_secret.db_password.id
  secret_string  = random_password.db_password.result
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ============================================================================
# S3: Backup Storage (HIPAA §164.312(b) Audit Controls)
# ============================================================================

resource "aws_s3_bucket" "audit_backups" {
  bucket = "${var.s3_audit_backup_bucket_name}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-audit-backups"
  }
}

# Enable versioning for backup history
resource "aws_s3_bucket_versioning" "audit_backups" {
  bucket = aws_s3_bucket.audit_backups.id

  versioning_configuration {
    status = var.s3_enable_versioning ? "Enabled" : "Suspended"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "audit_backups" {
  bucket = aws_s3_bucket.audit_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.s3_enable_encryption ? aws_kms_key.s3.arn : null
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "audit_backups" {
  bucket = aws_s3_bucket.audit_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable bucket logging (audit trail of S3 access)
resource "aws_s3_bucket" "audit_logs" {
  bucket = "${var.project_name}-audit-logs-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-audit-logs"
  }
}

resource "aws_s3_bucket_logging" "audit_backups" {
  bucket = aws_s3_bucket.audit_backups.id

  target_bucket = aws_s3_bucket.audit_logs.id
  target_prefix = "s3-access-logs/"
}

# ============================================================================
# EKS CLUSTER (continued in next file due to size)
# ============================================================================

# Note: EKS cluster, node groups, and Kubernetes provider configuration
# will be in 05-eks.tf

# ============================================================================
# OUTPUTS
# ============================================================================

output "vpc_id" {
  value = aws_vpc.main.id
  description = "VPC ID"
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
  description = "Private subnet IDs"
}

output "rds_endpoint" {
  value = aws_db_instance.audit_trail.endpoint
  description = "RDS database endpoint"
  sensitive = true
}

output "rds_database_name" {
  value = aws_db_instance.audit_trail.db_name
  description = "RDS database name"
}

output "s3_backup_bucket" {
  value = aws_s3_bucket.audit_backups.id
  description = "S3 bucket for audit trail backups"
}

output "kms_rds_key_id" {
  value = aws_kms_key.rds.id
  description = "KMS key ID for RDS encryption"
}

output "kms_s3_key_id" {
  value = aws_kms_key.s3.id
  description = "KMS key ID for S3 encryption"
}

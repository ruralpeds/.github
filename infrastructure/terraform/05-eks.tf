# Terraform: EKS Cluster Configuration
# Compliance: IEC 62304 Deployment & Control, HIPAA Security Rule
# Version: 1.0 (April 25, 2026)

# ============================================================================
# EKS CLUSTER
# ============================================================================

# IAM role for EKS cluster
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# Security group for EKS control plane
resource "aws_security_group" "eks_control_plane" {
  name        = "${var.project_name}-eks-control-plane-sg"
  description = "Security group for EKS control plane"
  vpc_id      = aws_vpc.main.id

  # Allow traffic from worker nodes
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-eks-control-plane-sg"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name            = "${var.project_name}-cluster"
  role_arn        = aws_iam_role.eks_cluster.arn
  version         = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.eks_control_plane.id]
  }

  # Enable logging
  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  # Encryption (HIPAA §164.312(a)(2)(ii))
  encryption_config {
    provider {
      key_arn = aws_kms_key.rds.arn
    }
    resources = ["secrets"]
  }

  tags = {
    Name = "${var.project_name}-cluster"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
    aws_cloudwatch_log_group.eks_cluster
  ]
}

# CloudWatch log group for EKS cluster
resource "aws_cloudwatch_log_group" "eks_cluster" {
  name              = "/aws/eks/${var.project_name}-cluster/cluster"
  retention_in_days = var.eks_log_retention_days

  tags = {
    Name = "${var.project_name}-eks-logs"
  }
}

# ============================================================================
# EKS NODE GROUPS
# ============================================================================

# IAM role for EKS nodes
resource "aws_iam_role" "eks_node" {
  name = "${var.project_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_node_policy" {
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Policy for RDS access from nodes
resource "aws_iam_role_policy" "eks_node_rds" {
  name = "${var.project_name}-eks-node-rds-policy"
  role = aws_iam_role.eks_node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBClusters"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.db_password.arn
      }
    ]
  })
}

# Policy for S3 backup access from nodes
resource "aws_iam_role_policy" "eks_node_s3" {
  name = "${var.project_name}-eks-node-s3-policy"
  role = aws_iam_role.eks_node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.audit_backups.arn,
          "${aws_s3_bucket.audit_backups.arn}/*"
        ]
      }
    ]
  })
}

# Policy for KMS key access from nodes
resource "aws_iam_role_policy" "eks_node_kms" {
  name = "${var.project_name}-eks-node-kms-policy"
  role = aws_iam_role.eks_node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = [
          aws_kms_key.rds.arn,
          aws_kms_key.s3.arn
        ]
      }
    ]
  })
}

# Launch template for nodes (to ensure security settings)
resource "aws_launch_template" "eks_nodes" {
  name_prefix = "${var.project_name}-eks-node-"
  description = "Launch template for EKS nodes with security settings"

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = var.eks_node_disk_size_gb
      volume_type           = "gp3"
      delete_on_termination = true
      encrypted             = true
      kms_key_id            = aws_kms_key.s3.arn
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 only (security best practice)
    http_put_response_hop_limit = 2
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "${var.project_name}-eks-node"
    }
  }
}

# EKS Node Group (platform workloads)
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-node-group"
  node_role_arn   = aws_iam_role.eks_node.arn

  subnet_ids = aws_subnet.private[*].id

  scaling_config {
    min_size     = 3
    max_size     = 10
    desired_size = var.eks_node_count
  }

  instance_types = [var.eks_node_instance_type]

  launch_template {
    id      = aws_launch_template.eks_nodes.id
    version = aws_launch_template.eks_nodes.latest_version_number
  }

  # Use on-demand instances (Spot only allowed for non-critical workloads)
  capacity_type = var.enable_spot_instances ? "SPOT" : "ON_DEMAND"

  tags = {
    Name = "${var.project_name}-node-group"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
    aws_iam_role_policy.eks_node_rds,
    aws_iam_role_policy.eks_node_s3,
    aws_iam_role_policy.eks_node_kms
  ]
}

# ============================================================================
# KUBERNETES PROVIDER (requires EKS cluster)
# ============================================================================

data "aws_eks_cluster_auth" "main" {
  name = aws_eks_cluster.main.name
}

provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}

# ============================================================================
# KUBERNETES NAMESPACES
# ============================================================================

resource "kubernetes_namespace" "platform" {
  metadata {
    name = "platform"
    labels = {
      "compliance" = "hipaa,fda-medical-device"
      "version"    = "v1.0.0"
    }
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      "app" = "monitoring"
    }
  }
}

resource "kubernetes_namespace" "ingress_nginx" {
  metadata {
    name = "ingress-nginx"
  }
}

# ============================================================================
# RBAC: SERVICE ACCOUNTS & ROLES
# ============================================================================

# Service Account for platform API
resource "kubernetes_service_account" "platform_api" {
  metadata {
    name      = "platform-api"
    namespace = kubernetes_namespace.platform.metadata[0].name
  }
}

# Role for platform API (minimal permissions)
resource "kubernetes_role" "platform_api" {
  metadata {
    name      = "platform-api"
    namespace = kubernetes_namespace.platform.metadata[0].name
  }

  rule {
    api_groups = [""]
    resources  = ["configmaps"]
    verbs      = ["get", "list"]
  }

  rule {
    api_groups = [""]
    resources  = ["secrets"]
    verbs      = ["get"]
  }

  rule {
    api_groups = [""]
    resources  = ["pods"]
    verbs      = ["get", "list"]
  }
}

# RoleBinding
resource "kubernetes_role_binding" "platform_api" {
  metadata {
    name      = "platform-api"
    namespace = kubernetes_namespace.platform.metadata[0].name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.platform_api.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.platform_api.metadata[0].name
    namespace = kubernetes_namespace.platform.metadata[0].name
  }
}

# ============================================================================
# NETWORK POLICIES
# ============================================================================

resource "kubernetes_network_policy" "platform" {
  metadata {
    name      = "platform-network-policy"
    namespace = kubernetes_namespace.platform.metadata[0].name
  }

  spec {
    pod_selector {
      match_labels = {
        "app" = "platform"
      }
    }

    policy_types = ["Ingress", "Egress"]

    # Ingress: Allow from ingress controller
    ingress {
      from {
        namespace_selector {
          match_labels = {
            "name" = "ingress-nginx"
          }
        }
      }

      ports {
        protocol = "TCP"
        port     = "8080"
      }
    }

    # Egress: Allow to DNS
    egress {
      to {
        pod_selector {
          match_labels = {
            "k8s-app" = "kube-dns"
          }
        }
      }

      ports {
        protocol = "UDP"
        port     = "53"
      }
    }

    # Egress: Allow to audit trail database
    egress {
      to {
        pod_selector {
          match_labels = {
            "app" = "audit-trail-db"
          }
        }
      }

      ports {
        protocol = "TCP"
        port     = "5432"
      }
    }

    # Egress: Allow to external HTTPS (EHR integration)
    egress {
      to {
        namespace_selector {}
      }

      ports {
        protocol = "TCP"
        port     = "443"
      }
    }
  }
}

# ============================================================================
# HELM RELEASES: Monitoring Stack (Prometheus + Grafana)
# ============================================================================

# Prometheus (if enabled)
resource "helm_release" "prometheus" {
  count = var.enable_prometheus ? 1 : 0

  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "51.0.0"

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "30d"
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }

  depends_on = [aws_eks_node_group.main]
}

# Grafana (if enabled)
resource "helm_release" "grafana" {
  count = var.enable_grafana ? 1 : 0

  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "6.58.0"

  set {
    name  = "adminPassword"
    value = random_password.grafana_password.result
  }

  depends_on = [aws_eks_node_group.main]
}

# Generate random password for Grafana
resource "random_password" "grafana_password" {
  length  = 32
  special = true
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "eks_cluster_id" {
  value       = aws_eks_cluster.main.id
  description = "EKS cluster ID"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "EKS cluster API endpoint"
}

output "eks_cluster_arn" {
  value       = aws_eks_cluster.main.arn
  description = "EKS cluster ARN"
}

output "eks_node_group_id" {
  value       = aws_eks_node_group.main.id
  description = "EKS node group ID"
}

output "grafana_admin_password" {
  value       = try(random_password.grafana_password.result, null)
  sensitive   = true
  description = "Grafana admin password (store in secrets manager)"
}

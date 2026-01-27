# Platform Engineering Development Guide

Staff-level guidelines for building and operating internal developer platforms, infrastructure automation, and reliability engineering.

---

## Overview

This guide applies to:

- Infrastructure as Code (Terraform, Pulumi, CDK)
- Kubernetes and container orchestration
- CI/CD pipelines and GitOps
- Internal Developer Platforms (IDPs)
- Observability systems (metrics, logs, traces)
- Service mesh and networking
- Security and compliance automation

### Key Principles

1. **Platform as Product** - Your internal customers are developers; treat the platform like a product
2. **Self-Service First** - Enable teams to move fast without becoming a bottleneck
3. **Reliability Engineering** - Define SLOs, measure SLIs, maintain error budgets
4. **Security by Default** - Bake security into the golden path, not bolted on after
5. **Cost Consciousness** - FinOps is everyone's responsibility

### Technology Stack

| Layer | Technology |
|-------|------------|
| IaC | Terraform, Pulumi, AWS CDK |
| Container Orchestration | Kubernetes, EKS/GKE/AKS |
| GitOps | Argo CD, Flux |
| CI/CD | GitHub Actions, GitLab CI, Tekton |
| Observability | Prometheus, Grafana, Loki, Tempo, Jaeger |
| Service Mesh | Istio, Linkerd, Cilium |
| Policy | OPA/Gatekeeper, Kyverno |
| Secrets | Vault, External Secrets, SOPS |

---

## Infrastructure as Code

### Module Structure

```
modules/
├── networking/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   └── dns/
├── compute/
│   ├── eks-cluster/
│   └── node-groups/
├── data/
│   ├── rds/
│   └── redis/
└── security/
    ├── iam-roles/
    └── kms/

environments/
├── dev/
│   ├── main.tf
│   ├── terraform.tfvars
│   └── backend.tf
├── staging/
└── production/
```

### Terraform Best Practices

```hcl
# Always use specific provider versions
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "env/production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Use locals for computed values
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = var.team
    CostCenter  = var.cost_center
  }
}

# Meaningful resource naming
resource "aws_eks_cluster" "main" {
  name     = "${var.project}-${var.environment}"
  role_arn = aws_iam_role.cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = var.environment != "production"
  }

  tags = local.common_tags
}
```

### State Management

- **Remote State**: Always use remote backends (S3, GCS, Terraform Cloud)
- **State Locking**: Enable DynamoDB/GCS locking to prevent concurrent modifications
- **State Isolation**: Separate state files per environment
- **Sensitive Data**: Never store secrets in state; use external secret managers

### Drift Detection

```yaml
# GitHub Actions workflow for drift detection
name: Terraform Drift Detection

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  drift-detection:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, production]
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Plan
        run: |
          cd environments/${{ matrix.environment }}
          terraform init
          terraform plan -detailed-exitcode -out=plan.out
        continue-on-error: true
        id: plan
        
      - name: Alert on Drift
        if: steps.plan.outcome == 'failure'
        run: |
          # Send alert to Slack/PagerDuty
          echo "Drift detected in ${{ matrix.environment }}"
```

---

## Kubernetes Patterns

### Resource Management

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  labels:
    app.kubernetes.io/name: api-server
    app.kubernetes.io/component: backend
    app.kubernetes.io/managed-by: helm
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: api-server
  template:
    metadata:
      labels:
        app.kubernetes.io/name: api-server
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      # Always set resource limits
      containers:
        - name: api-server
          image: company/api-server:v1.2.3
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          
          # Always configure probes
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          
          # Security context
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
      
      # Pod-level security
      securityContext:
        fsGroup: 1000
      
      # Spread across nodes
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: api-server
```

### Helm Chart Structure

```
charts/
└── api-server/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-dev.yaml
    ├── values-staging.yaml
    ├── values-production.yaml
    ├── templates/
    │   ├── _helpers.tpl
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── hpa.yaml
    │   ├── pdb.yaml
    │   ├── networkpolicy.yaml
    │   └── servicemonitor.yaml
    └── tests/
        └── test-connection.yaml
```

### Network Policies

```yaml
# Default deny all ingress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
# Allow specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-server-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: api-server
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: frontend
      ports:
        - protocol: TCP
          port: 8080
```

---

## CI/CD & GitOps

### Pipeline Architecture

```yaml
# GitHub Actions - Production-grade pipeline
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Stage 1: Validate
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Lint Dockerfile
        uses: hadolint/hadolint-action@v3.1.0
        
      - name: Lint Kubernetes manifests
        run: |
          helm lint ./charts/*
          kubeval ./manifests/*.yaml
          
      - name: Security scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

  # Stage 2: Test
  test:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: make test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # Stage 3: Build
  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Sign image
        run: cosign sign --yes ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}

  # Stage 4: Deploy to staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Update GitOps repo
        run: |
          # Update image tag in GitOps repository
          # Argo CD will detect and sync

  # Stage 5: Deploy to production
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Update GitOps repo
        run: |
          # Update image tag with approval gate
```

### Argo CD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-server
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/company/gitops-repo.git
    targetRevision: HEAD
    path: apps/api-server/overlays/production
    
  destination:
    server: https://kubernetes.default.svc
    namespace: production
    
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

---

## Observability

### Metrics (Prometheus)

```yaml
# ServiceMonitor for automatic scraping
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-server
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: api-server
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### SLO Definition

```yaml
# Sloth SLO definition
apiVersion: sloth.slok.dev/v1
kind: PrometheusServiceLevel
metadata:
  name: api-server-slo
spec:
  service: "api-server"
  labels:
    team: platform
  slos:
    - name: "requests-availability"
      objective: 99.9
      description: "99.9% of requests should be successful"
      sli:
        events:
          errorQuery: sum(rate(http_requests_total{job="api-server",status=~"5.."}[{{.window}}]))
          totalQuery: sum(rate(http_requests_total{job="api-server"}[{{.window}}]))
      alerting:
        name: ApiServerHighErrorRate
        pageAlert:
          labels:
            severity: critical
        ticketAlert:
          labels:
            severity: warning
            
    - name: "requests-latency"
      objective: 99.0
      description: "99% of requests should be faster than 500ms"
      sli:
        events:
          errorQuery: sum(rate(http_request_duration_seconds_bucket{job="api-server",le="0.5"}[{{.window}}]))
          totalQuery: sum(rate(http_request_duration_seconds_count{job="api-server"}[{{.window}}]))
```

### Logging (Structured)

```go
// Always use structured logging
logger.Info("request processed",
    "method", r.Method,
    "path", r.URL.Path,
    "status", status,
    "duration_ms", duration.Milliseconds(),
    "request_id", requestID,
    "user_id", userID,
)
```

### Distributed Tracing

```go
// OpenTelemetry instrumentation
func handleRequest(w http.ResponseWriter, r *http.Request) {
    ctx, span := tracer.Start(r.Context(), "handleRequest",
        trace.WithAttributes(
            attribute.String("http.method", r.Method),
            attribute.String("http.url", r.URL.String()),
        ),
    )
    defer span.End()
    
    // Pass context to downstream calls
    result, err := db.QueryContext(ctx, query)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
    }
}
```

---

## Security

### Policy as Code (OPA/Gatekeeper)

```yaml
# Require resource limits
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredResources
metadata:
  name: require-resource-limits
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces:
      - production
      - staging
  parameters:
    limits:
      - cpu
      - memory
    requests:
      - cpu
      - memory
```

### Secrets Management

```yaml
# External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: api-secrets
    creationPolicy: Owner
  data:
    - secretKey: database-url
      remoteRef:
        key: secret/data/api-server
        property: database_url
    - secretKey: api-key
      remoteRef:
        key: secret/data/api-server
        property: api_key
```

### Supply Chain Security

```yaml
# Kyverno policy - require signed images
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-image-signature
spec:
  validationFailureAction: Enforce
  background: false
  rules:
    - name: verify-signature
      match:
        any:
          - resources:
              kinds:
                - Pod
      verifyImages:
        - imageReferences:
            - "ghcr.io/company/*"
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/company/*"
                    issuer: "https://token.actions.githubusercontent.com"
```

---

## Developer Experience

### Golden Paths

Provide opinionated, well-supported paths for common tasks:

```yaml
# Backstage Software Template
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: microservice-template
  title: Production Microservice
  description: Create a production-ready microservice with all platform integrations
spec:
  owner: platform-team
  type: service
  
  parameters:
    - title: Service Information
      required:
        - name
        - owner
      properties:
        name:
          title: Service Name
          type: string
          pattern: '^[a-z0-9-]+$'
        owner:
          title: Owner Team
          type: string
          ui:field: OwnerPicker
        
    - title: Infrastructure
      properties:
        database:
          title: Database
          type: string
          enum: [none, postgresql, mysql]
        cache:
          title: Cache
          type: string
          enum: [none, redis, memcached]
          
  steps:
    - id: fetch
      name: Fetch Template
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: ${{ parameters.name }}
          owner: ${{ parameters.owner }}
          
    - id: publish
      name: Publish to GitHub
      action: publish:github
      input:
        repoUrl: github.com?repo=${{ parameters.name }}&owner=company
        
    - id: register
      name: Register in Catalog
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: /catalog-info.yaml
```

### Self-Service Portal

Key capabilities to provide:

- **Environment Provisioning**: Spin up dev/preview environments on demand
- **Database Access**: Request read replicas or sanitized snapshots
- **Secret Management**: Self-service secret rotation
- **Monitoring Dashboards**: Auto-generated per-service dashboards
- **Cost Visibility**: Per-team/per-service cost attribution

---

## Testing Infrastructure

### Terraform Testing

```hcl
# tests/vpc_test.go
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVpcModule(t *testing.T) {
    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../modules/networking/vpc",
        Vars: map[string]interface{}{
            "environment": "test",
            "cidr_block":  "10.0.0.0/16",
        },
    })

    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)

    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)
}
```

### Kubernetes Testing

```yaml
# Helm chart test
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "api-server.fullname" . }}-test"
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: test
      image: curlimages/curl:latest
      command: ['curl']
      args:
        - '--fail'
        - '--silent'
        - 'http://{{ include "api-server.fullname" . }}:{{ .Values.service.port }}/healthz'
  restartPolicy: Never
```

### Chaos Engineering

```yaml
# Chaos Mesh - Pod failure experiment
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: api-server-pod-failure
  namespace: chaos-testing
spec:
  action: pod-failure
  mode: one
  duration: "30s"
  selector:
    namespaces:
      - staging
    labelSelectors:
      app.kubernetes.io/name: api-server
  scheduler:
    cron: "@every 2h"
```

---

## Definition of Done

### Infrastructure Change

- [ ] IaC passes linting and validation
- [ ] Plan reviewed and approved
- [ ] Changes tested in non-production first
- [ ] Rollback procedure documented
- [ ] Monitoring/alerting in place
- [ ] Runbook updated
- [ ] Cost impact assessed
- [ ] Security review completed

### Platform Feature

- [ ] Self-service capable (no manual intervention needed)
- [ ] Documentation complete (how-to, troubleshooting)
- [ ] Golden path integrated
- [ ] Metrics exposed for SLOs
- [ ] Tested with real workloads
- [ ] Feedback collected from users
- [ ] Support runbook created

---

## Common Pitfalls

### 1. Building a Ticketing System

❌ **Wrong**: Developers file tickets for every infrastructure change

✅ **Right**: Build self-service automation; platform team handles the platform, not tickets

### 2. Ignoring Developer Experience

❌ **Wrong**: Complex, undocumented processes that require tribal knowledge

✅ **Right**: Golden paths with sensible defaults, clear documentation, quick feedback loops

### 3. Over-Engineering

❌ **Wrong**: Kubernetes cluster for a team of 5 running 3 services

✅ **Right**: Right-size infrastructure to actual needs; complexity has ongoing costs

### 4. No Error Budgets

❌ **Wrong**: "Five nines or nothing" with no measurement

✅ **Right**: Define SLOs, measure SLIs, use error budgets to balance reliability and velocity

### 5. Secrets in Git

❌ **Wrong**: Committing `.env` files or hardcoding credentials

✅ **Right**: External secret management (Vault, AWS Secrets Manager) with dynamic injection

---

## Resources

- [Platform Engineering Maturity Model](https://platformengineering.org/maturity-model)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Kubernetes Patterns](https://k8spatterns.io/)
- [Site Reliability Engineering (Google)](https://sre.google/sre-book/table-of-contents/)
- [The Platform Engineering Guide](https://platformengineering.org/)
- [CNCF Landscape](https://landscape.cncf.io/)

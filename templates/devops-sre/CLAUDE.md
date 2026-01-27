# DevOps/SRE Development Guide

Staff-level guidelines for building and operating reliable, scalable production systems with a focus on operational excellence.

---

## Overview

This guide applies to:

- Site Reliability Engineering (SRE) practices
- Production operations and incident management
- Monitoring, alerting, and observability systems
- Capacity planning and performance engineering
- Disaster recovery and business continuity
- Toil reduction and automation
- Change management and safe deployments

### Key Principles

1. **Reliability is a Feature** - Users don't distinguish between "the app is slow" and "the app is broken"
2. **Error Budgets Over Perfection** - 100% reliability is the wrong target; balance reliability with velocity
3. **Automate Toil Away** - If you're doing it manually more than twice, automate it
4. **Observability First** - You can't fix what you can't measure
5. **Blameless Culture** - Incidents are learning opportunities, not blame games

### Technology Stack

| Layer | Primary | Alternatives |
|-------|---------|--------------|
| Metrics | Prometheus + Grafana | Datadog, New Relic, InfluxDB |
| Logging | Loki, ELK Stack | Splunk, Datadog Logs |
| Tracing | Jaeger, Tempo | Zipkin, X-Ray, Honeycomb |
| Alerting | Alertmanager, PagerDuty | OpsGenie, VictorOps |
| Incident Management | PagerDuty, Incident.io | OpsGenie, Squadcast |
| Status Pages | Statuspage, Instatus | Cachet, Better Uptime |
| Chaos Engineering | Chaos Mesh, Litmus | Gremlin, AWS FIS |
| Load Testing | k6, Locust | Gatling, JMeter |
| Feature Flags | LaunchDarkly, Unleash | Split, Flagsmith |

---

## SRE Fundamentals

### The SRE Hierarchy of Needs

```
                    ┌─────────────────┐
                    │   Continuous    │  ← Experimentation, A/B testing
                    │   Improvement   │
                ┌───┴─────────────────┴───┐
                │      Release           │  ← Safe, frequent deployments
                │      Engineering       │
            ┌───┴─────────────────────────┴───┐
            │        Observability            │  ← Metrics, logs, traces
            │                                 │
        ┌───┴─────────────────────────────────┴───┐
        │           Incident Response            │  ← Detection, mitigation
        │                                         │
    ┌───┴─────────────────────────────────────────┴───┐
    │              Monitoring/Alerting               │  ← Know when things break
    │                                                 │
┌───┴─────────────────────────────────────────────────┴───┐
│                     Reliability                         │  ← Core availability
└─────────────────────────────────────────────────────────┘
```

### SLOs, SLIs, and Error Budgets

**SLI (Service Level Indicator)**: A quantitative measure of service behavior

```yaml
# Example SLIs
availability_sli:
  description: "Proportion of successful requests"
  formula: "successful_requests / total_requests"
  
latency_sli:
  description: "Proportion of requests faster than threshold"
  formula: "requests_under_500ms / total_requests"
  
throughput_sli:
  description: "Requests processed per second"
  formula: "count(requests) / time_window"
```

**SLO (Service Level Objective)**: Target value for an SLI

```yaml
# Example SLOs
api_availability:
  sli: availability_sli
  target: 99.9%
  window: 30 days
  
api_latency:
  sli: latency_sli
  target: 99%
  threshold: 500ms
  window: 30 days
```

**Error Budget**: The allowed amount of unreliability

```python
# Error budget calculation
slo_target = 0.999  # 99.9%
window_minutes = 30 * 24 * 60  # 30 days

error_budget_minutes = window_minutes * (1 - slo_target)
# = 43.2 minutes of downtime allowed per month

# If we've used 30 minutes, we have 13.2 minutes remaining
# If budget exhausted → slow down deployments, focus on reliability
```

### Error Budget Policy

```yaml
# error-budget-policy.yaml
thresholds:
  - level: healthy
    budget_remaining: ">50%"
    actions:
      - "Normal development velocity"
      - "Experimental features allowed"
      - "Risk-tolerant deployments"
      
  - level: caution
    budget_remaining: "25-50%"
    actions:
      - "Review recent changes for reliability impact"
      - "Increase testing coverage"
      - "Limit risky deployments"
      
  - level: critical
    budget_remaining: "10-25%"
    actions:
      - "Reliability improvements prioritized"
      - "Feature freeze for non-critical work"
      - "Mandatory rollback plans"
      
  - level: exhausted
    budget_remaining: "<10%"
    actions:
      - "Full feature freeze"
      - "All hands on reliability"
      - "Post-incident review required for any deploy"
```

---

## Monitoring & Alerting

### The Four Golden Signals

```yaml
# Monitor these for every service
golden_signals:
  latency:
    description: "Time to service a request"
    metrics:
      - http_request_duration_seconds_histogram
    alerts:
      - p50 > 200ms
      - p99 > 1000ms
      
  traffic:
    description: "Demand on the system"
    metrics:
      - http_requests_total
    alerts:
      - sudden_drop > 50%
      - sudden_spike > 200%
      
  errors:
    description: "Rate of failed requests"
    metrics:
      - http_requests_total{status=~"5.."}
    alerts:
      - error_rate > 1%
      - error_rate > 5% (critical)
      
  saturation:
    description: "How full the system is"
    metrics:
      - cpu_usage_percent
      - memory_usage_percent
      - disk_usage_percent
    alerts:
      - cpu > 80%
      - memory > 85%
      - disk > 90%
```

### Alert Quality Guidelines

```yaml
# Good alerts are:
alert_quality_checklist:
  actionable: "Every alert should have a clear action to take"
  urgent: "If it can wait until morning, it shouldn't page"
  relevant: "Alert fatigue kills on-call engineers"
  
# Alert severity levels
severity_definitions:
  critical:
    description: "Service is down or severely degraded"
    response_time: "Immediate (page on-call)"
    examples:
      - "API error rate > 10%"
      - "Database unreachable"
      - "All pods in CrashLoopBackOff"
      
  warning:
    description: "Service degradation or approaching limits"
    response_time: "Within 1 hour (Slack notification)"
    examples:
      - "Disk usage > 80%"
      - "Error rate > 1%"
      - "Latency p99 > 2s"
      
  info:
    description: "Notable events, no action needed"
    response_time: "Next business day"
    examples:
      - "Deployment completed"
      - "Certificate expires in 30 days"
      - "Unusual traffic pattern"
```

### Prometheus Alerting Rules

```yaml
# prometheus-alerts.yaml
groups:
  - name: api-server
    rules:
      # High Error Rate
      - alert: APIHighErrorRate
        expr: |
          sum(rate(http_requests_total{job="api-server",status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total{job="api-server"}[5m]))
          > 0.01
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "API error rate above 1%"
          description: "Error rate is {{ $value | humanizePercentage }}"
          runbook_url: "https://wiki.example.com/runbooks/api-high-error-rate"
          
      # High Latency
      - alert: APIHighLatency
        expr: |
          histogram_quantile(0.99, 
            sum(rate(http_request_duration_seconds_bucket{job="api-server"}[5m])) by (le)
          ) > 1
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "API p99 latency above 1 second"
          description: "p99 latency is {{ $value | humanizeDuration }}"
          runbook_url: "https://wiki.example.com/runbooks/api-high-latency"
          
      # SLO Burn Rate (Multi-window)
      - alert: APIAvailabilitySLOBreach
        expr: |
          (
            # Fast burn (last 1h)
            sum(rate(http_requests_total{job="api-server",status=~"5.."}[1h]))
            /
            sum(rate(http_requests_total{job="api-server"}[1h]))
            > (14.4 * 0.001)  # 14.4x burn rate for 1h window
          )
          and
          (
            # Slow burn (last 6h)
            sum(rate(http_requests_total{job="api-server",status=~"5.."}[6h]))
            /
            sum(rate(http_requests_total{job="api-server"}[6h]))
            > (6 * 0.001)  # 6x burn rate for 6h window
          )
        for: 2m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "API availability SLO at risk"
          description: "Error budget burn rate indicates SLO breach within window"
```

---

## Incident Management

### Incident Severity Levels

```yaml
severity_levels:
  sev1:
    name: "Critical"
    description: "Complete service outage or data loss"
    response_time: "Immediate"
    communication: "Status page, exec notification, all-hands war room"
    examples:
      - "Production database down"
      - "Security breach in progress"
      - "Payment processing completely failed"
      
  sev2:
    name: "Major"
    description: "Significant degradation affecting many users"
    response_time: "15 minutes"
    communication: "Status page, stakeholder notification"
    examples:
      - "50% of API requests failing"
      - "Search functionality broken"
      - "Mobile app unable to sync"
      
  sev3:
    name: "Minor"
    description: "Limited impact, workaround available"
    response_time: "1 hour"
    communication: "Internal Slack channel"
    examples:
      - "Admin panel slow"
      - "Export feature broken"
      - "Non-critical background jobs failing"
      
  sev4:
    name: "Low"
    description: "Minimal impact, cosmetic issues"
    response_time: "Next business day"
    communication: "Ticket created"
    examples:
      - "UI alignment issues"
      - "Log formatting errors"
      - "Dev environment issues"
```

### Incident Response Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    INCIDENT LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────────┐   │
│  │ Detect  │──▶│ Respond │──▶│ Mitigate │──▶│   Resolve    │   │
│  └─────────┘   └─────────┘   └──────────┘   └──────────────┘   │
│       │             │              │               │            │
│       ▼             ▼              ▼               ▼            │
│  - Alerting    - Page on-call  - Stop bleeding  - Root cause   │
│  - Monitoring  - Declare        - Rollback       - Fix forward  │
│  - User report - Assign roles  - Scale up       - Deploy fix   │
│                - War room      - Failover                      │
│                                                                 │
│                         │                                       │
│                         ▼                                       │
│              ┌──────────────────┐                               │
│              │    Postmortem    │                               │
│              └──────────────────┘                               │
│                         │                                       │
│                         ▼                                       │
│  - Timeline  - Root cause  - Action items  - Share learnings   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Incident Commander Role

```yaml
incident_commander_responsibilities:
  coordination:
    - "Single point of contact for incident"
    - "Assign roles (communications, technical lead, scribe)"
    - "Make decisions when consensus isn't reached"
    - "Escalate when needed"
    
  communication:
    - "Regular status updates (every 15-30 min)"
    - "Stakeholder management"
    - "Status page updates"
    - "Executive briefings for Sev1"
    
  process:
    - "Start incident channel/war room"
    - "Track timeline of events"
    - "Ensure postmortem is scheduled"
    - "Close out incident when resolved"

# Incident channel template
slack_channel_template:
  name: "inc-{date}-{short-description}"
  topic: "SEV{level} | IC: @{commander} | Status: {status}"
  pinned_messages:
    - "Incident summary and current status"
    - "Timeline of events"
    - "Runbook links"
```

---

## On-Call Best Practices

### On-Call Rotation

```yaml
oncall_structure:
  rotation_length: "1 week"
  handoff_day: "Monday 9am local time"
  coverage: "24/7"
  
  roles:
    primary:
      responsibilities:
        - "First responder to all pages"
        - "Initial triage and escalation"
        - "Document all incidents"
      response_sla: "15 minutes"
      
    secondary:
      responsibilities:
        - "Backup if primary unavailable"
        - "Help with prolonged incidents"
        - "Escalation point"
      response_sla: "30 minutes"
      
  escalation_path:
    - "Primary on-call"
    - "Secondary on-call"
    - "Team lead"
    - "Engineering manager"
    - "VP Engineering"
    
  handoff_checklist:
    - "Review active incidents"
    - "Check pending alerts"
    - "Verify pager is working"
    - "Review recent deployments"
    - "Check error budget status"
```

### On-Call Health

```yaml
oncall_health_metrics:
  targets:
    pages_per_shift: "< 10"
    pages_per_night: "< 2"
    mean_time_to_acknowledge: "< 5 minutes"
    mean_time_to_resolve: "< 1 hour"
    false_positive_rate: "< 10%"
    
  burnout_prevention:
    - "Compensatory time off after heavy on-call"
    - "No back-to-back on-call weeks"
    - "Follow-the-sun rotation for global teams"
    - "On-call load balancing across team"
    - "Regular review of alert quality"
```

---

## Runbooks

### Runbook Template

```markdown
# Runbook: [Alert/Issue Name]

## Overview
Brief description of what this runbook addresses.

## Severity
- **Impact**: [What breaks when this happens]
- **Urgency**: [How quickly must this be resolved]

## Prerequisites
- Access to: [systems, dashboards, tools]
- Permissions: [required roles/access]

## Symptoms
- Alert: `AlertName` fires
- Users report: [symptoms]
- Dashboards show: [metrics]

## Diagnosis Steps
1. Check [specific metric/log]
   ```bash
   kubectl logs -l app=api-server --tail=100
   ```
2. Verify [dependency/connection]
3. Check recent changes
   ```bash
   kubectl rollout history deployment/api-server
   ```

## Resolution Steps

### Quick Mitigation (stop the bleeding)
1. Scale up if capacity issue:
   ```bash
   kubectl scale deployment/api-server --replicas=10
   ```
2. Rollback if recent deployment:
   ```bash
   kubectl rollout undo deployment/api-server
   ```

### Root Cause Fix
1. [Step-by-step fix instructions]
2. [Verification commands]

## Escalation
- If not resolved in 30 minutes, escalate to: [team/person]
- For data loss scenarios, immediately notify: [person]

## Prevention
- Related improvements: [links to tickets]
- Monitoring gaps: [what to add]

## History
| Date | Author | Change |
|------|--------|--------|
| 2025-01-15 | @engineer | Initial version |
```

---

## Capacity Planning

### Capacity Metrics

```yaml
capacity_dimensions:
  compute:
    metrics:
      - cpu_utilization
      - memory_utilization
      - pod_count
    thresholds:
      warning: 70%
      critical: 85%
      
  storage:
    metrics:
      - disk_usage_percent
      - iops_utilization
      - throughput_utilization
    thresholds:
      warning: 75%
      critical: 90%
      
  network:
    metrics:
      - bandwidth_utilization
      - connection_count
      - packet_loss_rate
    thresholds:
      warning: 60%
      critical: 80%
      
  database:
    metrics:
      - connection_pool_usage
      - query_latency_p99
      - replication_lag
    thresholds:
      warning: 70%
      critical: 85%
```

### Load Testing Strategy

```yaml
load_testing:
  types:
    smoke:
      description: "Verify system handles minimal load"
      duration: "5 minutes"
      users: "10"
      frequency: "Every deployment"
      
    load:
      description: "Test expected production load"
      duration: "30 minutes"
      users: "Expected peak * 1.5"
      frequency: "Weekly"
      
    stress:
      description: "Find breaking point"
      duration: "Until failure"
      users: "Ramp until errors"
      frequency: "Monthly"
      
    soak:
      description: "Test sustained load over time"
      duration: "24 hours"
      users: "Expected average"
      frequency: "Before major releases"

# k6 example
k6_load_test: |
  import http from 'k6/http';
  import { check, sleep } from 'k6';
  
  export const options = {
    stages: [
      { duration: '5m', target: 100 },   // Ramp up
      { duration: '30m', target: 100 },  // Stay at peak
      { duration: '5m', target: 0 },     // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(99)<500'],
      http_req_failed: ['rate<0.01'],
    },
  };
  
  export default function () {
    const res = http.get('https://api.example.com/health');
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
  }
```

---

## Change Management

### Deployment Safety

```yaml
deployment_checklist:
  pre_deploy:
    - "All tests passing in CI"
    - "Code reviewed and approved"
    - "Feature flags in place for risky changes"
    - "Rollback plan documented"
    - "Monitoring dashboards open"
    - "On-call engineer aware"
    
  during_deploy:
    - "Watch error rates during rollout"
    - "Monitor latency metrics"
    - "Check application logs for errors"
    - "Verify health checks passing"
    
  post_deploy:
    - "Smoke test critical paths"
    - "Compare metrics to baseline"
    - "Check for error rate increases"
    - "Update deployment log"

# Progressive delivery stages
progressive_delivery:
  canary:
    traffic_percentage: 5%
    duration: "15 minutes"
    success_criteria:
      - error_rate < baseline * 1.1
      - latency_p99 < baseline * 1.2
      
  partial:
    traffic_percentage: 25%
    duration: "30 minutes"
    success_criteria:
      - error_rate < baseline * 1.05
      - latency_p99 < baseline * 1.1
      
  majority:
    traffic_percentage: 75%
    duration: "1 hour"
    success_criteria:
      - error_rate ≈ baseline
      - latency_p99 ≈ baseline
      
  full:
    traffic_percentage: 100%
    bake_time: "24 hours"
```

### Rollback Procedures

```yaml
rollback_triggers:
  automatic:
    - "Error rate > 5% for 5 minutes"
    - "Latency p99 > 3x baseline for 10 minutes"
    - "Health check failures > 50%"
    
  manual:
    - "User-reported critical bugs"
    - "Security vulnerability discovered"
    - "Data corruption detected"

rollback_commands:
  kubernetes:
    immediate: |
      kubectl rollout undo deployment/api-server
    to_specific_version: |
      kubectl rollout undo deployment/api-server --to-revision=42
    verify: |
      kubectl rollout status deployment/api-server
      
  argocd:
    immediate: |
      argocd app rollback api-server
    sync_to_previous: |
      argocd app sync api-server --revision HEAD~1
```

---

## Disaster Recovery

### RTO and RPO Definitions

```yaml
recovery_objectives:
  tier1_critical:
    services:
      - "Payment processing"
      - "User authentication"
      - "Core API"
    rto: "15 minutes"  # Recovery Time Objective
    rpo: "0 minutes"   # Recovery Point Objective (no data loss)
    strategy: "Active-active multi-region"
    
  tier2_important:
    services:
      - "Search functionality"
      - "Notifications"
      - "Analytics ingestion"
    rto: "1 hour"
    rpo: "15 minutes"
    strategy: "Warm standby with automated failover"
    
  tier3_standard:
    services:
      - "Admin dashboard"
      - "Reporting"
      - "Batch processing"
    rto: "4 hours"
    rpo: "1 hour"
    strategy: "Cold standby with manual failover"
```

### Backup Strategy

```yaml
backup_strategy:
  databases:
    type: "Continuous replication + daily snapshots"
    retention:
      continuous: "7 days"
      daily: "30 days"
      weekly: "1 year"
    testing: "Monthly restore test"
    location: "Cross-region"
    
  object_storage:
    type: "Cross-region replication"
    versioning: "Enabled"
    retention: "Per data classification"
    
  configuration:
    type: "GitOps (versioned in Git)"
    backup: "Repository mirroring"
    
  secrets:
    type: "Vault replication"
    backup: "Encrypted offline backup monthly"
```

### DR Testing

```yaml
dr_testing_schedule:
  tabletop_exercise:
    frequency: "Quarterly"
    participants: "All on-call engineers"
    scope: "Walk through DR procedures"
    
  component_failover:
    frequency: "Monthly"
    scope: "Individual service failover"
    examples:
      - "Database failover to replica"
      - "Redis cluster failover"
      - "Load balancer failover"
      
  regional_failover:
    frequency: "Bi-annually"
    scope: "Full region evacuation"
    preparation:
      - "Notify stakeholders"
      - "Schedule maintenance window"
      - "Pre-position support staff"
      
  chaos_game_day:
    frequency: "Quarterly"
    scope: "Inject failures in production"
    examples:
      - "Kill random pods"
      - "Inject network latency"
      - "Simulate AZ failure"
```

---

## Postmortems

### Blameless Postmortem Template

```markdown
# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Authors**: [Names]
**Status**: Draft | In Review | Complete
**Severity**: SEV1 | SEV2 | SEV3

## Summary

One paragraph summary of what happened and the impact.

## Impact

- **Duration**: X hours Y minutes
- **Users affected**: X% of users / Y users
- **Revenue impact**: $X (if applicable)
- **SLO impact**: X% of monthly error budget consumed

## Timeline (all times UTC)

| Time | Event |
|------|-------|
| 14:00 | Deployment started |
| 14:05 | First alerts fired |
| 14:10 | On-call acknowledged |
| 14:15 | Incident declared |
| 14:30 | Root cause identified |
| 14:35 | Rollback initiated |
| 14:40 | Service recovered |
| 15:00 | Incident closed |

## Root Cause

Detailed technical explanation of what went wrong and why.

## Contributing Factors

- Factor 1: [What made this worse or possible]
- Factor 2: [Process/tooling gaps]
- Factor 3: [Environmental conditions]

## What Went Well

- Quick detection (5 minutes to alert)
- Clear runbooks available
- Effective communication in war room

## What Went Poorly

- Rollback took longer than expected
- Initial diagnosis went down wrong path
- Status page update was delayed

## Action Items

| Action | Type | Owner | Due Date | Status |
|--------|------|-------|----------|--------|
| Add pre-deploy smoke tests | Prevent | @eng1 | 2025-02-01 | TODO |
| Improve rollback automation | Mitigate | @eng2 | 2025-02-15 | TODO |
| Add metric for early detection | Detect | @eng3 | 2025-02-01 | TODO |
| Update runbook with lessons | Process | @eng4 | 2025-01-20 | DONE |

## Lessons Learned

What should the broader organization learn from this incident?

## Appendix

- Links to dashboards
- Relevant logs
- Related incidents
```

---

## Staff Engineer Responsibilities

### Technical Leadership

- Define and evolve reliability standards across the organization
- Make build vs. buy decisions for tooling
- Establish SLO frameworks and error budget policies
- Mentor engineers on operational excellence
- Drive adoption of SRE practices

### Cross-Team Enablement

- Design observability standards that work across all services
- Create reusable runbook templates and incident response procedures
- Build automation that reduces toil organization-wide
- Establish on-call best practices and health metrics
- Lead chaos engineering initiatives

### Operational Excellence

- Own the incident management process
- Drive postmortem quality and follow-through
- Reduce mean time to detection and recovery
- Eliminate recurring incidents through systemic fixes
- Balance reliability investments with feature velocity

### Strategic Thinking

- Align reliability investments with business priorities
- Plan capacity for growth projections
- Design disaster recovery strategies
- Evaluate emerging technologies for operational improvement
- Manage technical debt in operational tooling

---

## Definition of Done

### Reliability Feature

- [ ] SLOs defined with measurable SLIs
- [ ] Alerts configured with runbooks
- [ ] Dashboards created for key metrics
- [ ] Load tested to expected capacity
- [ ] Failure modes documented
- [ ] DR procedures tested

### Incident Response

- [ ] Incident severity correctly assessed
- [ ] Timeline accurately documented
- [ ] Stakeholders appropriately notified
- [ ] Root cause identified (not just symptoms)
- [ ] Postmortem completed within 5 business days
- [ ] Action items tracked to completion

### On-Call Improvement

- [ ] Alert has clear action to take
- [ ] Runbook is accurate and tested
- [ ] False positive rate < 10%
- [ ] Alert fires with enough time to act
- [ ] Escalation path is clear

---

## Common Pitfalls

### 1. Alert Fatigue

❌ **Wrong**: Alert on everything "just in case"

✅ **Right**: Every alert must be actionable, urgent, and relevant

### 2. SLOs as Targets, Not Limits

❌ **Wrong**: "We must hit exactly 99.9%"

✅ **Right**: SLOs define acceptable reliability; use error budget for velocity

### 3. Blame Culture

❌ **Wrong**: "Who caused this outage?"

✅ **Right**: "What systemic factors allowed this to happen?"

### 4. Manual Heroics

❌ **Wrong**: Relying on engineer availability to keep systems running

✅ **Right**: Automate recovery, build self-healing systems

### 5. Postmortem Theater

❌ **Wrong**: Write postmortem, create action items, never follow up

✅ **Right**: Track action items to completion, measure improvement

---

## Resources

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Google SRE Workbook](https://sre.google/workbook/table-of-contents/)
- [The Art of SLOs](https://sre.google/resources/practices-and-processes/art-of-slos/)
- [Incident Management for Operations](https://www.pagerduty.com/resources/learn/incident-management/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

# Multi-Site Coordination

Guidelines for managing resource allocation across multiple locations, agencies, or organizational units.

## Coordination Models

| Model | Best For | Key Risk |
|-------|----------|----------|
| Centralized | Uniform demand, high mobility between sites | Single point of failure |
| Federated | Heterogeneous sites, local autonomy needed | Resource hoarding, slow mutual aid |
| Hierarchical | Large geographic areas, tiered service levels | Information delays, middle bottleneck |
| Hybrid | Organizations spanning multiple operating modes | Complexity in mode transitions |

Choose the model that matches your operating environment. Most organizations benefit from a hybrid approach: federated in normal operations, centralized during crisis.

## Shared Visibility Requirements

All participating sites must have real-time access to:

- **Resource status**: Available, deployed, and reserved resources by type at each site
- **Demand state**: Current utilization, queue lengths, and wait times per site
- **Transfer activity**: Resources in transit between sites with ETAs
- **Crisis level**: Current escalation level at each site
- **Forecast outlook**: Predicted demand for next 4-12 hours per site

Without shared visibility, coordination degrades to phone calls and guesswork.

## Mutual Aid Protocols

### Activation Criteria

- Lending site utilization below 75% for the resource type requested
- Borrowing site utilization above 90% or experiencing unmet demand
- Transfer travel time within acceptable response window
- No anticipated surge at lending site within transfer period

### Process

1. Borrowing site submits formal request through coordination platform
2. Coordination layer identifies candidate lending sites
3. Lending site confirms availability and expected release time
4. Resource dispatched with tracking and estimated arrival
5. Receiving site confirms arrival and assumes operational control
6. Both sites log the transfer for reconciliation and after-action review

### Recall Authority

The lending site retains the right to recall resources if its own demand escalates. Recall requires 30-minute notice except in immediate life-safety situations.

## Communication Standards

### Structured Messaging

Use standardized formats for all inter-site communication:

- **Request**: Resource type, quantity, urgency, destination, duration
- **Offer**: Resource type, quantity, available from, estimated transit time
- **Status**: Site name, crisis level, utilization by resource type, key gaps
- **Handoff**: Resource identifier, condition, assigned task, contact person

### Communication Cadence

| Condition | Frequency | Channel |
|-----------|-----------|---------|
| Normal operations | Every 4 hours or on significant change | Dashboard + async messaging |
| Elevated demand | Every 2 hours | Dashboard + direct coordination call |
| Surge or crisis | Every hour or more frequently | Live coordination channel + dashboard |

## Load Balancing Strategies

- **Geographic**: Route demand to nearest site with available capacity
- **Capability-based**: Route specialized cases to sites with matching expertise
- **Utilization-based**: Direct new demand to least-loaded site
- **Time-based**: Balance across shifts to prevent overnight bottlenecks
- **Equity-based**: Rotate high-burden assignments to prevent systematic overloading

## Common Pitfalls

### Parochial Optimization

Wrong: Each site optimizes its own metrics independently, hoarding resources "just in case."

Right: System-level optimization with shared accountability. Reward sites that lend resources during neighbor surges, not sites that maintain the highest local reserve.

### Coordination Overhead Exceeding Value

Wrong: Every small resource movement requires multi-level approval and three forms.

Right: Pre-authorize routine transfers within defined parameters. Reserve heavyweight coordination for non-standard or high-stakes movements.

### Inconsistent Data Across Sites

Wrong: Each site uses its own definitions for utilization, availability, and status codes.

Right: Standardize data definitions, update frequencies, and reporting formats across all sites before attempting coordination. Bad data coordination is worse than no coordination.

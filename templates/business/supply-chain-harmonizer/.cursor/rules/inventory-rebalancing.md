# Inventory Rebalancing

Guidelines for maintaining service levels by dynamically redistributing inventory across warehouse networks during disruptions.

## Safety Stock Framework

Safety stock is calculated using demand variability and lead time variability:

```text
SS = Z * sigma_demand * sqrt(lead_time) + Z * demand_avg * sigma_lead_time
```

- **Z factor**: 1.65 for 95% service level, 2.33 for 99%
- **Recalculation frequency**: Weekly under normal conditions, daily during active disruptions
- **Disruption buffer**: Additional stock at strategic locations sized for expected disruption duration multiplied by daily demand

## Rebalancing Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Stock-out imminent | Days of supply < 3 at any RDC | Emergency transfer from nearest surplus location |
| Demand shift | Regional demand > 120% of forecast for 5+ days | Redistribute from low-demand regions |
| Inbound delay | Shipment ETA pushed > 48 hours | Activate safety stock, pull forward next PO |
| Supplier failure | Supplier set to inactive status | Switch to backup supplier, deplete strategic reserve |
| Recovery complete | Routes restored, inbound normalized | Replenish safety stock over 30 days |

## Rebalancing Algorithm

For each SKU at each location, evaluate daily:

1. Calculate days of supply: on-hand divided by daily demand forecast
2. If below minimum threshold, identify nearest locations with surplus
3. Calculate transfer quantity: (target level minus current) multiplied by daily demand and transfer lead time
4. Score transfer options by cost and transit time
5. Execute the lowest-cost feasible transfer
6. Adjust demand forecasts and replenishment orders for both origin and destination

If a location is above maximum threshold, flag for redistribution to deficit locations and reduce inbound orders.

## Warehouse Roles

| Type | Role | Rebalancing Priority |
|------|------|---------------------|
| Regional Distribution Center | Primary fulfillment to end customers | Highest |
| Forward Stocking Location | Fast delivery for key markets | High |
| Central Warehouse | Bulk storage and overflow buffer | Medium |
| Cross-Dock Facility | Flow-through with no storage | N/A - reroute inbound flows |
| Bonded Warehouse | Pre-customs holding | Low |

## Inventory KPIs

| KPI | Target | Frequency |
|-----|--------|-----------|
| Fill rate | > 97% | Daily |
| Days of supply | 7-14 days (SKU-dependent) | Daily |
| Inventory turns | > 8 per year | Monthly |
| Dead stock | < 3% of SKUs with zero movement in 90 days | Monthly |
| Rebalancing cost | < 2% of total inventory value | Monthly |
| Safety stock compliance | > 95% of locations at target levels | Weekly |

## Common Pitfalls

### Reactive-Only Rebalancing

Wrong: Wait until a stockout occurs before transferring inventory.

Right: Monitor days-of-supply continuously. Trigger rebalancing when stock crosses the warning threshold, not the empty threshold.

### Ignoring Transfer Costs

Wrong: Move a pallet across the country to fill a minor deficit.

Right: Compare transfer cost against the revenue risk of a potential stockout. Small deficits at low-velocity locations may not justify the transfer.

### Static Safety Stock

Wrong: Set safety stock levels once per year and forget them.

Right: Recalculate weekly. Adjust for active disruptions, seasonal demand shifts, and changes in supplier lead time variability.

### Over-Centralizing Buffer Stock

Wrong: Hold all safety stock at the central warehouse to minimize carrying cost.

Right: Position buffer stock at regional distribution centers where it can reach customers within the service level window. Central stock is too slow for emergency fulfillment.

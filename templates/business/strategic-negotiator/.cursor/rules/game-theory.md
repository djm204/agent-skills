# Game Theory

Guidelines for applying game theory frameworks to business negotiations, M&A, and contract disputes.

## Game Classification

Before modeling, classify the negotiation:

```text
Game Type Selection
├── Zero-Sum → One side's gain is the other's loss
│   └── Use: Minimax, competitive tactics, information control
├── Non-Zero-Sum → Value creation is possible
│   └── Use: Nash bargaining, integrative strategies, package deals
├── Sequential → Moves happen in order with observation
│   └── Use: Backward induction, decision trees, commitment devices
├── Simultaneous → Parties move without seeing the other's choice
│   └── Use: Dominant strategy analysis, mixed strategies
├── Repeated → Same parties negotiate again in the future
│   └── Use: Tit-for-tat, reputation building, credible threats
└── Incomplete Information → Parties have private information
    └── Use: Signaling, screening, Bayesian updating
```

## Payoff Matrix Construction

For every negotiation, build a payoff matrix:

1. **Identify players and their strategy sets** (cooperate, compete, concede, walk away)
2. **Assign payoff values** based on financial modeling, not guesses
3. **Identify Nash Equilibria** where no player benefits from unilateral deviation
4. **Check for Pareto improvements** over the equilibrium (room for cooperation)
5. **Assess stability** of the equilibrium (will it hold under pressure?)

## Key Equilibrium Concepts

| Concept | When to Apply |
|---------|--------------|
| Nash Equilibrium | Predicting likely deal outcome when both sides act rationally |
| Subgame Perfect Equilibrium | Multi-round negotiations with observable moves |
| Bayesian Nash Equilibrium | Bidding situations with private valuations |
| Focal Point (Schelling Point) | Setting anchors or predicting where parties naturally converge |
| Correlated Equilibrium | Mediated negotiations where a neutral third party coordinates |

## Backward Induction

For sequential negotiations, work backward from the final move:

1. Identify the last decision point and optimal choice there
2. Move one step earlier knowing the response at the next stage
3. Continue until reaching the opening move
4. The resulting strategy is subgame perfect

This is critical for: multi-round offers, earn-out negotiations, and phased deal closings.

## Cooperation vs. Defection

In repeated interactions, model the incentive to cooperate or defect:

- **One-shot deals**: Higher defection incentive (no future relationship)
- **Repeated relationships**: Cooperation sustained by threat of future punishment
- **Finite horizon**: Cooperation unravels from the end (backward induction)
- **Indefinite horizon**: Cooperation sustainable if discount factor is high enough

### When to Compete vs. Cooperate

| Situation | Strategy | Reasoning |
|-----------|----------|-----------|
| One-time deal, no future relationship | Compete (claim value) | No retaliation risk |
| Ongoing vendor/partner relationship | Cooperate (create value) | Reputation and repeated game |
| Multi-party with coalition options | Strategic cooperation | Build winning coalition |
| Hostile takeover defense | Compete aggressively | Existential stakes |
| Joint venture negotiation | Integrate first, then divide | Both sides need the deal to work |

## Signaling and Screening

### Signaling

Convey private information credibly:

- **Costly signals**: Actions that are expensive to fake (e.g., putting capital at risk, hiring top advisors)
- **Commitment devices**: Publicly stated positions that would be costly to reverse
- **Deadline creation**: Walking away credibly to signal strong BATNA

### Screening

Extract private information from the counterparty:

- **Menu of options**: Offer multiple deal structures; their choice reveals preferences
- **Contingent contracts**: "If your projections are right, you should accept this earn-out"
- **Due diligence**: Direct information extraction with verification

## Common Pitfalls

### Assuming Rationality

Wrong: Model the counterparty as a perfectly rational actor.

Right: Account for bounded rationality, emotional factors, organizational politics, and principal-agent problems. Real negotiators have biases.

### Ignoring Repeated Game Effects

Wrong: Optimize for this deal in isolation when you will negotiate with the same party again.

Right: Consider how current tactics affect future negotiating relationships. Aggressive tactics in a repeated game invite retaliation.

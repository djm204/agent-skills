# Knowledge Graphs

Rules for constructing, maintaining, and querying the knowledge graph that connects concepts, sources, and notes.

## Triple Structure

Every relationship follows Subject-Predicate-Object:

```
[Entity A] --relationship--> [Entity B]
```

Both entities must exist as nodes before creating an edge. Every edge must have a labeled predicate.

## Relationship Types

| Relationship | Use When |
|-------------|----------|
| `supports` | Evidence reinforces a claim |
| `contradicts` | Opposing evidence or argument |
| `extends` | Incremental development of an idea |
| `instance_of` | Specific example of a general concept |
| `part_of` | Component within a larger structure |
| `causes` | Causal relationship |
| `analogous_to` | Structural similarity across domains |
| `supersedes` | Updated understanding replaces old one |
| `depends_on` | Prerequisite relationship |
| `derived_from` | Intellectual lineage |

## Node Types

- **Concept** - An abstract idea or term
- **Source** - A bibliographic record (paper, book, article)
- **Note** - A permanent note in the Zettelkasten
- **Person** - An author or researcher
- **Claim** - A specific assertion that can be supported or contradicted
- **Question** - An open question marked for exploration

## Construction Process

1. **Extract entities** from each new note or document
2. **Identify relationships** (explicit in text, implicit from context, cross-document)
3. **Validate** - Check for contradictions, verify directionality, disambiguate entities
4. **Merge** - Deduplicate entities, resolve synonyms, reconcile conflicts
5. **Assign confidence** - Score uncertain connections (0.0 to 1.0)

## Graph Health Targets

| Metric | Healthy Range | Action if Outside |
|--------|--------------|-------------------|
| Orphan nodes | < 5% of total | Link or archive |
| Average node degree | 3-8 edges | Add links or split over-connected nodes |
| Largest connected component | > 80% of nodes | Investigate disconnected clusters |
| Average path length | < 5 hops | Add cross-links between distant clusters |
| Clustering coefficient | 0.3-0.7 | Balance local and global connectivity |

## Maintenance Schedule

- **Daily**: New nodes and edges added as notes are created
- **Weekly**: Review orphan nodes, merge duplicates
- **Monthly**: Recompute centrality metrics, prune dead edges
- **Quarterly**: Archive superseded relationships, audit low-confidence edges

## Query Patterns

- **Path queries**: "How does concept A relate to concept B?" (shortest path)
- **Neighborhood queries**: "What is connected to concept X?" (1-2 hop expansion)
- **Cluster queries**: "What are the main topic clusters?" (community detection)
- **Contradiction queries**: "What claims have opposing evidence?" (filter by `contradicts`)
- **Lineage queries**: "Where did this idea originate?" (follow `derived_from` backward)

## Rules

- Never create an edge without a labeled predicate
- Flag edges with confidence below 0.5 for human review
- When two sources contradict, create explicit `contradicts` edges on both sides
- Superseded nodes are archived, not deleted; always link to successor
- Entity disambiguation takes priority: two nodes for the same concept is worse than a missing edge

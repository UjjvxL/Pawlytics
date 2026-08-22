---
title: "LLM Wiki vs. Standard RAG — Deep Dive & Implementation Guide"
type: query
created: 2026-08-23
updated: 2026-08-23
tags: [query-synthesis, rag, llm-wiki, architecture, workflows]
sources:
  - "[[karpathy-llm-wiki-gist]]"
---

# LLM Wiki vs. Standard RAG — Deep Dive & Implementation Guide

*This page was generated as part of a deep-dive query synthesis and persisted into the LLM Wiki per [[CLAUDE.md]] rules.*

---

## 1. Architectural Paradigms

Traditional knowledge interfaces interact with raw files statelessly. The [[llm-wiki-pattern|LLM Wiki Pattern]], conceived by [[andrej-karpathy]], shifts from ephemeral retrieval to persistent knowledge compilation.

```
Standard RAG Workflow:
User Question -> Vector Search -> Retrieve Chunks -> Re-derive Synthesis (Discarded after chat)

LLM Wiki Workflow:
New Source -> LLM Ingest -> Update Entities/Concepts -> Interlinked Markdown Graph (Compounding persistent state)
User Question -> Query Index -> Read Pre-compiled Wiki -> Cited Answer (Saved as new Query Page)
```

---

## 2. Comprehensive Comparison Matrix

| Aspect | Standard RAG Systems | Persistent LLM Wiki |
| :--- | :--- | :--- |
| **Knowledge Lifecycle** | Ephemeral per chat session | Compounding, version-controlled markdown |
| **Synthesis Overhead** | Re-derived from scratch on every query | Compiled once during ingest; incrementally updated |
| **Cross-Linking** | None (implicit similarity) | Explicit Obsidian Wikilinks (`[[concept]]`) |
| **Contradiction Resolution** | Left to LLM prompt window | Flagged and resolved during Ingest/Lint passes |
| **Human Role** | Querying & manual filing | High-level curation, sourcing, & direction |
| **Tooling Interface** | Black-box vector search | Obsidian graph view, git history, Dataview |

---

## 3. Practical Operations Blueprint

### Ingest Phase
1. Save source into `sources/` (e.g. `sources/2026-08-23-paper-title.md`).
2. Generate summary at `wiki/sources/[source-slug].md`.
3. Update or create concept/entity files.
4. Update [[index]] catalog and append entry to [[log]].

### Query Phase
1. Consult [[index]] to identify relevant wiki pages.
2. Synthesize output. If response is analytical, save to `wiki/queries/[query-slug].md`.

### Lint Phase
1. Perform periodic health checks:
   - Identify orphan pages with zero inbound links.
   - Detect un-linked key terms across pages.
   - Highlight stale or superseded assertions.

---

## Related Pages
- [[llm-wiki-pattern]]
- [[rag-vs-persistent-wiki]]
- [[karpathy-llm-wiki-gist]]
- [[andrej-karpathy]]

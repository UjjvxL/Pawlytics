---
title: "LLM Wiki — Andrej Karpathy Gist"
type: source
created: 2026-08-23
updated: 2026-08-23
tags: [llm-wiki, knowledge-base, karpathy, obsidian, architecture]
sources:
  - "[[2026-08-23-karpathy-llm-wiki-gist]]"
---

# Source Summary: LLM Wiki Gist by Andrej Karpathy

- **Source Document**: [[2026-08-23-karpathy-llm-wiki-gist]]
- **Author**: [[andrej-karpathy]]
- **Key Focus**: Replacing query-time RAG with a persistent, compounding LLM-maintained Wiki.

## Key Takeaways

1. **Compounding Knowledge vs. Query-Time RAG**: Standard RAG re-derives context from scratch on every prompt without accumulation. An [[llm-wiki-pattern|LLM Wiki]] compiles sources once and continuously synthesizes cross-references and contradictions.
2. **Three-Layer Architecture**:
   - `sources/`: Immutable raw source collection (truth).
   - `wiki/`: LLM-written markdown files (synthesis & knowledge graph).
   - `CLAUDE.md`: The Schema / rules governing LLM behavior.
3. **Core Operations**:
   - **Ingest**: Extract, update wiki pages, append to [[index]], update [[log]].
   - **Query**: Read index/wiki, synthesize answer, file valuable exploratory answers back into `wiki/queries/`.
   - **Lint**: Periodically audit for orphans, contradictions, stale claims, and missing cross-links.
4. **Division of Labor**: Human acts as curator and direction-setter; LLM acts as the disciplined developer performing bookkeeping across pages.

## Linked Entities & Concepts
- [[andrej-karpathy]]
- [[llm-wiki-pattern]]
- [[rag-vs-persistent-wiki]]

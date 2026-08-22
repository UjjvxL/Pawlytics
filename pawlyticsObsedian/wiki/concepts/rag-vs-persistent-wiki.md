---
title: "RAG vs. Persistent Wiki"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [rag, llm-wiki, architecture, comparison]
sources:
  - "[[karpathy-llm-wiki-gist]]"
---

# Standard RAG vs. Persistent Wiki

A comparison between standard Retrieval-Augmented Generation (RAG) and the [[llm-wiki-pattern|LLM Wiki Pattern]].

| Dimension | Standard RAG | Persistent LLM Wiki |
| :--- | :--- | :--- |
| **Knowledge State** | Stateless / Ephemeral | Compounding & Persistent |
| **Synthesis Point** | Derived at query-time on every question | Pre-compiled on ingest, continuously revised |
| **Cross-References** | Re-discovered per query via vector search | Explicit Obsidian Wikilinks (`[[link]]`) |
| **Exploration Output** | Lost in chat history | Saved back into `wiki/queries/` |
| **Maintenance** | None (static embeddings) | Continuous LLM bookkeeping & Linting |
| **User Role** | Query submitter | Curator & Strategic Director |

## Core Takeaway
Standard RAG treats documents as isolated fragments to pull on demand, resulting in redundant analysis. The [[llm-wiki-pattern|LLM Wiki]] treats sources as raw material to construct a unified, evolving second brain.

## Related Pages
- [[llm-wiki-pattern]]
- [[karpathy-llm-wiki-gist]]

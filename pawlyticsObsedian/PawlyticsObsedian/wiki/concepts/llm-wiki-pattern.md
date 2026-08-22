---
title: "LLM Wiki Pattern"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [llm-wiki, architecture, second-brain, obsidian]
sources:
  - "[[karpathy-llm-wiki-gist]]"
---

# LLM Wiki Pattern

The **LLM Wiki Pattern** is an architectural paradigm for personal knowledge management proposed by [[andrej-karpathy]]. It treats an Obsidian vault as a codebase where Obsidian is the IDE, the LLM is the programmer/maintainer, and the markdown wiki is the persistent codebase.

## Key Elements

1. **Persistent Artifact**: Unlike standard RAG systems, the wiki continuously compounds. Knowledge is compiled once into interlinked markdown files (`wiki/concepts/`, `wiki/entities/`, etc.) and updated as new information arrives.
2. **Zero Maintenance Burden**: The human focuses on sourcing, exploration, and asking questions. The LLM handles cross-referencing, indexing, summaries, and structural integrity.
3. **Three-Layer Hierarchy**:
   - Immutable **Raw Sources** (`sources/`)
   - Persistent **Wiki Files** (`wiki/`)
   - Governing **Schema Rules** (`CLAUDE.md`)

## Key Workflows
- **Ingest**: Processing raw sources into 10–15 interlinked wiki pages.
- **Query**: Answering questions and saving exploratory findings back into `wiki/queries/`.
- **Lint**: Auditing for broken links, orphan pages, outdated information, and gaps.

## Related Concepts & Sources
- [[rag-vs-persistent-wiki]]
- [[karpathy-llm-wiki-gist]]
- [[andrej-karpathy]]

# Docs for LLMs
> Plain-text documentation tuned for LLM coding assistants — short index and full single-file copy of the entangle-ui docs.

LLMs typically have no training data about `entangle-ui`. To make AI-assisted development with this library reliable, we publish the documentation in plain text alongside the regular site, following the [llmstxt.org](https://llmstxt.org/) convention.

Point your assistant at one of the resources below — it will get every component, hook and guide as ordinary markdown, with all live-preview JSX stripped.

## Resources

- [`/llms.txt`](/llms.txt) — short index. One paragraph of context plus a deep-link to every page. Best when the LLM should only fetch what it needs.
- [`/llms-full.txt`](/llms-full.txt) — full documentation as a single concatenated text file. Best for piping into a context window or vector store in one shot.
- [`/llms/`](/llms/) — per-page markdown. Useful when wiring a retriever or pulling individual references into prompts. Each MDX page in this site has a matching `/llms/<slug>.md` (for example, [`/llms/components/primitives/button.md`](/llms/components/primitives/button.md)).

The text resources are regenerated on every documentation build, so they always match what's on this site.

## Using with Claude Code

This repository ships a Claude Code skill at `.claude/skills/entangle-ui/`. When Claude Code runs in a project that depends on `entangle-ui`, the skill exposes one reference file per component, hook and guide. Drop the directory into your own `.claude/skills/` (or symlink it from your `node_modules/entangle-ui`) and Claude will load only the file for the component it's working with.

```text
.claude/skills/entangle-ui/
  SKILL.md
  components/
    primitives/button.md
    primitives/input.md
    layout/flex.md
    ...
  hooks/
    use-disclosure.md
    ...
  guides/
    theming.md
    styling.md
    accessibility.md
    animations.md
```

## Using with other assistants

Most assistants accept a URL or a pasted text block. Two recipes that work today:

1. **System prompt / project instructions** — paste the contents of `/llms.txt` so the model knows which deep-links to fetch on demand.
2. **Single-shot context dump** — paste the contents of `/llms-full.txt` (or attach it as a file). It is plain markdown and well under typical long-context limits.

For agents with web access, just point them at `https://entangle-ui.dev/llms.txt` and let them follow the links.

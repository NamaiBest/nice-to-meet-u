# nice-to-meet-u

A skill that gets you ready to talk to someone.

You give it a name. It starts four research agents at once. One of them scrapes LinkedIn, Instagram, X, and YouTube through your Apify account. The others cover public work, code, and publications. You get one paragraph and three lines you can actually say. The lines use your angle, in `YOU.md`, not a generic "I loved your work."

You connect Apify yourself. nice-to-meet-u does not include a token. Setup is in `.claude/skills/nice-to-meet-u/references/mcp.md`. Until Apify is connected, those profile rows stay empty instead of being guessed.

## Set up once

The first run writes your background to `YOU.md`. If Claude or Codex already has a memory of you, it uses that and does not ask. Later runs search your old chats and write `memory-map.md`, linking only the chats that matter to the person you are about to meet.

Which memory tool it uses, in order: the host's own memory, [claude-mem](https://github.com/thedotmack/claude-mem), [ai-sessions](https://github.com/yoavf/ai-sessions-mcp), [Basic Memory](https://github.com/basicmachines-co/basic-memory), then Mem0 if you already run it. Details are in `.claude/skills/nice-to-meet-u/references/memory.md`.

Search and scrape servers besides Apify (Exa, Tavily, Brave, Parallel, Firecrawl, GitHub) are in `.claude/skills/nice-to-meet-u/references/mcp.md`. A starter config is `mcp/stack.mcp.json`. Connect the ones you have keys for. The skill uses whatever is actually connected.

## Use it

1. Copy `you.example.md` to `YOU.md` only if you want to write it yourself. Otherwise the first run asks once, or copies what Claude or Codex already remembers.
2. Open this repo in Claude Code, GitHub Copilot, or Codex.
3. Say who you're about to talk to.

> I'm about to talk to Tim Berners-Lee at a conference. Get me ready.

Claude Code uses the subagents in `.claude/agents/`. Copilot uses the custom agents in `.github/agents/`. Both follow `.claude/skills/nice-to-meet-u/SKILL.md` (the same skill is also under `.github/skills/` and `.agents/skills/` so each host finds it).

On a host that cannot start other agents, the skill still runs the four searches itself before it writes. Profile scrapes still go through Apify.

## What comes back

- Who they are, in one paragraph
- LinkedIn, Instagram, X, and YouTube, each from an Apify scrape, plus publications
- Up to three recent public things, each with a link
- Three things you can say, tied to `YOU.md`
- What not to lead with
- What is still ambiguous, including a shared name

The card is saved at `people/<name>.md`. Next time, nice-to-meet-u reads it and refreshes the profiles and what is recent.

## Install into another repo

Copy these folders:

- `.claude/agents/` and `.claude/skills/nice-to-meet-u/`
- `.github/agents/` and `.github/skills/nice-to-meet-u/`
- `.agents/skills/nice-to-meet-u/`

## What it will not do

- Name a stranger from a photo
- Send a LinkedIn, Instagram, or X password or cookie to a scraper
- Invent a profile when Apify is not connected, or when a scrape comes back empty

Connect Apify before you expect those profiles. Claude Code:

```bash
claude mcp add --transport http apify https://mcp.apify.com
```

Then `/mcp` and sign in with your own Apify account. The same server works as a custom connector at `https://mcp.apify.com`. Optional extras (Exa or Tavily to find the URL, Firecrawl to read a page, GitHub's MCP for repos) are in the same setup note. You add those yourself too.

MIT. See [LICENSE](LICENSE).

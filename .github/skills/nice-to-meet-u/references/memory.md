# Your background, once

Do this before the research agents start. The angle is what the user can say. It is not a biography of the person they are about to meet.

## If they already have a memory

Use it. Do not interview them again.

Look in this order and stop when you have a real background (what they build, what they want from a conversation, what they can stay on):

1. `YOU.md` in the working directory, then `~/.nice-to-meet-u/you.md`
2. Memory the host already injected. Claude Code auto memory, `CLAUDE.md`, and `MEMORY.md`. Codex memories under `~/.codex/memories/` when `[features] memories = true` is set in `~/.codex/config.toml`.
3. A connected memory tool, if one is in the tool list. Search it for what the user has been building. See the tools below.
4. Recent local sessions, only through a tool that already indexes them. Do not paste a raw transcript into the brief.

Write what you found into `YOU.md` if that file is missing or thinner than the memory you just read. Keep it short: four blocks, matching `you.example.md`.

## If they are new

Nothing above returned a background. Ask once:

> What are you building, what do you want from a conversation, what can you stay on for ten minutes, and what should you not pretend to know?

Write the answer to `YOU.md` and to `~/.nice-to-meet-u/you.md`. Tell them this is the one-time setup. Do not ask again on the next person.

## Memory map

After the background is known, and again when a person's name arrives, refresh `memory-map.md` in the working directory.

```markdown
# Memory map

## You
One short paragraph from YOU.md. Link the file.

## Relevant chats
- title or first line — why it matters to this person or to what the user is building — source (session id, file, or memory id) — date

## People
- [[Full Name]] → people/<slug>.md
```

Only include a chat that is actually about this person, or about work the user could bring up with them. Five links is enough. A chat you did not open does not go on the map.

If Basic Memory is connected, also write the same note there so later sessions can follow the wikilink. If it is not connected, the markdown file is enough.

## Tools that already remember

Prefer a tool the user already installed. Offer the next one only if none of these are present.

| Already there | What to do |
| --- | --- |
| Claude auto memory, `CLAUDE.md`, `MEMORY.md` | Read it. Do not install anything. |
| Codex memories, `~/.codex/memories/` | Read the summaries. To turn them on: in `~/.codex/config.toml`, set `[features]` then `memories = true`. |
| [claude-mem](https://github.com/thedotmack/claude-mem) | `npx claude-mem install`. Then use its search tool for the person's name and for the user's recent work. It also covers Codex. Do not turn on a cloud upload of their chats unless they ask. |
| [ai-sessions](https://github.com/yoavf/ai-sessions-mcp) | Local search across Claude Code, Codex, and Copilot sessions. `claude mcp add --scope user --transport stdio ai-sessions -- ~/.aisessions/bin/aisessions` after they install the binary from that repo. Codex: `codex mcp add ai-sessions -- ~/.aisessions/bin/aisessions`. |
| [Basic Memory](https://github.com/basicmachines-co/basic-memory) | Local markdown graph. `uvx basic-memory mcp`. Notes live in `~/basic-memory`. Write the memory map as a note with `[[wikilinks]]`. |
| [Mem0](https://github.com/mem0ai/mem0) | Only if they already use it. Search, do not create a second copy of YOU.md. |

Search the memory tool with the person's name and with the topics in `YOU.md`. That is how an old chat gets linked. A brand new user has no chats to link, so the map's Relevant chats section says none yet.

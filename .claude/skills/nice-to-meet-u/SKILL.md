---
name: nice-to-meet-u
description: >
  Prepares a sourced briefing before a real conversation with a named person.
  Use when the user is about to meet someone, asks how to open a conversation,
  wants a personalized opener, or asks who someone is before a call or a visit.
  Fans out four research agents, including LinkedIn, Instagram, X, and publications,
  then writes what to say from the user's angle.
---

# nice-to-meet-u

Get them ready to talk. This is not a notes app and not a biography. The
output is one paragraph on who the person is, what their public profiles and
publications say right now, and three things the user can actually say.

## 1. Your background

Do this before any research agent starts. Read [references/memory.md](references/memory.md) and follow it.

If Claude or Codex already remembers you, use that. Do not ask again. Also search past chats for this person's name and for what you have been building, then write `memory-map.md` with only the chats that matter.

If nothing about the user exists yet, ask the one-time question in that file, write `YOU.md`, and say that setup is done. The next person does not get the question again.

## 2. Fan out

You need four independent reports. Start all four in the same step. Do not
run the next one after the previous finishes. Do not write the brief until all
four are back, or until one has failed and the others are back.

Do not put `YOU.md` or the memory map into the research agents. That background is only for the lines the user will say. The agents only receive the other person's name, plus company, role, city, or event.

| Agent | Looks for |
| --- | --- |
| `meet-profiles` | LinkedIn, Instagram, X, YouTube, personal site. Required. |
| `meet-work` | Role, company, product, papers, books, talks |
| `meet-code` | GitHub, shipped software, technical writing, RFCs |
| `meet-lately` | News, interviews, talks, and public posts from the last 18 months |

`meet-profiles` is not optional. A name by itself is enough to start it. That agent scrapes LinkedIn, Instagram, X, and YouTube through Apify. Read [references/mcp.md](references/mcp.md) first. If Apify is not connected, it must say so and those rows stay empty. It does not invent them.

On Claude Code, delegate to the project subagents with those names, in the
background, in parallel.

On GitHub Copilot, invoke the custom agents `meet-profiles`, `meet-work`,
`meet-code`, and `meet-lately` through the agent tool, in parallel.

On Codex or any host that cannot start subagents, do the four searches
yourself, still as four separate searches, before you write a word of the brief.

Before the first search, read [references/rules.md](references/rules.md).

## 3. Write the brief

You write it. Do not delegate this step. Read [references/brief.md](references/brief.md)
and follow that shape exactly.

The Profiles section has to list LinkedIn, Instagram, X, and publications,
each with a URL or with "not found" after a real search. Use a claim only if
an agent attached a URL, or if you just opened that URL. If the agents
disagree, say so in "If you're not sure". If several people share the name,
do not guess: name the candidates and ask which one.

Openers have to be sayable out loud by this user. Prefer a recent post, paper,
or profile line over a generic compliment. If the angle file is empty, the
openers may only use the person's public work, and you say that the angle is
missing.

## 4. Keep the card

Write the brief to `people/<slug>.md`, where `<slug>` is the name in
lowercase with spaces as hyphens and no punctuation.

The next time this person comes up, read that file first. Say what is already
known, then refresh `meet-profiles` and `meet-lately` unless the user says
the old brief was wrong.

## 5. Talk back

Answer a follow-up from the brief when the brief already has it. Search again
only for a fact that is missing, then cite the URL. Same rules. Update the
card if the answer changes what they should say.

## Never

- Identify anyone from a face, or ask for a photo of a stranger.
- Put a password, a cookie, or a session into an Apify actor. The user connects their own Apify account.
- Invent a job, a post, a paper, or a profile the scrape did not return.
- Quote the user's angle as if the other person had said it.

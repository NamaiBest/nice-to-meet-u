# Research rules

Every claim comes back with a URL or it does not come back. A name is enough to start. Do not wait for the user to paste a profile.

## Required surfaces

Search all of these for the named person before you report. Use the company or role in the query when you have it.

1. LinkedIn — `"Full Name" site:linkedin.com/in`, then open the profile.
2. Instagram — `"Full Name" site:instagram.com`, then open the profile. Also try the handle if LinkedIn, X, or their site names one.
3. X — `"Full Name" site:x.com` and `site:twitter.com`. Open the profile and the recent public posts.
4. Publications — Google Scholar, OpenAlex, Semantic Scholar, arXiv, a lab page, a personal site, Medium, Substack. Open the papers or essays, not just the author name.
5. YouTube — `"Full Name" site:youtube.com` for talks and their channel.
6. The personal site and the company bio, if search or any profile links them.

`meet-profiles` owns LinkedIn, Instagram, X, and YouTube, and it scrapes them through the Apify MCP in [mcp.md](mcp.md). `meet-work` owns publications, books, and talks. Either agent may return a hit the other also found. The parent dedupes. Neither agent may skip its list.

## What to take from a scrape

From each dataset or page, take only fields that are present:

- The profile URL
- Headline, bio, or about line
- Current role and company, if shown
- The last few public posts, papers, or videos: title, date, and a one-line summary of what they actually said
- Links from that page to their other profiles

Do not pass a password, a cookie, or a session into an actor. If Apify is not connected, the row says `not scraped — Apify is not connected`. Do not guess the posts you did not get.

## Not allowed

- A face search, or naming someone from a photo
- Private data: the user's chats, mail, calendar, or contacts, unless the user pasted a fact into this turn
- Merging two people who share a name

## How to search

1. Put the full name in quotes when it is common. Add the company or role.
2. Open the page. Do not trust the snippet alone when the page itself opened.
3. If the first results are a different person, report the collision. Do not merge two lives.

## Report shape

Return only this. No opener. No advice. No paragraph about the user.

```text
match: one line, and confidence high|medium|low
collisions: other people with this name, or none
profiles:
- network | url or not found | what the public page shows
claims:
- claim | url | date or unknown
empty: which required searches returned nothing
```

`meet-profiles` must include a row for LinkedIn, Instagram, X, and YouTube even when the row says not found. Other agents can leave `profiles` empty. Twelve claims is the maximum on a profiles report. Five is enough for the others.

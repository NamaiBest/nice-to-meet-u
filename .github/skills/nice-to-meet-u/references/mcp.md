# Scrape MCPs

The person running nice-to-meet-u connects these. The skill does not ship an API token. If a server is not in the tool list, say so once and point at the setup below. Do not invent a profile you did not scrape.

## Apify (required for LinkedIn, Instagram, and X)

Hosted server: `https://mcp.apify.com`

Sign in with the user's own Apify account when the client asks. OAuth is the right way. Do not paste a token into the repo. A local client that cannot do OAuth can use `npx -y @apify/actors-mcp-server` with `APIFY_TOKEN` in the environment, not in git.

Claude Code:

```bash
claude mcp add --transport http apify https://mcp.apify.com
```

Then run `/mcp` in that session and approve Apify.

Claude Desktop or claude.ai: Settings → Connectors → Add custom connector → name `Apify`, URL `https://mcp.apify.com`.

Cursor, Codex, or another JSON client. Copy [mcp/apify.mcp.json](../../../../mcp/apify.mcp.json) into the client's MCP config.

Tools the profile agent is allowed to call:

| Tool | Use |
| --- | --- |
| `search-actors` | Find a current actor. Actor ids change. |
| `fetch-actor-details` | Read the input schema before every run. |
| `call-actor` | Run it. |
| `get-dataset-items` | Read the rows if `call-actor` did not already return them. |

Pin a smaller set only if the client is noisy. This URL enables actors plus the two that are stable:

`https://mcp.apify.com?tools=actors,docs,apify/rag-web-browser,apify/instagram-scraper`

### How to scrape one person

Spend as little as possible. One profile per network. Cap recent posts at 5. Do not pass a password, a cookie, or a session.

1. `apify/rag-web-browser` or the client's web search: find the profile URL for each network. Query `"Full Name" company` plus `site:linkedin.com/in`, `site:instagram.com`, `site:x.com`, `site:youtube.com`.
2. Instagram. If `apify/instagram-scraper` is available, `fetch-actor-details` first, then `call-actor` with the profile URL or username from step 1. Direct URLs only. Results from that run are the bio, counts, and recent posts.
3. LinkedIn. `search-actors` for `linkedin profile`. Pick a maintained actor that accepts a public `/in/` URL and does not ask for a LinkedIn password. `fetch-actor-details`, then `call-actor` on the one URL from step 1. Keep headline, about, current role, and recent activity that the dataset actually contains.
4. X. `search-actors` for `tweet scraper` or `x.com profile`. Same pattern: schema first, then one handle or profile URL, then the latest posts in the dataset.
5. YouTube and the personal site. `apify/rag-web-browser` or a YouTube actor from `search-actors`. Open the channel or the page. Do not scrape a second site if the first page already has the bio and the latest videos.
6. Anything else public (a talk page, a company bio). `apify/rag-web-browser` with that URL.

If `call-actor` returns a run id instead of rows, call `get-dataset-items` once. If the run failed, report the error in `empty`. Do not retry more than once.

## Other scrape and search MCPs

Use every one of these that is actually connected. Do not skip a connected server, and do not pretend a missing one ran. Find the person with a search server first, then scrape the profile with Apify, then read any page Apify did not return.

| Order | Server | Job | Connect |
| --- | --- | --- | --- |
| 1 | Exa | Find the right person when the name is common. Semantic search. | `claude mcp add --transport http exa https://mcp.exa.ai/mcp` |
| 1 | Tavily | A second opinion on the same name, plus extract. | `claude mcp add --transport http tavily https://mcp.tavily.com/mcp/` |
| 1 | Brave Search | Web and news from Brave's own index. Needs `BRAVE_API_KEY`. | `claude mcp add brave-search --env BRAVE_API_KEY="$BRAVE_API_KEY" -- npx -y @brave/brave-search-mcp-server` |
| 1 | Parallel | Search excerpts plus a fetch, when Exa and Tavily are absent. | `https://search.parallel.ai/mcp` |
| 2 | Apify | LinkedIn, Instagram, X, YouTube once you have a URL or handle. | Already required above. |
| 3 | Firecrawl | Read a paper, personal site, or company bio Apify did not return. | `https://mcp.firecrawl.dev/v2/mcp` or `npx -y firecrawl-mcp` with `FIRECRAWL_API_KEY` |
| 4 | GitHub MCP | Public repos after a username shows up. Do not scrape GitHub through Apify if this is connected. | The official GitHub MCP for that client. |
| last | Bright Data | Only if a page blocked Exa, Firecrawl, and Apify. The user must already have an account. | Their current MCP URL. Do not sign them up. |

Codex and Cursor use the same URLs. Copy [mcp/stack.mcp.json](../../../../mcp/stack.mcp.json) and add keys only in the client, never in the repo.

### Who calls what

- `meet-profiles` finds URLs with Exa, Tavily, Brave, or Parallel, then scrapes LinkedIn, Instagram, X, and YouTube with Apify.
- `meet-work` uses the same search servers, then Firecrawl on the paper or talk page. Publications still start at OpenAlex (`https://api.openalex.org/authors?search=`) or Semantic Scholar. Use a scraper only if those APIs return nothing.
- `meet-code` uses the GitHub MCP when a username is known, and web search only to find that username.
- `meet-lately` uses Brave news or Tavily or Exa for the last 18 months, then Firecrawl on the one page worth quoting.

One profile per network. Cap posts at 5. One retry if a call errors. Do not pass a password, a cookie, or a session to any of these.

Publications do not need a scraper when OpenAlex or Semantic Scholar already returned the paper.

## If Apify is not connected

Stop the profile scrape. Tell the user Apify is not connected, and give them the Claude Code line or the connector URL above. Still run `meet-work`, `meet-code`, and `meet-lately` on ordinary web search. In the brief, LinkedIn, Instagram, and X say `not scraped — Apify is not connected`. Do not fill those rows from memory.

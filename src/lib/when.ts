export function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export type BriefCard = {
  paragraph: string;
  lately: string[];
  openers: string[];
  avoid: string;
  unsure: string[];
  sources: { title: string; url: string }[];
};

function asStrings(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, max);
}

function asSources(value: unknown): BriefCard["sources"] {
  if (!Array.isArray(value)) return [];
  const sources: BriefCard["sources"] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as { title?: unknown; url?: unknown };
    const url = String(row.url ?? "").trim();
    if (!/^https?:\/\//.test(url)) continue;
    const title = String(row.title ?? "").trim() || url;
    sources.push({ title, url });
    if (sources.length >= 6) break;
  }
  return sources;
}

export function readBrief(raw: string): BriefCard | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const slice = start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
  try {
    const value = JSON.parse(slice) as Record<string, unknown>;
    const paragraph = String(value.paragraph ?? "").trim();
    if (!paragraph) throw new Error("empty");
    const avoid = String(value.avoid ?? value.bridge ?? "").trim();
    return {
      paragraph,
      lately: asStrings(value.lately, 3),
      openers: asStrings(value.openers, 3),
      avoid,
      unsure: asStrings(value.unsure, 4),
      sources: asSources(value.sources),
    };
  } catch {
    return {
      paragraph: trimmed.slice(0, 900),
      lately: [],
      openers: [],
      avoid: "",
      unsure: [],
      sources: [],
    };
  }
}

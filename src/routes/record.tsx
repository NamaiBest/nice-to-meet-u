import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getRecord, type Entry } from "@/lib/foyer.functions";
import { when } from "@/lib/when";

export const Route = createFileRoute("/record")({ component: RecordPage });

function RecordPage() {
  return (
    <AppShell>
      <Record />
    </AppShell>
  );
}

function Record() {
  const { user } = useCurrentUserState();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      getRecord({ data: query })
        .then((rows) => {
          if (!cancelled) setEntries(rows);
        })
        .catch(() => {
          if (!cancelled) setError("Could not load the record.");
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [user?.id, query]);

  return (
    <div>
      <p className="text-sm text-seal">The record</p>
      <h1 className="mt-2 font-serif text-4xl">What you asked, and what you learned</h1>
      <p className="mt-3 text-sm text-muted">
        Follow-up questions and what you wrote down after the conversation. The brief itself lives on
        the person.
      </p>
      <label className="mt-6 block">
        <span className="sr-only">Search the record</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a name or a phrase"
          className="min-h-12 w-full rounded-card border border-line bg-surface px-4 outline-none"
        />
      </label>
      {error ? <p className="mt-4 text-sm text-seal">{error}</p> : null}
      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nothing matches yet.</p>
      ) : (
        <ol className="mt-6 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-card border border-line bg-surface px-4 py-3">
              <p className="text-xs text-muted">
                {when(entry.created_at)} · {entry.kind}
                {entry.person_id && entry.person_name ? (
                  <>
                    {" · "}
                    <Link
                      to="/people/$personId"
                      params={{ personId: String(entry.person_id) }}
                      className="text-seal"
                    >
                      {entry.person_name}
                    </Link>
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-sm">{entry.body}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

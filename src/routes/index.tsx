import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppShell } from "@/components/shell";
import { createPerson, getDesk, writeBrief, type Person } from "@/lib/foyer.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { readBrief } from "@/lib/when";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <Desk />
    </AppShell>
  );
}

function Desk() {
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [dossierEmpty, setDossierEmpty] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getDesk()
      .then((desk) => {
        if (cancelled) return;
        setPeople(desk.people);
        setDossierEmpty(desk.dossierEmpty);
      })
      .catch(() => {
        if (!cancelled) setError("Could not open your desk.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function getReady(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const created = await createPerson({ data: { name, company, role } });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      const briefed = await writeBrief({ data: created.id });
      if (!briefed.ok) setError(briefed.error);
      await navigate({ to: "/people/$personId", params: { personId: String(created.id) } });
    } catch {
      setError("Could not look them up.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm text-seal">Before you walk in</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Who are you about to talk to?</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          A name is enough. nice-to-meet-u looks up their public work and gives you three things you can say.
        </p>
        <form onSubmit={getReady} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-muted">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 min-h-12 w-full rounded-card border border-line bg-surface px-4 text-ink outline-none"
              placeholder="Name on the badge"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted">Company, if the name is common</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-1 min-h-12 w-full rounded-card border border-line bg-surface px-4 text-ink outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Role</span>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-1 min-h-12 w-full rounded-card border border-line bg-surface px-4 text-ink outline-none"
              />
            </label>
          </div>
          {error ? <p className="text-sm text-seal">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 rounded-card bg-seal px-5 font-medium text-seal-ink disabled:opacity-60"
          >
            {pending ? "Looking them up…" : "Get me ready"}
          </button>
        </form>
      </section>

      {dossierEmpty ? (
        <Link to="/you" className="block rounded-card border border-line bg-surface px-4 py-4">
          <p className="font-medium text-ink">Add your angle.</p>
          <p className="mt-1 text-sm text-muted">
            Optional, but the lines to say stay generic until nice-to-meet-u knows what you can actually talk about.
          </p>
        </Link>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl">People</h2>
        {people.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nobody yet. The first brief shows up here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
            {people.map((person) => {
              const brief = readBrief(person.brief);
              return (
                <li key={person.id}>
                  <Link
                    to="/people/$personId"
                    params={{ personId: String(person.id) }}
                    className="flex min-h-14 items-center justify-between gap-4 px-4 py-3"
                  >
                    <span>
                      <span className="block font-medium">{person.name}</span>
                      <span className="block text-sm text-muted">
                        {brief?.paragraph
                          ? brief.paragraph.slice(0, 110)
                          : [person.role, person.company].filter(Boolean).join(" · ") || "Not looked up yet"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{brief ? "Ready" : "Empty"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppShell } from "@/components/shell";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDossier, saveDossier } from "@/lib/foyer.functions";

export const Route = createFileRoute("/you")({ component: YouPage });

function YouPage() {
  return (
    <AppShell>
      <You />
    </AppShell>
  );
}

function You() {
  const { user } = useCurrentUserState();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getDossier()
      .then((dossier) => {
        if (!cancelled) setBody(dossier.body);
      })
      .catch(() => {
        if (!cancelled) setStatus("Could not load your page.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus("Saving…");
    try {
      await saveDossier({ data: { body } });
      setStatus("Saved. The next brief will use this when it writes your lines.");
    } catch {
      setStatus("Could not save.");
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <p className="text-sm text-seal">You</p>
        <h1 className="mt-2 font-serif text-4xl">Your angle</h1>
        <div className="mt-4">
          <UserButton />
        </div>
      </div>
      <p className="text-sm text-muted">
        What you are building, what you want from the conversation, and the topics you can stay on.
        nice-to-meet-u uses this only to phrase what you say. It is not a diary, and it is not a fact about them.
      </p>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={14}
        className="w-full rounded-card border border-line bg-surface px-4 py-3 text-ink outline-none"
        placeholder="I have been building… I want to talk about… I can go deep on…"
      />
      <button type="submit" className="min-h-12 rounded-card bg-seal px-5 font-medium text-seal-ink">
        Save
      </button>
      {status ? <p className="text-sm text-muted">{status}</p> : null}
    </form>
  );
}

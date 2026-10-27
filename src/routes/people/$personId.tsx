import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppShell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  addEntry,
  addFact,
  askPerson,
  deleteFact,
  deletePerson,
  getPerson,
  speakBrief,
  updatePerson,
  writeBrief,
  type Entry,
  type Fact,
  type Person,
} from "@/lib/foyer.functions";
import { readBrief, when } from "@/lib/when";

export const Route = createFileRoute("/people/$personId")({ component: PersonPage });

function PersonPage() {
  return (
    <AppShell>
      <Card />
    </AppShell>
  );
}

function Card() {
  const { personId } = Route.useParams();
  const id = Number(personId);
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [related, setRelated] = useState<Entry[]>([]);
  const [missing, setMissing] = useState(false);
  const [claim, setClaim] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [learned, setLearned] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [listening, setListening] = useState(false);

  async function reload() {
    const packet = await getPerson({ data: id });
    if (!packet) {
      setMissing(true);
      return;
    }
    setPerson(packet.person);
    setFacts(packet.facts);
    setRelated(packet.related);
  }

  useEffect(() => {
    if (!user?.id || !Number.isFinite(id)) return;
    let cancelled = false;
    getPerson({ data: id })
      .then((packet) => {
        if (cancelled) return;
        if (!packet) {
          setMissing(true);
          return;
        }
        setPerson(packet.person);
        setFacts(packet.facts);
        setRelated(packet.related);
      })
      .catch(() => {
        if (!cancelled) setStatus("Could not open this card.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, id]);

  async function saveIdentity(event: FormEvent) {
    event.preventDefault();
    if (!person) return;
    setBusy("save");
    await updatePerson({
      data: { id: person.id, name: person.name, company: person.company, role: person.role },
    });
    setBusy("");
    setStatus("Saved.");
  }

  async function onBrief() {
    setBusy("brief");
    setStatus("");
    const result = await writeBrief({ data: id });
    setBusy("");
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    await reload();
  }

  async function onSpeak() {
    setBusy("speak");
    setStatus("");
    const result = await speakBrief({ data: id });
    setBusy("");
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    const audio = new Audio(`data:audio/mpeg;base64,${result.audioBase64}`);
    await audio.play().catch(() => setStatus("Could not play audio."));
  }

  async function onFact(event: FormEvent) {
    event.preventDefault();
    setBusy("fact");
    await addFact({ data: { personId: id, claim, sourceUrl } });
    setClaim("");
    setSourceUrl("");
    setBusy("");
    await reload();
  }

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy("ask");
    setStatus("");
    const result = await askPerson({ data: { personId: id, question } });
    setQuestion("");
    setBusy("");
    if (!result.ok) setStatus(result.error);
    await reload();
  }

  async function onLearned(event: FormEvent) {
    event.preventDefault();
    if (!learned.trim()) return;
    setBusy("learned");
    await addEntry({ data: { personId: id, kind: "meeting", body: learned } });
    setLearned("");
    setBusy("");
    await reload();
  }

  function dictate() {
    const host = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = host.SpeechRecognition || host.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus("Dictation is not available in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      if (text) setQuestion((current) => (current ? `${current} ${text}` : text));
    };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  async function remove() {
    if (!person) return;
    if (!window.confirm(`Remove ${person.name} and this brief?`)) return;
    await deletePerson({ data: person.id });
    await navigate({ to: "/" });
  }

  const brief = person ? readBrief(person.brief) : null;

  return (
    <div className="space-y-8">
      <Link to="/" className="text-sm text-muted">
        Back to the desk
      </Link>
      {missing ? <p>That card is not yours, or it is gone.</p> : null}
      {!person && !missing ? <p className="text-muted">Opening the card…</p> : null}
      {person ? (
        <>
          <form onSubmit={saveIdentity} className="space-y-3">
            <input
              value={person.name}
              onChange={(event) => setPerson({ ...person, name: event.target.value })}
              className="w-full bg-transparent font-serif text-4xl text-ink outline-none"
              aria-label="Name"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={person.role}
                onChange={(event) => setPerson({ ...person, role: event.target.value })}
                placeholder="Role"
                aria-label="Role"
                className="min-h-11 rounded-card border border-line bg-surface px-3 text-sm outline-none"
              />
              <input
                value={person.company}
                onChange={(event) => setPerson({ ...person, company: event.target.value })}
                placeholder="Company"
                aria-label="Company"
                className="min-h-11 rounded-card border border-line bg-surface px-3 text-sm outline-none"
              />
            </div>
            <button type="submit" className="text-sm text-seal">
              {busy === "save" ? "Saving…" : "Save name and role"}
            </button>
          </form>

          <section className="rounded-card border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-2xl">Get ready</h2>
              <button
                type="button"
                onClick={onSpeak}
                disabled={!brief || busy === "speak"}
                className="inline-flex min-h-11 items-center gap-2 rounded-card border border-line px-3 text-sm disabled:opacity-40"
              >
                <Volume2 size={16} aria-hidden />
                {busy === "speak" ? "Speaking…" : "Read it"}
              </button>
            </div>
            {brief ? (
              <div className="mt-4 space-y-5">
                <p className="text-base leading-relaxed">{brief.paragraph}</p>
                {brief.lately.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-seal">Lately</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {brief.lately.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {brief.openers.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-seal">Say this</h3>
                    <ol className="mt-2 space-y-2 text-sm">
                      {brief.openers.map((opener) => (
                        <li key={opener} className="border-l-2 border-seal pl-3">
                          {opener}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                {brief.avoid ? <p className="text-sm text-muted">Don’t lead with {brief.avoid}</p> : null}
                {brief.unsure.length > 0 ? (
                  <p className="text-sm text-muted">Not sure: {brief.unsure.join(" ")}</p>
                ) : null}
                {brief.sources.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {brief.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-seal">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No brief yet. nice-to-meet-u will search their public work and write what you can say. It will not
                invent a life when it cannot find a page.
              </p>
            )}
            <button
              type="button"
              onClick={onBrief}
              disabled={busy === "brief"}
              className="mt-5 min-h-12 rounded-card bg-seal px-5 font-medium text-seal-ink disabled:opacity-60"
            >
              {busy === "brief" ? "Looking them up…" : brief ? "Look again" : "Get me ready"}
            </button>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Correct a miss</h2>
            <p className="mt-2 text-sm text-muted">One sentence if the brief has the wrong person or a stale role.</p>
            <ul className="mt-3 space-y-2">
              {facts.map((fact) => (
                <li key={fact.id} className="rounded-card border border-line bg-surface px-4 py-3 text-sm">
                  <p>{fact.claim}</p>
                  {fact.source_url ? (
                    <a href={fact.source_url} className="mt-1 block truncate text-seal">
                      {fact.source_url}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="mt-2 text-xs text-muted"
                    onClick={async () => {
                      await deleteFact({ data: fact.id });
                      await reload();
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={onFact} className="mt-3 space-y-2">
              <input
                value={claim}
                onChange={(event) => setClaim(event.target.value)}
                placeholder="What the brief got wrong"
                className="min-h-12 w-full rounded-card border border-line bg-surface px-4 outline-none"
              />
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="Link, optional"
                className="min-h-12 w-full rounded-card border border-line bg-surface px-4 outline-none"
              />
              <button type="submit" className="min-h-11 text-sm font-medium text-seal">
                {busy === "fact" ? "Adding…" : "Add fact"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Ask something else</h2>
            <p className="mt-2 text-sm text-muted">It will look it up if the brief doesn’t already say.</p>
            <form onSubmit={onAsk} className="mt-3 flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What should I actually ask them?"
                className="min-h-12 flex-1 rounded-card border border-line bg-surface px-4 outline-none"
              />
              <button
                type="button"
                onClick={dictate}
                aria-label={listening ? "Listening" : "Dictate"}
                className="grid min-h-12 min-w-12 place-items-center rounded-card border border-line bg-surface"
              >
                <Mic size={18} aria-hidden />
              </button>
              <button
                type="submit"
                disabled={busy === "ask"}
                className="min-h-12 rounded-card bg-seal px-4 text-sm font-medium text-seal-ink disabled:opacity-60"
              >
                {busy === "ask" ? "…" : "Ask"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-2xl">After you talk</h2>
            <p className="mt-2 text-sm text-muted">What they actually cared about. The next brief can use it.</p>
            <form onSubmit={onLearned} className="mt-3 space-y-2">
              <textarea
                value={learned}
                onChange={(event) => setLearned(event.target.value)}
                rows={4}
                placeholder="What was true, what was wrong, what they actually care about."
                className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
              />
              <button type="submit" className="min-h-11 text-sm font-medium text-seal">
                {busy === "learned" ? "Saving…" : "Keep this"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-2xl">This conversation</h2>
            <ul className="mt-3 space-y-2">
              {related
                .filter((entry) => entry.kind === "question" || entry.kind === "answer" || entry.kind === "meeting")
                .map((entry) => (
                <li key={entry.id} className="text-sm">
                  <span className="text-muted">
                    {when(entry.created_at)} · {entry.kind}
                    {entry.person_name ? ` · ${entry.person_name}` : ""}
                  </span>
                  <p>{entry.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {status ? <p className="text-sm text-seal">{status}</p> : null}
          <button type="button" onClick={remove} className="text-sm text-muted">
            Remove this card
          </button>
        </>
      ) : null}
    </div>
  );
}

type SpeechRec = {
  lang: string;
  start: () => void;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
};

import { signIn } from "@/lib/auth/client";
import { GROK_PROVIDERS } from "@/lib/auth/providers";

export function Landing() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="mx-auto flex w-full max-w-xl flex-col px-6 pt-16 pb-12 sm:min-h-screen sm:justify-center sm:py-16">
        <p className="text-sm font-medium tracking-wide text-seal">nice-to-meet-u</p>
        <h1 className="mt-3 max-w-md font-serif text-4xl text-ink sm:text-6xl">
          Walk in knowing what to say.
        </h1>
        <p className="mt-4 max-w-md text-base text-muted sm:text-lg">
          Name someone. nice-to-meet-u reads their public work and gives you one paragraph, what they are doing
          now, and three lines that sound like you.
        </p>
        <div className="mt-8 flex max-w-md flex-col gap-3">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
              className="min-h-12 rounded-card border border-line bg-surface px-4 text-base font-medium text-ink"
            >
              Continue with {provider.label}
            </button>
          ))}
        </div>
        <p className="mt-6 max-w-md text-sm text-muted">
          Public pages only. If it cannot find a source, it says so instead of inventing a life.
        </p>
      </div>
    </main>
  );
}

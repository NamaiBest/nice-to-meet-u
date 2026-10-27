import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, DoorOpen, ScrollText } from "lucide-react";
import type { ReactNode } from "react";
import { Landing } from "@/components/landing";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const links = [
  { to: "/", label: "Desk", icon: DoorOpen },
  { to: "/record", label: "Record", icon: ScrollText },
  { to: "/you", label: "You", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-serif text-2xl tracking-tight text-ink">
            nice-to-meet-u
          </Link>
          <p className="text-sm text-muted">Before you say hello</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 pt-6 pb-28">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-3xl grid-cols-3">
          {links.map((link) => {
            const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${
                  active ? "text-seal" : "text-muted"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

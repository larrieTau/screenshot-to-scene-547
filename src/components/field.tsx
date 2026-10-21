import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function useOnline() {
  const [online, setOnline] = useState(true);
  const [since, setSince] = useState<Date | null>(null);
  useEffect(() => {
    setOnline(navigator.onLine); setSince(new Date());
    const on = () => { setOnline(true); setSince(new Date()); };
    const off = () => setOnline(false);
    addEventListener("online", on); addEventListener("offline", off);
    return () => { removeEventListener("online", on); removeEventListener("offline", off); };
  }, []);
  return { online, since };
}

export function StaleBanner() {
  const { online, since } = useOnline();
  if (online) return null;
  return (
    <div role="status" className="bg-pending/20 px-4 py-2 text-center text-sm text-foreground">
      No connection. Showing what you had at {since?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Anything you tap will send when you're back online.
    </div>
  );
}

const tabs = [
  { to: "/", label: "Find" },
  { to: "/queue", label: "Queue" },
  { to: "/my-cuts", label: "My cuts" },
  { to: "/pro", label: "Barber" },
] as const;

export function FieldShell({ children, title, back }: { children: ReactNode; title?: string; back?: string }) {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <StaleBanner />
      <header className="flex items-center gap-3 px-5 pt-5 pb-2">
        {back ? (
          <Link to={back} aria-label="Back" className="tap -ml-3 grid place-items-center rounded-full text-2xl">‹</Link>
        ) : (
          <span className="font-display text-xl font-bold">kinyozi<span className="text-brass">.</span></span>
        )}
        {title && <h1 className="font-display text-xl font-semibold">{title}</h1>}
        <Link to="/console" className="ml-auto text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">Owner console</Link>
      </header>
      <main className="flex-1 px-5 pb-28">{children}</main>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t bg-card">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map((t) => {
            const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
            return (
              <li key={t.to}>
                <Link to={t.to} className={cn("tap flex h-14 items-center justify-center text-sm font-medium", active ? "text-brass-ink" : "text-muted-foreground")}>
                  <span className={cn("border-b-2 pb-0.5", active ? "border-brass" : "border-transparent")}>{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Pill({ tone, children, className }: { tone: "free" | "pending" | "gone" | "mute"; children: ReactNode; className?: string }) {
  const map = {
    free: "bg-free/15 text-free",
    pending: "bg-pending/25 text-foreground",
    gone: "bg-gone/15 text-gone",
    mute: "bg-muted text-muted-foreground",
  } as const;
  const dot = { free: "bg-free", pending: "bg-pending", gone: "bg-gone", mute: "bg-mute" }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide", map[tone], className)}>
      <span aria-hidden className={cn("size-2 rounded-full", dot)} />{children}
    </span>
  );
}

export function BrassButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "tap w-full rounded-lg bg-brass px-6 py-4 text-base font-bold tracking-wide text-primary-foreground transition-transform duration-150 ease-out-x active:scale-[0.98] active:bg-brass-dim disabled:opacity-40",
        className,
      )}
    />
  );
}

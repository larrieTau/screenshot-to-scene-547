import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrassButton, FieldShell } from "@/components/field";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Your place in the queue — Kinyozi" },
      { name: "description", content: "Hold your place from anywhere. We tell you when to set off." },
      { property: "og:title", content: "Live queue — Kinyozi" },
      { property: "og:description", content: "Hold your place from anywhere. We tell you when to set off." },
    ],
  }),
  component: Queue,
});

const ord = (n: number) => n + (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");
const WALK_MIN = 15;

function Queue() {
  const [pos, setPos] = useState(4);
  const [fetched, setFetched] = useState<Date | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);

  useEffect(() => { setFetched(new Date()); }, []);
  useEffect(() => {
    if (pos <= 1) return;
    const t = setTimeout(() => {
      setLeaving(0);
      setTimeout(() => { setPos((p) => p - 1); setLeaving(null); setFetched(new Date()); navigator.vibrate?.(60); }, 250);
    }, 7000);
    return () => clearTimeout(t);
  }, [pos]);

  const lo = (pos - 1) * 10, hi = (pos - 1) * 13 + 5;
  const leaveNow = lo <= WALK_MIN;

  return (
    <FieldShell title="Kato's Cuts · Ntinda">
      <div className="mt-8 flex justify-center gap-3" aria-hidden>
        {Array.from({ length: pos - 1 }).map((_, i) => (
          <svg key={`${pos}-${i}`} viewBox="0 0 24 40" className={cn("h-12 w-7 fill-ink", i === leaving && "fall-away")}>
            <circle cx="12" cy="7" r="6" /><path d="M2 40 V24 a10 10 0 0 1 20 0 V40z" />
          </svg>
        ))}
        <svg viewBox="0 0 24 40" className="h-12 w-7 fill-brass"><circle cx="12" cy="7" r="6" /><path d="M2 40 V24 a10 10 0 0 1 20 0 V40z" /></svg>
      </div>

      <div className="mt-4 text-center" aria-live="polite">
        <p className="text-sm font-bold tracking-widest text-muted-foreground">YOU ARE</p>
        <p key={pos} className="roll-in font-display text-[9rem] font-extrabold leading-none">{ord(pos)}</p>
        <p className="mt-2 text-xl font-semibold">{pos === 1 ? "You're next — head to the chair" : `About ${lo}–${hi} min`}</p>
      </div>

      <div className={cn("mt-8 rounded-lg p-5 transition-colors duration-[250ms]", leaveNow ? "bg-free text-paper" : "bg-card border")}>
        {leaveNow ? (
          <>
            <p className="font-display text-3xl font-bold">LEAVE NOW</p>
            <p>It's about a {WALK_MIN}-minute walk. You'll arrive just in time.</p>
          </>
        ) : (
          <>
            <p className="font-display text-xl font-bold">Stay where you are</p>
            <p className="text-muted-foreground">We'll buzz your phone when it's time to set off.</p>
          </>
        )}
      </div>
      <BrassButton className="mt-4" onClick={() => "Notification" in window && Notification.requestPermission()}>Turn on alerts</BrassButton>
      <p className="mt-4 text-center text-xs text-muted-foreground">Last updated {fetched?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}</p>
    </FieldShell>
  );
}

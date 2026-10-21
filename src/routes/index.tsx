import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FieldShell, Pill } from "@/components/field";
import { barbers as seed, type Barber } from "@/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find a barber near you — Kinyozi" },
      { name: "description", content: "See which Kampala barbers are free right now, and how long the wait really is." },
      { property: "og:title", content: "Find a barber near you — Kinyozi" },
      { property: "og:description", content: "Live availability for barbers in Kawempe, Ntinda, Kalerwe, Bwaise and Bugolobi." },
    ],
  }),
  component: Discover,
});

const rank = (b: Barber) => (b.status === "free" ? 0 : b.status === "queue" ? b.waitMin![0] : 9999);

function Discover() {
  const [list, setList] = useState(seed);
  const [changed, setChanged] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setList((l) => l.map((b) => {
        if (b.id !== "kato") return b;
        const lo = b.waitMin![0] === 20 ? 10 : 20;
        return { ...b, waitMin: [lo, lo + 10] };
      }));
      setChanged("kato");
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...list].sort((a, b) => rank(a) - rank(b));

  return (
    <FieldShell>
      <section className="pt-4 pb-6">
        <h1 className="font-display text-4xl font-bold leading-[1.05]">Who can cut you<br />right now?</h1>
        <p className="mt-2 text-muted-foreground">Sorted by who's free soonest.</p>
      </section>
      <ul className="space-y-3">
        {sorted.map((b, i) => (
          <li key={b.id} className="enter-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <Link to="/barber/$id" params={{ id: b.id }} className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-transform duration-150 active:scale-[0.99]">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-bone">{b.initials}</div>
              <div className="min-w-0 flex-1">
                <div key={changed === b.id ? b.waitMin?.[0] : undefined} className={changed === b.id ? "pulse-once origin-left" : ""}>
                  {b.status === "free" && <Pill tone="free">FREE NOW</Pill>}
                  {b.status === "queue" && <Pill tone="pending">~{b.waitMin![0]}–{b.waitMin![1]} MIN</Pill>}
                  {b.status === "closed" && <Pill tone="mute">CLOSED</Pill>}
                </div>
                <p className="mt-1.5 truncate font-semibold">{b.name}</p>
                <p className="text-sm text-muted-foreground">{b.area}</p>
              </div>
              <span aria-hidden className="text-2xl text-muted-foreground">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/offer" className="mt-6 block rounded-lg border-2 border-dashed border-pending p-4 text-sm">
        <span className="font-bold">A slot just opened at Kato's Cuts, 11:30 AM.</span> Tap to see the offer.
      </Link>
    </FieldShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { chairs as seedChairs, revenueSeries, ugx, waiting as seedWaiting } from "@/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/console")({
  head: () => ({
    meta: [
      { title: "Floor — Kinyozi Console" },
      { name: "description", content: "Every chair, every waiting client and today's takings in one view." },
      { property: "og:title", content: "Kinyozi Console" },
      { property: "og:description", content: "Every chair, every waiting client and today's takings in one view." },
    ],
  }),
  component: Console,
});

type Chair = { id: string; barber: string; client: string | null; started: number };
type Waiter = (typeof seedWaiting)[number];

function useCount(target: number, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(target);
    let raf = 0; const t0 = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / 700));
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);
  return v;
}

function pathFor(data: number[], w = 600, h = 160, n = 12) {
  const max = Math.max(...data);
  const pts = Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * (data.length - 1);
    const a = data[Math.floor(x)], b = data[Math.min(data.length - 1, Math.ceil(x))];
    const v = a + (b - a) * (x - Math.floor(x));
    return [(i / (n - 1)) * w, h - (v / max) * (h - 16) - 8];
  });
  return "M" + pts.map((p) => p.join(",")).join(" L");
}

function Console() {
  const [chairs, setChairs] = useState<Chair[]>(seedChairs);
  const [queue, setQueue] = useState<Waiter[]>(seedWaiting);
  const [drawer, setDrawer] = useState<Chair | null>(null);
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [drag, setDrag] = useState<Waiter | null>(null);
  const [hint, setHint] = useState("");
  const cursor = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!drag || matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const loop = () => {
      const p = pos.current; p.x += (p.tx - p.x) * 0.25; p.y += (p.ty - p.y) * 0.25;
      if (cursor.current) cursor.current.style.transform = `translate(${p.x + 14}px, ${p.y + 14}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drag]);

  const busy = chairs.filter((c) => c.client).length;
  const revenue = useCount(685000, 0), cuts = useCount(31, 40), wait = useCount(14, 80), inUse = useCount(busy, 120);

  function assign(chair: Chair) {
    if (!drag || chair.client) return;
    setChairs((l) => l.map((c) => (c.id === chair.id ? { ...c, client: drag.name, started: 0 } : c)));
    setQueue((q) => q.filter((w) => w.id !== drag.id));
  }

  return (
    <div className="console min-h-screen bg-background text-foreground" onDragOver={(e) => { pos.current.tx = e.clientX; pos.current.ty = e.clientY; }}>
      <header className="flex items-center gap-8 border-b px-8 py-4">
        <span className="font-display text-xl font-bold">kinyozi<span className="text-brass">.</span> <span className="text-sm font-medium text-muted-foreground">Kato's Cuts · Ntinda</span></span>
        <nav className="flex gap-6 text-sm">
          <span className="border-b-2 border-brass pb-1 font-semibold">Floor</span>
          <span className="text-muted-foreground">Schedule</span><span className="text-muted-foreground">Staff</span><span className="text-muted-foreground">Clients</span><span className="text-muted-foreground">Stock</span>
        </nav>
        <Link to="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground">Open client app →</Link>
      </header>

      <div className={cn("grid grid-cols-[1fr_300px] gap-6 p-8 transition-[transform,opacity] duration-[250ms] ease-out-x", drawer && "scale-[0.99] opacity-60")}>
        <div>
          <section className="grid grid-cols-4 gap-4">
            {[["Revenue today", ugx(revenue)], ["Cuts done", cuts], ["Average wait", `${wait} min`], ["Chairs in use", `${inUse} / ${chairs.length}`]].map(([k, v]) => (
              <div key={k as string} className="rounded-lg border bg-card p-5">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{k}</p>
                <p className="mt-2 font-display text-3xl font-bold">{v}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Revenue</h2>
              <div className="flex rounded-full bg-muted p-1 text-sm" role="tablist">
                {(["day", "week", "month"] as const).map((r) => (
                  <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)} className={cn("rounded-full px-4 py-1 capitalize transition-colors duration-150", range === r && "bg-brass text-primary-foreground")}>{r}</button>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 600 160" className="mt-4 h-40 w-full" aria-label={`Revenue by ${range}`}>
              <path d={pathFor(revenueSeries[range])} fill="none" stroke="var(--brass)" strokeWidth="3" strokeLinejoin="round" style={{ transition: "d 700ms cubic-bezier(0.65,0,0.35,1)" }} />
            </svg>
          </section>

          <h2 className="mt-8 font-display text-lg font-semibold">Floor</h2>
          <section className="mt-3 grid grid-cols-3 gap-4">
            {chairs.map((c) => (
              <button key={c.id}
                onClick={() => c.client && setDrawer(c)}
                onDragOver={(e) => { e.preventDefault(); setHint(c.client ? "Chair busy" : "Drop to assign"); }}
                onDrop={() => assign(c)}
                className={cn("rounded-xl border bg-card p-5 text-left transition-transform duration-[250ms] ease-spring-x hover:scale-[1.03]", c.client ? "breathe border-brass/40" : "border-dashed")}
                style={c.client ? { animationDuration: `${Math.max(1.4, 4 - c.started / 20)}s` } : undefined}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{c.barber}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", c.client ? "bg-pending/20 text-pending" : "bg-free/20 text-free")}>{c.client ? "BUSY" : "FREE"}</span>
                </div>
                <p className="mt-6 font-display text-xl font-bold">{c.client ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{c.client ? `${c.started} min in chair` : "Drag a waiting client here"}</p>
              </button>
            ))}
          </section>
        </div>

        <aside onDragOver={(e) => { e.preventDefault(); setHint("Release back to queue"); }} className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Waiting · {queue.length}</h2>
          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nobody waiting. Walk-ins and remote joins appear here.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {queue.map((w) => (
                <li key={w.id} draggable
                  onDragStart={(e) => { setDrag(w); pos.current = { x: e.clientX, y: e.clientY, tx: e.clientX, ty: e.clientY }; const img = new Image(); e.dataTransfer.setDragImage(img, 0, 0); }}
                  onDragEnd={() => { setDrag(null); setHint(""); }}
                  className={cn("cursor-grab rounded-lg border bg-muted p-3 transition-opacity duration-150 active:cursor-grabbing", drag?.id === w.id && "opacity-40")}>
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.service} · {w.kind} · {w.wait} min</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {drag && hint && (
        <div ref={cursor} aria-hidden className="pointer-events-none fixed top-0 left-0 z-50 rounded-full bg-brass px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">{hint}</div>
      )}

      {drawer && (
        <>
          <button aria-label="Close" className="fixed inset-0 z-40 cursor-default" onClick={() => setDrawer(null)} />
          <aside className="enter-up fixed top-0 right-0 z-50 h-full w-96 border-l bg-card p-8" style={{ animationName: "none", transform: "none" }}>
            <p className="text-xs font-bold tracking-widest text-brass">IN {drawer.barber.toUpperCase()}'S CHAIR</p>
            <h2 className="mt-2 font-display text-3xl font-bold">{drawer.client}</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Time in chair</dt><dd>{drawer.started} min</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Visits</dt><dd>9</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Lifetime spend</dt><dd>{ugx(215000)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">No-shows</dt><dd>0</dd></div>
            </dl>
            <button onClick={() => { setChairs((l) => l.map((c) => (c.id === drawer.id ? { ...c, client: null, started: 0 } : c))); setDrawer(null); }} className="mt-8 w-full rounded-lg bg-brass py-3 font-bold text-primary-foreground">Mark finished</button>
          </aside>
        </>
      )}
    </div>
  );
}

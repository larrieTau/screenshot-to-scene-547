import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FieldShell } from "@/components/field";
import { todayTimeline, ugx } from "@/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Today — Kinyozi for barbers" },
      { name: "description", content: "Who's next, what's unconfirmed, and one tap to start or finish." },
      { property: "og:title", content: "Today — Kinyozi for barbers" },
      { property: "og:description", content: "Who's next, what's unconfirmed, and one tap to start or finish." },
    ],
  }),
  component: Today,
});

type Item = (typeof todayTimeline)[number] & { state: string };

function Today() {
  const [items, setItems] = useState<Item[]>([...todayTimeline]);
  const [cutting, setCutting] = useState(false);
  const [release, setRelease] = useState<null | "ask" | "sending" | "claimed">(null);
  const [expiry, setExpiry] = useState(5);

  const now = items.find((i) => i.state === "now");
  const earned = items.filter((i) => i.state === "done").reduce((s, i) => s + i.price, 0);

  function toggle() {
    if (!cutting) return setCutting(true);
    setCutting(false);
    setItems((l) => {
      const idx = l.findIndex((i) => i.state === "now");
      return l.map((i, k) => (k === idx ? { ...i, state: "done" } : k === l.findIndex((j, n) => n > idx && j.state === "confirmed") ? { ...i, state: "now" } : i));
    });
  }
  const setState = (id: string, state: string) => setItems((l) => l.map((i) => (i.id === id ? { ...i, state } : i)));

  return (
    <FieldShell title="Today">
      <p className="mt-1 text-sm text-muted-foreground">Ronnie · Kawempe · earned <span className="font-semibold text-foreground">{ugx(earned)}</span></p>

      {now ? (
        <section className="sticky top-0 z-10 mt-4 rounded-lg bg-ink p-5 text-bone">
          <p className="text-xs font-bold tracking-widest text-brass">{cutting ? "CUTTING NOW" : "NEXT UP"}</p>
          <p className="mt-1 font-display text-3xl font-bold">{now.client}</p>
          <p className="opacity-70">{now.service} · {now.time} · {now.place}</p>
          <button onClick={toggle} className={cn("tap mt-4 w-full rounded-lg py-5 font-display text-2xl font-extrabold transition-colors duration-150", cutting ? "bg-free text-paper" : "bg-brass text-primary-foreground")}>
            {cutting ? "FINISH" : "START"}
          </button>
          {cutting && <p className="mt-2 text-center text-xs opacity-60">Finishing tells the next client to set off.</p>}
        </section>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed p-6 text-center"><p className="font-semibold">Nobody waiting right now.</p><p className="text-sm text-muted-foreground">New requests will appear here.</p></div>
      )}

      <ol className="mt-6 space-y-3 border-l-2 border-border pl-4">
        {items.filter((i) => i.state !== "now").map((i) => (
          <li key={i.id} className={cn("relative rounded-lg bg-card p-4", i.state === "pending" ? "border-2 border-dashed border-pending" : "border", i.state === "done" && "opacity-50", i.state === "cancelled" && "opacity-60")}>
            <span aria-hidden className={cn("absolute -left-[23px] top-5 size-3 rounded-full", { pending: "bg-pending", confirmed: "bg-free", done: "bg-mute", cancelled: "bg-gone" }[i.state])} />
            <div className="flex items-baseline justify-between">
              <span className="font-display text-xl font-bold">{i.time}</span>
              <span className="text-xs font-bold tracking-wider">{i.state === "pending" ? "NEEDS YOUR OK" : i.state === "done" ? "DONE" : i.state === "cancelled" ? "CANCELLED" : "CONFIRMED"}</span>
            </div>
            <p className="font-semibold">{i.client}</p>
            <p className="text-sm text-muted-foreground">{i.service} · {i.place} · {ugx(i.price)}</p>
            {i.state === "pending" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setState(i.id, "cancelled")} className="tap rounded-lg border font-semibold">Decline</button>
                <button onClick={() => setState(i.id, "confirmed")} className="tap rounded-lg bg-brass font-bold text-primary-foreground">Accept</button>
              </div>
            )}
            {i.state === "confirmed" && (
              <button onClick={() => { setState(i.id, "cancelled"); setRelease("ask"); }} className="mt-2 text-sm font-medium text-gone underline underline-offset-4">Client cancelled</button>
            )}
          </li>
        ))}
      </ol>

      {release && (
        <div role="dialog" aria-label="Release slot" className="fixed inset-x-0 bottom-14 z-30 mx-auto max-w-md p-4">
          <div className="enter-up rounded-lg bg-ink p-5 text-bone shadow-2xl">
            {release === "ask" && (
              <>
                <p className="font-display text-xl font-bold">Offer this hour to regulars nearby?</p>
                <p className="mt-1 text-sm opacity-70">7 regulars have come at this time before.</p>
                <label className="mt-4 block text-sm">Offer ends in
                  <select value={expiry} onChange={(e) => setExpiry(+e.target.value)} className="tap ml-2 rounded-sm bg-slate px-2">
                    {[3, 5, 10].map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </label>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setRelease(null)} className="tap rounded-lg border border-line font-semibold">Leave it</button>
                  <button onClick={() => { setRelease("sending"); setTimeout(() => setRelease("claimed"), 2400); }} className="tap rounded-lg bg-brass font-bold text-primary-foreground">Send offer</button>
                </div>
              </>
            )}
            {release === "sending" && (
              <div aria-live="polite" className="text-center">
                <div className="relative mx-auto my-3 size-20">
                  {[0, 1, 2].map((k) => <span key={k} className="absolute inset-0 animate-ping rounded-full border-2 border-brass" style={{ animationDelay: `${k * 300}ms` }} />)}
                  <span className="absolute inset-7 rounded-full bg-brass" />
                </div>
                <p className="font-semibold">Sent to 7 regulars. Waiting for a claim…</p>
              </div>
            )}
            {release === "claimed" && (
              <>
                <p className="font-display text-xl font-bold text-free">Claimed by Musa Kiggundu.</p>
                <p className="text-sm opacity-70">It's back on your timeline.</p>
                <button onClick={() => setRelease(null)} className="tap mt-3 w-full rounded-lg bg-brass font-bold text-primary-foreground">Good</button>
              </>
            )}
          </div>
        </div>
      )}
    </FieldShell>
  );
}

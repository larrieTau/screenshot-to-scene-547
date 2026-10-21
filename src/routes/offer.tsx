import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrassButton } from "@/components/field";
import { ugx } from "@/mock/data";

export const Route = createFileRoute("/offer")({
  head: () => ({
    meta: [
      { title: "A slot just opened — Kinyozi" },
      { name: "description", content: "A regular cancelled. Claim the slot before it expires." },
      { property: "og:title", content: "Freed slot offer — Kinyozi" },
      { property: "og:description", content: "A regular cancelled. Claim the slot before it expires." },
    ],
  }),
  component: Offer,
});

const TOTAL = 300;

function Offer() {
  const [left, setLeft] = useState(TOTAL);
  const [state, setState] = useState<"open" | "claimed" | "taken" | "expired">("open");

  useEffect(() => {
    if (state !== "open") return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { setState("expired"); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [state]);

  const r = 88, c = 2 * Math.PI * r;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-ink px-6 py-8 text-bone">
      <Link to="/" className="tap -ml-3 grid w-12 place-items-center text-2xl" aria-label="Close">×</Link>
      <p className="mt-4 text-xs font-bold tracking-widest text-pending">FREED SLOT · FOR REGULARS NEARBY</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Kato's Cuts, Ntinda<br />11:30 AM today</h1>
      <p className="mt-1 opacity-70">Skin fade · {ugx(25000)} · you've come at this hour before</p>

      <div className="relative mx-auto mt-10 size-52" aria-live="polite">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90">
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--brass)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - left / TOTAL)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><p className="font-display text-5xl font-extrabold">{mm}:{ss}</p><p className="text-xs opacity-60">left to claim</p></div>
        </div>
      </div>

      <div className="mt-auto pt-10">
        {state === "open" && (
          <>
            <BrassButton onClick={() => setState(Math.random() < 0.25 ? "taken" : "claimed")}>CLAIM IT</BrassButton>
            <Link to="/" className="tap mt-3 flex items-center justify-center font-medium opacity-80">Not now</Link>
          </>
        )}
        {state === "claimed" && <Result tone="bg-free" title="It's yours." body="Kato has it too. Be there by 11:30 AM." />}
        {state === "taken" && <Result tone="bg-slate" title="Taken — someone got there first" body="We'll offer you the next one that opens near you." />}
        {state === "expired" && <Result tone="bg-slate" title="This offer has ended" body="Nobody was charged. Watch for the next one." />}
      </div>
    </div>
  );
}

function Result({ tone, title, body }: { tone: string; title: string; body: string }) {
  return (
    <div className={`enter-up rounded-lg p-5 ${tone}`}>
      <p className="font-display text-2xl font-bold">{title}</p>
      <p className="mt-1 opacity-90">{body}</p>
      <Link to="/" className="mt-4 inline-block font-semibold underline">Back to barbers</Link>
    </div>
  );
}

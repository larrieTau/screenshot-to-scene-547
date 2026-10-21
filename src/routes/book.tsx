import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrassButton, FieldShell } from "@/components/field";
import { barbers, clock, daysAhead, PREFERRED_BARBER, services, slotsFor, spokenTime, ugx } from "@/mock/data";
import { addBooking } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>) => ({ barber: typeof s.barber === "string" ? s.barber : undefined }),
  head: () => ({
    meta: [
      { title: "Book a cut — Kinyozi" },
      { name: "description", content: "Four taps: service, barber, time, confirm." },
      { property: "og:title", content: "Book a cut — Kinyozi" },
      { property: "og:description", content: "Four taps: service, barber, time, confirm." },
    ],
  }),
  component: Wizard,
});

const STEPS = ["Service", "Barber", "Time", "Confirm"];

function Wizard() {
  const { barber: pre } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setService] = useState<string>();
  const [barberId, setBarber] = useState<string | undefined>(pre);
  const [day, setDay] = useState(() => daysAhead()[0].toISOString());
  const [time, setTime] = useState<string>();
  const [sealing, setSealing] = useState(false);

  const service = services.find((s) => s.id === serviceId);
  const barber = barbers.find((b) => b.id === barberId);
  const at = time ? new Date(time) : undefined;

  const next = (n: number) => setStep(n);
  const ordered = [...barbers].filter((b) => b.status !== "closed").sort((a, b) => (a.id === PREFERRED_BARBER ? -1 : b.id === PREFERRED_BARBER ? 1 : 0));

  function confirm() {
    if (!service || !barber || !at) return;
    setSealing(true);
    const b = addBooking({ barberId: barber.id, barberName: barber.name, area: barber.area, serviceName: service.name, minutes: service.minutes, price: service.price, time: at.toISOString() });
    setTimeout(() => navigate({ to: "/slip/$ref", params: { ref: b.ref } }), 450);
  }

  return (
    <FieldShell back={step === 0 ? "/" : undefined} title="Book">
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="tap -ml-2 mb-1 px-2 text-sm font-medium text-muted-foreground">‹ Back</button>
      )}
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of 4: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <div key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brass transition-transform duration-[400ms] ease-out-x origin-left" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} />
          </div>
        ))}
      </div>

      {(service || barber || at) && step > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-ink px-4 py-3 text-sm text-bone transition-all duration-[250ms] ease-out-x">
          {service && <span>{service.name} · {ugx(service.price)}</span>}
          {barber && step > 1 && <span className="opacity-70">with {barber.name.split(" ")[0]}</span>}
          {at && step > 2 && <span className="font-semibold text-brass">{clock(at)}</span>}
        </div>
      )}

      <div key={step} className="step-wipe mt-6">
        {step === 0 && (
          <>
            <h2 className="font-display text-3xl font-bold">What are we doing?</h2>
            <ul className="mt-4 space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => { setService(s.id); setTimeout(() => next(barberId ? 2 : 1), 180); }}
                    className={cn("tap flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left transition-transform duration-[250ms] ease-spring-x", serviceId === s.id && "-translate-y-1 border-brass shadow-[0_6px_0_-2px_var(--brass)]")}
                  >
                    <span><span className="block font-semibold">{s.name}</span><span className="text-sm text-muted-foreground">{s.minutes} min</span></span>
                    <span className="font-display text-lg font-bold">{ugx(s.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-3xl font-bold">Who cuts?</h2>
            <ul className="mt-4 space-y-3">
              {ordered.map((b) => (
                <li key={b.id}>
                  <button onClick={() => { setBarber(b.id); setTimeout(() => next(2), 180); }}
                    className={cn("tap flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-transform duration-[250ms] ease-spring-x", barberId === b.id && "-translate-y-1 border-brass")}>
                    <span className="grid size-11 place-items-center rounded-full bg-ink text-sm font-bold text-bone">{b.initials}</span>
                    <span className="flex-1">
                      {b.id === PREFERRED_BARBER && <span className="mb-1 block text-xs font-bold tracking-widest text-brass-ink">YOUR BARBER</span>}
                      <span className="block font-semibold">{b.name}</span>
                      <span className="text-sm text-muted-foreground">Soonest: {b.soonest}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 2 && barber && (
          <>
            <h2 className="font-display text-3xl font-bold">When?</h2>
            <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2">
              {daysAhead().map((d) => {
                const on = d.toISOString() === day;
                return (
                  <button key={d.toISOString()} onClick={() => { setDay(d.toISOString()); setTime(undefined); }}
                    className={cn("tap flex shrink-0 flex-col items-center rounded-lg border px-4 py-2", on ? "border-brass bg-ink text-bone" : "bg-card")}>
                    <span className="text-xs uppercase">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                    <span className="font-display text-xl font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {slotsFor(new Date(day), barber.id).map(({ time: t, taken }) => (
                <li key={t.toISOString()}>
                  <button disabled={taken} aria-label={`${clock(t)}${taken ? ", taken" : ""}`}
                    onClick={() => { setTime(t.toISOString()); setTimeout(() => next(3), 220); }}
                    className={cn("tap w-full rounded-lg border py-3 font-semibold transition-colors duration-150", taken ? "bg-muted text-muted-foreground line-through" : time === t.toISOString() ? "border-brass bg-brass text-primary-foreground" : "bg-card")}>
                    {clock(t)}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 3 && service && barber && at && (
          <>
            <h2 className="font-display text-3xl font-bold">Check the time.</h2>
            <div className={cn("mt-4 rounded-lg border-2 border-ink bg-card p-6", sealing && "seal-in")}>
              <p className="font-display text-6xl font-extrabold leading-none">{clock(at)}</p>
              <p className="mt-2 text-lg font-semibold capitalize">{spokenTime(at)}</p>
              <p className="text-muted-foreground">{at.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>
              <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Barber</dt><dd className="font-semibold">{barber.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Where</dt><dd className="font-semibold">{barber.area}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Service</dt><dd className="font-semibold">{service.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Price</dt><dd className="font-semibold">{ugx(service.price)}</dd></div>
              </dl>
            </div>
            <BrassButton className="mt-6" onClick={confirm} disabled={sealing}>{sealing ? "Sealing…" : "CONFIRM BOOKING"}</BrassButton>
            <p className="mt-3 text-center text-sm text-muted-foreground">Nothing is booked until you tap confirm.</p>
          </>
        )}
      </div>
    </FieldShell>
  );
}

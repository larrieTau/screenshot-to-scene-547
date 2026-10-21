import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { FieldShell } from "@/components/field";
import { clock, spokenTime, ugx } from "@/mock/data";
import { sealBooking, useBookings } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/slip/$ref")({
  head: () => ({
    meta: [
      { title: "Your booking slip — Kinyozi" },
      { name: "description", content: "The shared booking record you and your barber both hold." },
      { property: "og:title", content: "Booking slip — Kinyozi" },
      { property: "og:description", content: "The shared booking record you and your barber both hold." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Slip,
});

function Slip() {
  const { ref } = Route.useParams();
  const b = useBookings().find((x) => x.ref === ref);

  useEffect(() => {
    if (b && !b.sealed) {
      const t = setTimeout(() => sealBooking(b.ref), 1600);
      return () => clearTimeout(t);
    }
  }, [b]);

  if (!b) {
    return (
      <FieldShell back="/">
        <div className="mt-16 text-center">
          <p className="font-display text-2xl font-bold">We can't find that slip on this phone.</p>
          <p className="mt-2 text-muted-foreground">It may have been made on another device.</p>
          <Link to="/my-cuts" className="mt-6 inline-block font-semibold text-brass-ink underline">See my bookings</Link>
        </div>
      </FieldShell>
    );
  }
  const at = new Date(b.time);
  const end = new Date(at.getTime() + b.minutes * 60000);
  const ics = `data:text/calendar;charset=utf8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${b.serviceName} with ${b.barberName}\nLOCATION:${b.area}\nDTSTART:${fmt(at)}\nDTEND:${fmt(end)}\nEND:VEVENT\nEND:VCALENDAR`)}`;

  return (
    <FieldShell back="/" title="Booking slip">
      <article key={String(b.sealed)} className={cn("mt-4 overflow-hidden rounded-lg bg-card shadow-[0_1px_0_var(--line)]", b.sealed && "seal-in")} aria-live="polite">
        <div className="relative h-12 overflow-hidden bg-pending/25">
          <p className="absolute inset-0 grid place-items-center text-xs font-bold tracking-widest">WAITING FOR BARBER TO CONFIRM…</p>
          {b.sealed && (
            <p className="band-slide absolute inset-0 grid place-items-center bg-free text-xs font-bold tracking-widest text-paper">✓ CONFIRMED — BARBER HAS THIS TOO</p>
          )}
        </div>
        <div className="p-6">
          <p className="font-display text-6xl font-extrabold leading-none">{clock(at)}</p>
          <p className="mt-2 font-semibold capitalize">{spokenTime(at)}</p>
          <p className="text-sm text-muted-foreground">{at.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Barber</dt><dd className="font-semibold">{b.barberName}</dd></div>
            <div><dt className="text-muted-foreground">Where</dt><dd className="font-semibold">{b.area}</dd></div>
            <div><dt className="text-muted-foreground">Service</dt><dd className="font-semibold">{b.serviceName}</dd></div>
            <div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold">{ugx(b.price)}</dd></div>
          </dl>
        </div>
        <div className="perforated h-3 bg-bone" aria-hidden />
        <div className={cn("flex items-center justify-between border-t border-dashed px-6 py-4 transition-shadow duration-500", b.sealed && "shadow-[inset_0_2px_6px_var(--line)]")}>
          <span className="text-xs text-muted-foreground">Reference</span>
          <span className="font-display text-2xl font-bold tracking-widest">{b.ref}</span>
        </div>
      </article>
      <a href={ics} download={`${b.ref}.ics`} className="tap mt-5 flex items-center justify-center rounded-lg border border-ink font-semibold">Add to calendar</a>
      <Link to="/book" search={{ barber: b.barberId }} className="mt-4 block text-center text-sm font-medium text-brass-ink underline underline-offset-4">Need to change this?</Link>
      <p className="mt-6 text-center text-xs text-muted-foreground">Saved on this phone — opens without data.</p>
    </FieldShell>
  );
}

function fmt(d: Date) { return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; }

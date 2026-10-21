import { createFileRoute, Link } from "@tanstack/react-router";
import { FieldShell } from "@/components/field";
import { clock, ugx } from "@/mock/data";
import { useBookings } from "@/lib/store";

export const Route = createFileRoute("/my-cuts")({
  head: () => ({
    meta: [
      { title: "My cuts — Kinyozi" },
      { name: "description", content: "Your bookings and past cuts. Rebook in one tap." },
      { property: "og:title", content: "My cuts — Kinyozi" },
      { property: "og:description", content: "Your bookings and past cuts. Rebook in one tap." },
    ],
  }),
  component: MyCuts,
});

const past = [
  { id: "p1", barber: "kato", name: "Kato's Cuts", service: "Skin fade", date: "12 Oct", price: 25000 },
  { id: "p2", barber: "kato", name: "Kato's Cuts", service: "Cut + beard line-up", date: "28 Sep", price: 30000 },
];

function MyCuts() {
  const bookings = useBookings();
  return (
    <FieldShell title="My cuts">
      <h2 className="mt-4 font-display text-lg font-semibold">Coming up</h2>
      {bookings.length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed p-6 text-center">
          <p className="font-semibold">No bookings yet.</p>
          <p className="text-sm text-muted-foreground">Your slips will appear here and open even without data.</p>
          <Link to="/book" search={{ barber: undefined }} className="mt-3 inline-block font-semibold text-brass-ink underline">Book a cut</Link>
        </div>
      ) : (
        <ul className="mt-2 space-y-2">
          {bookings.map((b) => (
            <li key={b.ref}>
              <Link to="/slip/$ref" params={{ ref: b.ref }} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <span><span className="block font-semibold">{b.serviceName}</span><span className="text-sm text-muted-foreground">{b.barberName} · {new Date(b.time).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></span>
                <span className="font-display text-xl font-bold">{clock(new Date(b.time))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 font-display text-lg font-semibold">Past cuts</h2>
      <ul className="mt-2 space-y-2">
        {past.map((p) => (
          <li key={p.id} className="rounded-lg border bg-card p-4">
            <div className="flex justify-between"><span className="font-semibold">{p.service}</span><span>{ugx(p.price)}</span></div>
            <p className="text-sm text-muted-foreground">{p.name} · {p.date}</p>
            <Link to="/book" search={{ barber: p.barber }} className="tap mt-3 inline-flex items-center rounded-lg border border-brass px-4 font-semibold text-brass-ink">Book this again</Link>
          </li>
        ))}
      </ul>
    </FieldShell>
  );
}

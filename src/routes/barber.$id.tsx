import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FieldShell, Pill } from "@/components/field";
import { barbers, services, ugx } from "@/mock/data";

export const Route = createFileRoute("/barber/$id")({
  loader: ({ params }) => {
    const b = barbers.find((x) => x.id === params.id);
    if (!b) throw notFound();
    return b;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — prices & queue · Kinyozi` : "Barber · Kinyozi" },
      { name: "description", content: "Full price list, live queue and past cuts." },
      { property: "og:title", content: loaderData ? `${loaderData.name} on Kinyozi` : "Barber on Kinyozi" },
      { property: "og:description", content: "Full price list, live queue and past cuts." },
    ],
  }),
  component: Profile,
});

const gallery = ["Low fade", "Taper + part", "Waves", "Beard sculpt", "Buzz", "Kids high-top"];

function Profile() {
  const b = Route.useLoaderData();
  return (
    <FieldShell back="/">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-bold">{b.name}</h1>
        <p className="text-muted-foreground">{b.area}</p>
      </div>

      <section aria-label="Live queue" className="mt-5 rounded-lg bg-ink p-5 text-bone">
        <p className="text-xs font-bold tracking-widest opacity-60">LIVE QUEUE</p>
        {b.status === "free" ? (
          <p className="mt-1 font-display text-4xl font-bold">Free now</p>
        ) : b.status === "closed" ? (
          <p className="mt-1 font-display text-4xl font-bold">Closed today</p>
        ) : (
          <>
            <p className="mt-1 font-display text-4xl font-bold">{b.queue} waiting</p>
            <p className="opacity-70">About {b.waitMin![0]}–{b.waitMin![1]} min if you join now</p>
          </>
        )}
        {b.status !== "closed" && (
          <Link to="/queue" className="tap mt-4 inline-flex items-center rounded-lg border border-brass px-4 font-semibold text-brass">Join the queue remotely</Link>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold">Prices</h2>
        <p className="text-sm text-muted-foreground">What you see is what you pay. No extras added at the chair.</p>
        <ul className="mt-3 divide-y rounded-lg border bg-card">
          {services.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between px-4 py-3">
              <span>{s.name} <span className="text-sm text-muted-foreground">· {s.minutes} min</span></span>
              <span className="font-semibold">{ugx(s.price)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold">Past cuts</h2>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {gallery.map((g, i) => (
            <li key={g} className="flex aspect-square items-end rounded-lg bg-slate p-2 text-xs font-medium text-bone" style={{ opacity: 1 - i * 0.07 }}>{g}</li>
          ))}
        </ul>
      </section>

      <Link to="/book" search={{ barber: b.id }} className="tap mt-6 flex w-full items-center justify-center rounded-lg bg-brass py-4 font-bold text-primary-foreground">Book a time</Link>
    </FieldShell>
  );
}

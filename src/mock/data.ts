export type Status = "free" | "queue" | "closed";

export interface Service { id: string; name: string; minutes: number; price: number }
export interface Barber {
  id: string; name: string; area: string; mobile: boolean;
  status: Status; waitMin?: [number, number]; queue: number; initials: string; soonest: string;
}

export const services: Service[] = [
  { id: "s1", name: "Classic cut", minutes: 30, price: 15000 },
  { id: "s2", name: "Skin fade", minutes: 45, price: 25000 },
  { id: "s3", name: "Cut + beard line-up", minutes: 50, price: 30000 },
  { id: "s4", name: "Kids cut", minutes: 25, price: 10000 },
  { id: "s5", name: "Full grooming", minutes: 75, price: 50000 },
];

export const barbers: Barber[] = [
  { id: "ronnie", name: "Ronnie Ssemakula", area: "Kawempe · mobile", mobile: true, status: "free", queue: 0, initials: "RS", soonest: "Now" },
  { id: "kato", name: "Kato's Cuts", area: "Ntinda", mobile: false, status: "queue", waitMin: [20, 30], queue: 3, initials: "KC", soonest: "11:30 AM" },
  { id: "brian", name: "Brian Okello", area: "Kalerwe", mobile: false, status: "queue", waitMin: [40, 55], queue: 5, initials: "BO", soonest: "12:15 PM" },
  { id: "musoke", name: "Musoke Grooming", area: "Bugolobi", mobile: false, status: "free", queue: 0, initials: "MG", soonest: "Now" },
  { id: "ivan", name: "Ivan Mugisha", area: "Bwaise · mobile", mobile: true, status: "closed", queue: 0, initials: "IM", soonest: "Tomorrow" },
];

export const PREFERRED_BARBER = "kato";

export const ugx = (n: number) => `UGX ${n.toLocaleString("en-UG")}`;

const words = ["twelve","one","two","three","four","five","six","seven","eight","nine","ten","eleven"];
export function spokenTime(d: Date) {
  const h = d.getHours(), m = d.getMinutes();
  const hw = words[h % 12];
  const min = m === 0 ? "o'clock" : m === 30 ? "thirty" : m === 15 ? "fifteen" : m === 45 ? "forty-five" : String(m);
  const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  return `${hw} ${min}, ${day} ${part}`;
}
export const clock = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function daysAhead(n = 6) {
  const out: Date[] = [];
  const base = new Date(); base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) { const d = new Date(base); d.setDate(base.getDate() + i); out.push(d); }
  return out;
}

export function slotsFor(day: Date, barberId: string) {
  const out: { time: Date; taken: boolean }[] = [];
  const seed = barberId.length + day.getDate();
  for (let h = 7; h < 20; h++) for (const m of [0, 30]) {
    const t = new Date(day); t.setHours(h, m, 0, 0);
    const past = t.getTime() < Date.now();
    out.push({ time: t, taken: past || (h * 7 + m + seed) % 3 === 0 });
  }
  return out;
}

export const todayTimeline = [
  { id: "t1", client: "Musa Kiggundu", service: "Skin fade", time: "9:00 AM", place: "Kawempe stage", price: 25000, state: "done" },
  { id: "t2", client: "Joseph Lubega", service: "Classic cut", time: "10:00 AM", place: "Kalerwe market", price: 15000, state: "now" },
  { id: "t3", client: "Daniel Waiswa", service: "Cut + beard line-up", time: "11:30 AM", place: "Bwaise, near Total", price: 30000, state: "confirmed" },
  { id: "t4", client: "Peter Ochieng", service: "Kids cut ×2", time: "1:00 PM", place: "Kawempe, home visit", price: 20000, state: "pending" },
  { id: "t5", client: "Samuel Kasozi", service: "Skin fade", time: "3:30 PM", place: "Kalerwe", price: 25000, state: "confirmed" },
] as const;

export const chairs = [
  { id: "c1", barber: "Kato", client: "Isaac Nsubuga", started: 22 },
  { id: "c2", barber: "Brian", client: null, started: 0 },
  { id: "c3", barber: "Sharif", client: "Henry Mukasa", started: 41 },
  { id: "c4", barber: "Moses", client: null, started: 0 },
  { id: "c5", barber: "Hassan", client: "Allan Byaruhanga", started: 8 },
  { id: "c6", barber: "Edgar", client: null, started: 0 },
];

export const waiting = [
  { id: "w1", name: "Robert Tumusiime", service: "Skin fade", kind: "Walk-in", wait: 12 },
  { id: "w2", name: "Godfrey Ouma", service: "Classic cut", kind: "Booked 11:30", wait: 4 },
  { id: "w3", name: "Paul Kizza", service: "Beard line-up", kind: "Walk-in", wait: 2 },
];

export const revenueSeries = {
  day: [40, 55, 30, 70, 90, 120, 80, 105, 140, 125, 160, 150],
  week: [420, 510, 380, 600, 720, 890, 640],
  month: [2100, 2600, 2400, 3100],
};

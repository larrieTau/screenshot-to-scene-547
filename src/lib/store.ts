import { useSyncExternalStore } from "react";

export interface Booking {
  ref: string; barberId: string; barberName: string; area: string;
  serviceName: string; minutes: number; price: number; time: string; // ISO
  sealed: boolean; createdAt: string;
}

const KEY = "kinyozi.bookings.v1";
const listeners = new Set<() => void>();
let cache: Booking[] | null = null;
const EMPTY: Booking[] = [];

function read(): Booking[] {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { cache = []; }
  return cache!;
}
function write(next: Booking[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  localStorage.setItem(KEY + ".synced", new Date().toISOString());
  listeners.forEach((l) => l());
}

export function useBookings() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    read,
    () => EMPTY,
  );
}

export function addBooking(b: Omit<Booking, "ref" | "sealed" | "createdAt">) {
  const ref = "KZ-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const booking: Booking = { ...b, ref, sealed: false, createdAt: new Date().toISOString() };
  write([booking, ...read()]);
  return booking;
}
export function sealBooking(ref: string) {
  write(read().map((b) => (b.ref === ref ? { ...b, sealed: true } : b)));
}
export function lastSynced() {
  return typeof localStorage === "undefined" ? null : localStorage.getItem(KEY + ".synced");
}

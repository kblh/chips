import test from "node:test";
import assert from "node:assert/strict";
import { splitEvents } from "../lib/events.js";

const ev = (d) => ({ date: new Date(d) });

test("current = nejbližší nadcházející, past = minulé od nejnovějšího", () => {
  const past = ev("2026-06-10");
  const soon = ev("2026-06-24");
  const later = ev("2026-07-08");
  const today = new Date("2026-06-22");

  const result = splitEvents([past, later, soon], today);

  assert.equal(result.current, soon);
  assert.deepEqual(result.past, [past]);
});

test("event přesně dnes se počítá jako current", () => {
  const todayEvent = ev("2026-06-22");
  const today = new Date("2026-06-22T15:00:00");

  const result = splitEvents([todayEvent], today);

  assert.equal(result.current, todayEvent);
  assert.deepEqual(result.past, []);
});

test("žádný nadcházející → current je null, vše v past od nejnovějšího", () => {
  const a = ev("2026-06-01");
  const b = ev("2026-06-10");
  const today = new Date("2026-06-22");

  const result = splitEvents([a, b], today);

  assert.equal(result.current, null);
  assert.deepEqual(result.past, [b, a]);
});

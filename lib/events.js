export function splitEvents(events, today) {
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const upcoming = events
    .filter((e) => e.date >= startOfToday)
    .sort((a, b) => a.date - b.date);
  const past = events
    .filter((e) => e.date < startOfToday)
    .sort((a, b) => b.date - a.date);
  return { current: upcoming[0] || null, past };
}

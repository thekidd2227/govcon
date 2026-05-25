export function parseRecommendedTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`Invalid recommendedTime "${value}". Expected HH:MM.`);
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return asUtc - date.getTime();
}

export function calendarDateTimeToUtcIso(date: string, recommendedTime: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const { hour, minute } = parseRecommendedTime(recommendedTime);
  const localAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = timeZoneOffsetMs(localAsUtc, timeZone);
  return new Date(localAsUtc.getTime() - offset).toISOString();
}

// Sydney-zone helpers for the strategy-calls write UI.
// Vercel functions run in UTC, but our CGMs work in Australia/Sydney —
// they need to see and edit times in Sydney, while the DB stores UTC.

const SYDNEY_TZ = "Australia/Sydney";

function sydneyOffsetMs(at: Date): number {
  // How far Sydney is from UTC at the given instant (in ms).
  // Computed by formatting the same instant in Sydney and reading the
  // wall-clock fields back out.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SYDNEY_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  let hour = get("hour");
  if (hour === 24) hour = 0;
  const sydneyAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second"),
  );
  return sydneyAsUtc - at.getTime();
}

export function isoToSydneyDatetimeLocal(iso: string): string {
  // ISO UTC → "YYYY-MM-DDTHH:mm" Sydney wall-clock.
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: SYDNEY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date(iso)).replace(" ", "T");
}

export function parseSydneyDatetimeLocal(input: string): string {
  // "YYYY-MM-DDTHH:mm" Sydney → ISO UTC string.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    throw new Error("Datetime must be YYYY-MM-DDTHH:mm.");
  }
  // Treat the input as UTC, then subtract Sydney's UTC offset at that instant.
  const naive = new Date(input + ":00Z");
  const offset = sydneyOffsetMs(naive);
  return new Date(naive.getTime() - offset).toISOString();
}

export function nextWeekSydneyDatetimeLocal(): string {
  // Default for new-call form: 1 week from now at 14:00 Sydney.
  const now = new Date();
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Get Sydney's date for that instant, then re-anchor at 14:00 Sydney.
  const dateOnly = new Intl.DateTimeFormat("sv-SE", {
    timeZone: SYDNEY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(sevenDaysOut);
  return `${dateOnly}T14:00`;
}

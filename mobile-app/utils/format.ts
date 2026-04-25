export function formatDate(input?: string | Date | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(input?: string | Date | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })} · ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

export function formatRelative(input?: string | Date | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = minute * 60;
  const day = hour * 24;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return formatDate(date);
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function initialsOf(name?: string | null): string {
  if (!name) return "AQ";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AQ";
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return "Unknown caller";
  const clean = phone.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  const tail = clean.slice(-3);
  const head = clean.slice(0, Math.min(4, clean.length - 3));
  return `${head} ••• ${tail}`;
}

export function carLabel(car: { make?: string | null; model?: string | null; registrationNumber?: string | null; nickname?: string | null }): string {
  if (car.nickname) return car.nickname;
  const mm = [car.make, car.model].filter(Boolean).join(" ").trim();
  if (mm && car.registrationNumber) return `${mm} · ${car.registrationNumber}`;
  return mm || car.registrationNumber || "Vehicle";
}

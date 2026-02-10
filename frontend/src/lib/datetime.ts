export function formatIsoToYmdHm(iso?: string | null) {
  if (!iso) return "-";
  // "2026-02-04T19:14:00" or "2026-02-04T19:14"
  const s = String(iso);

  const ymd = s.slice(0, 10);
  const hm = s.slice(11, 16);

  if (ymd.length !== 10 || hm.length !== 5) return s; // fallback
  return `${ymd} ${hm}`;
}

export function formatIsoToYmd(iso?: string | null) {
  if (!iso) return "-";
  return String(iso).slice(0, 10);
}
export function stripSemesterSuffix(value: string | null | undefined): string {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.replace(/\s*학기$/u, "").trim();
}

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function toCssWidth(width?: number | string) {
  if (width === undefined) return undefined;
  return typeof width === "number" ? `${width}px` : width;
}

export function isEmptyValue(v: unknown) {
  return v === null || v === undefined || v === "";
}

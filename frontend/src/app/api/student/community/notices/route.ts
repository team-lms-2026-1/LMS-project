import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const TAG = "student:notices";

export async function GET(req: Request) {
  const res = await proxyToBackend(req, "/api/v1/student/community/notices", { 
    method: "GET",
    cache: "force-cache",
    next: {revalidate: 600, tags: [TAG]}
  });

  if (!res.ok) return res;

  const payload = await res.json().catch(() => null);
  if (!payload || !Array.isArray(payload.data)) {
    return NextResponse.json(payload, { status: res.status });
  }

  const isOngoing = (item: any) => {
    const now = new Date();
    const parseDate = (value: any, mode: "start" | "end") => {
      const v = String(value ?? "").trim();
      if (!v) return null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        const d = new Date(`${v}T${mode === "end" ? "23:59:59" : "00:00:00"}`);
        return Number.isNaN(d.getTime()) ? null : d;
      }

      const normalized = v.replace(" ", "T");
      const timeMatch = normalized.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        const h = Number(timeMatch[1]);
        const m = Number(timeMatch[2]);
        const s = Number(timeMatch[3] ?? "0");
        if (mode === "end" && h === 0 && m === 0 && s === 0) {
          const datePart = normalized.slice(0, 10);
          const d = new Date(`${datePart}T23:59:59`);
          return Number.isNaN(d.getTime()) ? null : d;
        }
      }

      const d = new Date(normalized);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const start = parseDate(item?.displayStartAt, "start");
    const end = parseDate(item?.displayEndAt, "end");
    if (start && now < start) return false;
    if (end && now > end) return false;

    if (!start && !end) {
      const status = String(item?.status ?? "").trim().toUpperCase();
      if (status) return status === "ONGOING";
    }
    return true;
  };

  const filtered = payload.data.filter(isOngoing);
  return NextResponse.json({ ...payload, data: filtered }, { status: res.status });
}

export async function POST(req: Request) {
  const body = await req.json();

  const res = await proxyToBackend(req, "/api/v1/student/community/notices", {
    method: "POST",
    forwardQuery: false,
    body,
    cache: "no-store"
  });

  if (res.ok) revalidateTag(TAG);

  return res;
}

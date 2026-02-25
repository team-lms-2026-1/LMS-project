import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveBaseUrl } from "@/lib/bff";
function buildHeaders() {
  let token = cookies().get("access_token")?.value;
  if (token) token = decodeURIComponent(token).replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "").trim();
  const h = new Headers();
  h.set("Content-Type", "application/json");
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { accountId: string } }) {
  const upstreamUrl = `${resolveBaseUrl()}/api/v1/admin/accounts/${ctx.params.accountId}/majors`;
  const res = await fetch(upstreamUrl, { headers: buildHeaders(), cache: "no-store" });
  const data = await res.text();
  return new Response(data, { status: res.status, headers: { "content-type": "application/json" } });
}

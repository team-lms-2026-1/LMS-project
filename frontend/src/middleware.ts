import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith("/admin") || p.startsWith("/professor") || p.startsWith("/student")) {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/professor/:path*", "/student/:path*"] };

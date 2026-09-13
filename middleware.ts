import { NextResponse, type NextRequest } from "next/server";
import {
  DASHBOARD_SESSION_COOKIE,
  isValidSessionCookie,
} from "@/app/lib/dashboardAuth";

export async function middleware(request: NextRequest) {
  const isLoginRoute = request.nextUrl.pathname === "/dashboard/login";

  if (!isLoginRoute) {
    const cookie = request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value;
    const valid = await isValidSessionCookie(cookie);

    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

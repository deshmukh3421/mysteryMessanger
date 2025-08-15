import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl;

  const publicPaths = ["/", "/sign-in", "/sign-up", "/verify"];
  const isPublicPath = publicPaths.some((path) => url.pathname.startsWith(path));

  if (token && (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/dashboard/:path*",
    "/verify/:path*",
  ],
};

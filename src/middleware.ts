import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenCookie = req.cookies.get("accessToken");
  const token = tokenCookie?.value;

  // Si intenta acceder al dashboard sin token, redirigir al login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Si está en la raíz y tiene token, redirigir al dashboard
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Si está en login y tiene token, redirigir al dashboard
  if (pathname === "/auth/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
export const config = {
    matcher: ["/", '/dashboard/:path*'],
}

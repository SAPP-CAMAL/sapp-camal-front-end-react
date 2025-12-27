import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ignorar archivos estáticos y rutas internas
  if (pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  // 2. Sin token en dashboard → redirigir al login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. Con token en login → redirigir al dashboard
  if (pathname.startsWith("/auth/login") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Sin token en raíz → redirigir al login
  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/login"],
};

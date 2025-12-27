import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ignorar COMPLETAMENTE archivos estáticos y rutas internas de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("accessToken")?.value;

  // 2. Proteger el dashboard: si no hay token, al login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. Si hay token y va al login o raíz, al dashboard
  if ((pathname === "/" || pathname.startsWith("/auth/login")) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 4. Si es la raíz y no hay token, al login
  if (pathname === "/" && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const response = NextResponse.next();

  // Limpiar cookies pesadas si existen para evitar 400 Bad Request en el servidor
  if (req.cookies.has("user")) {
    response.cookies.delete("user");
  }

  return response;
}

export const config = {
  // Solo aplicar a rutas de páginas reales
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};

import { NextResponse, NextRequest } from "next/server";

// Función básica para decodificar el payload de un JWT
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decodificar Base64URL de forma segura
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);

    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp < now : false;
  } catch (e) {
    return true; // Si hay error al decodificar, lo tratamos como expirado/inválido
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // EXCLUSIÓN CRÍTICA: Omitir archivos estáticos y recursos internos
  // Esto evita que el middleware intente procesar peticiones de CSS, JS, imágenes o favicons
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  const tokenCookie = req.cookies.get("accessToken");
  const token = tokenCookie?.value;

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // VALIDACIÓN: No existe token o está expirado
  const isTokenInvalid = !token || isTokenExpired(token);

  if (isDashboardPage) {
    if (isTokenInvalid) {
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      // Limpiar cookies si el token es inválido para evitar loops
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // Si está en la raíz y tiene token válido, al dashboard
  if (pathname === "/") {
    if (!isTokenInvalid) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Si está en login y tiene token válido, al dashboard
  if (isAuthPage && !isTokenInvalid) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // El matcher excluye rutas técnicas para que el middleware sea más eficiente
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};

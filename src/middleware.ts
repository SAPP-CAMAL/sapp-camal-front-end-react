import { NextResponse, NextRequest } from 'next/server'
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("accessToken")

    // 🔒 1. Proteger todas las rutas después de /dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    // 🔒 2. Si hay sesión y entra a "/", redirigir a /dashboard
    if (pathname === "/") {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard/people", req.url));
        }
    }

    return NextResponse.next();
}
export const config = {
    matcher: ["/", '/dashboard/:path*'],
}
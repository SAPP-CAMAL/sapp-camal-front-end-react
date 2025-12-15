import { NextResponse, NextRequest } from 'next/server'
import { ssrGetJson } from './lib/ky-ssr';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("accessToken")

    const resp = await ssrGetJson<any>("v1/1.0.0/administration/menu").catch(() => ({ data: [] }));

    const allowsPaths = resp
        .data
        .flatMap((menu: any) => menu?.children ?? [])
        .map((item: any) => {
            const url = item?.url ?? '';
            // Asegurar que la URL comience con /
            return url.startsWith('/') ? url : `/${url}`;
        })

    // Debug: ver rutas permitidas
    console.log('Pathname:', pathname);
    console.log('Allowed paths:', allowsPaths);
    console.log('Is allowed:', allowsPaths.includes(pathname));

    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }
    }

    if (pathname === "/") {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    if (token) {
        if (!allowsPaths.includes(pathname) && pathname !== "/dashboard") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}
export const config = {
    matcher: ["/", '/dashboard/:path*'],
}

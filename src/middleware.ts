import { NextResponse, NextRequest } from 'next/server'
import { httpSSR } from './lib/ky-ssr';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("accessToken")

    const resp = await httpSSR
        .get("v1/1.0.0/administration/menu")
        .json<any>()
        .catch(() => ({ data: [] }));

    const allowsPaths = resp
        .data
        .flatMap((menu: any) => menu?.children ?? [])
        .map((item: any) => item?.url ?? [])

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

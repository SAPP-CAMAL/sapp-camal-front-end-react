"use server";

import { ssrPostJson } from "@/lib/ky-ssr";
import { ResponseLoginService, ResponseLogoutService, ResponseRefreshTokenService } from "../../domain";

export async function loginAction(body: { identifier: string; password: string }) {
    return await ssrPostJson<ResponseLoginService>("v1/1.0.0/security/login", {
        json: {
            identifier: body.identifier,
            password: body.password,
        },
    })
}

export async function logoutAction() {
    return await ssrPostJson<ResponseLogoutService>("v1/1.0.0/security/logout")
}

export async function refreshTokenAction(refreshToken: string) {
    return await ssrPostJson<ResponseRefreshTokenService>("v1/1.0.0/security/refresh-token", {
        json: {
            refreshToken,
        },
    })
}
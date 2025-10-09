import { http } from "@/lib/ky";
import { ResponseLoginService, ResponseLogoutService, ResponseRefreshTokenService } from "../../domain";

export function loginAction(body: { identifier: string, password: string }) {
    return http
        .post("v1/1.0.0/security/login", {
            json: {
                identifier: body.identifier,
                password: body.password
            },
        })
        .json<ResponseLoginService>()
}

export function logoutAction() {
    return http
        .post("v1/1.0.0/security/logout")
        .json<ResponseLogoutService>()
}

export function refreshTokenAction(refreshToken: string) {
    return http
        .post("v1/1.0.0/security/refresh-token", {
            json: {
                refreshToken
            }
        })
        .json<ResponseRefreshTokenService>()
}
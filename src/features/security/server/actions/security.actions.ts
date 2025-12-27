"use server";

import { cookies } from "next/headers";
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
    try {
        // Intentar notificar al servidor que se está cerrando sesión
        await ssrPostJson<ResponseLogoutService>("v1/1.0.0/security/logout")
    } catch (error) {
        // Continuar incluso si falla el logout en el servidor
        console.warn("Server logout failed, but clearing local cookies anyway");
    }
    
    // Borrar las cookies locales
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("user");
    
    return {
        code: 200,
        message: "Logout successful",
        data: null
    };
}

export async function refreshTokenAction(refreshToken: string) {
    return await ssrPostJson<ResponseRefreshTokenService>("v1/1.0.0/security/refresh-token", {
        json: {
            refreshToken,
        },
    })
}
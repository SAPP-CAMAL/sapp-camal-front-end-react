"use server";

import { cookies } from "next/headers";
import { ssrPostJson } from "@/lib/ky-ssr";
import { ResponseLoginService, ResponseLogoutService, ResponseRefreshTokenService } from "../../domain";

export async function loginAction(body: { identifier: string; password: string }) {
    const response = await ssrPostJson<ResponseLoginService>("v1/1.0.0/security/login", {
        json: {
            identifier: body.identifier?.trim(),
            password: body.password?.trim(),
        },
    });

    // Guardar las cookies en el servidor para que el middleware pueda acceder a ellas
    if (response?.data?.accessToken) {
        const cookieStore = await cookies();
        
        // Configurar las cookies con opciones adecuadas
        const isProduction = process.env.NODE_ENV === 'production';
        
        cookieStore.set("accessToken", response.data.accessToken, {
            httpOnly: false, // Permitir acceso desde el cliente también
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 días
        });
        
        cookieStore.set("refreshToken", response.data.refreshToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 días
        });
        
        const userJson = JSON.stringify(response.data);
        cookieStore.set("user", userJson, {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 días
        });
    }

    return response;
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
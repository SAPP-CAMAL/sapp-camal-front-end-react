"use server";

import { HTTPError } from "ky";
import { cookies } from "next/headers";
import { ssrGetJson, ssrPostJson } from "@/lib/ky-ssr";
import { CommonHttpResponseSingle } from "@/features/people/domain";
import { ResponseLoginService, ResponseLogoutService, ResponseRefreshTokenService, UserSetRoleResponse } from "../../domain";

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken", "user"] as const;

// Versiones previas del cambio de rol usaban window.cookieStore.set desde el navegador sin fijar
// "path", lo que en algunos navegadores crea una cookie duplicada atada a la ruta actual (ej.
// "/dashboard") en vez de "/". Esa cookie duplicada puede seguir enviándose junto a la correcta y
// "ganarle" por ser más específica, dejando al usuario con el token de un rol viejo aunque vuelva a
// loguearse. Se limpia explícitamente en las rutas conocidas antes de fijar las cookies nuevas.
async function clearStaleAuthCookies() {
    const cookieStore = await cookies();
    const stalePaths = ["/", "/dashboard"];
    for (const name of AUTH_COOKIE_NAMES) {
        for (const path of stalePaths) {
            cookieStore.delete({ name, path });
        }
    }
}

export type LoginActionResult = ResponseLoginService | { code: number; message: string; data: null };

export async function loginAction(body: { identifier: string; password: string }): Promise<LoginActionResult> {
    try {
        const response = await ssrPostJson<ResponseLoginService>("v1/1.0.0/security/login", {
            json: {
                identifier: body.identifier?.trim(),
                password: body.password?.trim(),
            },
        });

        // Guardar las cookies en el servidor para que el middleware pueda acceder a ellas
        if (response?.data?.accessToken) {
            await clearStaleAuthCookies();

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
    } catch (error) {
        // Nunca dejar que un error de credenciales (400/401/etc) se propague como
        // excepción no controlada: Next.js lo convierte en un 500 opaco sin mensaje
        // en el cliente. Se captura acá, donde sí tenemos el body real del backend,
        // y se devuelve como un objeto normal para que el formulario lo muestre.
        if (error instanceof HTTPError) {
            let message = "Credenciales incorrectas";
            try {
                const errorBody = await error.response.json();
                message = errorBody?.message ?? errorBody?.data ?? message;
            } catch {
                // El body no era JSON válido; se mantiene el mensaje por defecto.
            }
            return { code: error.response.status, message, data: null };
        }

        return {
            code: 500,
            message: "No se pudo conectar con el servidor. Intente nuevamente.",
            data: null,
        };
    }
}

export async function logoutAction() {
    try {
        // Intentar notificar al servidor que se está cerrando sesión
        await ssrPostJson<ResponseLogoutService>("v1/1.0.0/security/logout")
    } catch (error) {
        // Continuar incluso si falla el logout en el servidor
        console.warn("Server logout failed, but clearing local cookies anyway");
    }

    // Borrar las cookies locales (en todas las rutas conocidas, ver clearStaleAuthCookies)
    await clearStaleAuthCookies();

    return {
        code: 200,
        message: "Logout successful",
        data: null
    };
}

export async function setUserRoleAction(roleId: number) {
    const response = await ssrGetJson<CommonHttpResponseSingle<UserSetRoleResponse>>(
        `v1/1.0.0/users/set-role/${roleId}`,
    );

    // Guardar las cookies en el servidor para que el middleware y el SSR de menús las vean de inmediato.
    if (response?.data?.accessToken) {
        await clearStaleAuthCookies();

        const cookieStore = await cookies();
        const isProduction = process.env.NODE_ENV === 'production';

        cookieStore.set("accessToken", response.data.accessToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        cookieStore.set("refreshToken", response.data.refreshToken, {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        cookieStore.set("user", JSON.stringify(response.data), {
            httpOnly: false,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    return response;
}

export async function refreshTokenAction(refreshToken: string) {
    return await ssrPostJson<ResponseRefreshTokenService>("v1/1.0.0/security/refresh-token", {
        json: {
            refreshToken,
        },
    })
}
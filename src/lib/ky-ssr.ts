"use server"
import ky from "ky";
import { cookies } from "next/headers";

function normalizeApiBase(raw: string | undefined) {
    const base = (raw ?? "").trim()
    const withoutTrailingSlash = base.endsWith("/") ? base.slice(0, -1) : base
    return withoutTrailingSlash
}

function getSsrApiBases() {
    const configured = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL)

    if (!configured) {
        // FALLBACK: Si la variable de entorno no está configurada en el servidor,
        // usar la URL de producción por defecto
        console.warn("[SSR API] NEXT_PUBLIC_API_URL no está configurado. Usando URL de producción como fallback.");
        return ["https://sapp-riobamba.com"]
    }

    // En servidor, usar SOLO la URL configurada
    return [configured]
}

function isNetworkFailure(error: unknown): boolean {
    // En Node/undici típicamente llega como TypeError: fetch failed
    if (error instanceof TypeError) return true
    const message = (error as any)?.message
    return typeof message === "string" && message.toLowerCase().includes("fetch failed")
}

async function getAuthHeader(): Promise<string | undefined> {
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")
    return token?.value ? `Bearer ${token.value}` : undefined
}

async function requestWithFallback<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    options?: any,
): Promise<T> {
    const bases = getSsrApiBases()
    const auth = await getAuthHeader()

    let lastError: unknown
    for (let i = 0; i < bases.length; i++) {
        const base = bases[i]
        const client = ky.create({
            prefixUrl: base,
            credentials: "include",
            retry: 0,
            timeout: 20000,
            hooks: {
                beforeRequest: [
                    request => {
                        if (auth) request.headers.set("Authorization", auth)
                    }
                ]
            }
        })

        try {
            const response = await (client as any)[method](url, options)
            return await response.json() as T
        } catch (error) {
            lastError = error
            // Si es un fallo de red y aún quedan bases por intentar, reintentar.
            if (isNetworkFailure(error) && i < bases.length - 1) continue
            throw error
        }
    }

    throw lastError
}

export async function ssrGetJson<T = unknown>(url: string, options?: any): Promise<T> {
    return requestWithFallback<T>("get", url, options)
}

export async function ssrPostJson<T = unknown>(url: string, options?: any): Promise<T> {
    return requestWithFallback<T>("post", url, options)
}

export async function ssrPutJson<T = unknown>(url: string, options?: any): Promise<T> {
    return requestWithFallback<T>("put", url, options)
}

export async function ssrPatchJson<T = unknown>(url: string, options?: any): Promise<T> {
    return requestWithFallback<T>("patch", url, options)
}

export async function ssrDeleteJson<T = unknown>(url: string, options?: any): Promise<T> {
    return requestWithFallback<T>("delete", url, options)
}

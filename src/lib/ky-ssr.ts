"use server"
import ky from "ky";
import { cookies } from "next/headers";

export const httpSSR = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
    credentials: "include",
    retry: 0,
    hooks: {
        beforeRequest: [
            async request => {
                const cookieStore = await cookies()

                const token = cookieStore.get("accessToken")

                if (token) {
                    request.headers.set("Authorization", `Bearer ${token.value}`)
                }
            }
        })

        try {
            return await (client as any)[method](url, options).json<T>()
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

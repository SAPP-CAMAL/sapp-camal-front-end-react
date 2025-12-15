
import ky from 'ky'

function normalizeApiBase(raw: string | undefined) {
    const base = (raw ?? "").trim()
    const withoutTrailingSlash = base.endsWith("/") ? base.slice(0, -1) : base
    return withoutTrailingSlash
}

function readCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined
    const cookies = document.cookie ? document.cookie.split(";") : []
    for (const part of cookies) {
        const [rawKey, ...rest] = part.trim().split("=")
        if (rawKey === name) return decodeURIComponent(rest.join("="))
    }
    return undefined
}

async function getAccessToken(): Promise<string | undefined> {
    try {
        const w = (typeof window !== "undefined") ? (window as any) : undefined
        const cookieStore = w?.cookieStore
        if (cookieStore?.get) {
            const cookie = await cookieStore.get("accessToken")
            return cookie?.value
        }
    } catch {
        // ignore
    }
    const fromCookie = readCookie("accessToken")
    if (fromCookie) return fromCookie
    try {
        if (typeof window !== "undefined") {
            return window.localStorage.getItem("accessToken") ?? undefined
        }
    } catch {
        // ignore
    }
    return undefined
}

const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL) || "http://localhost:3001";

export const http = ky.create({
    prefixUrl: API_BASE,
    credentials: "include",
    retry: 0,
    timeout: 20000,
    hooks: {
        beforeRequest: [
            async request => {
                // Add cache control headers for better performance
                // request.headers.set("Cache-Control", "no-cache");

                const token = await getAccessToken()
                if (!token) return

                // In ky, `request` is a Fetch API Request (headers are mutable via `.set`,
                // but the `headers` property itself is read-only).
                try {
                    request.headers.set("Authorization", `Bearer ${token}`)
                } catch {
                    // If some environment provides an unexpected immutable headers object,
                    // skip setting the header rather than crashing the app.
                }
            }
        ],
        afterResponse: [
            async (request, options, response) => {
                if (!response.ok) {
                    const method = (options as any)?.method ?? "GET"
                    const url = (() => {
                        try {
                            return request.url
                        } catch {
                            return "<unknown>"
                        }
                    })()

                    const debug: Record<string, unknown> = {
                        method,
                        url,
                        status: response.status,
                        statusText: response.statusText,
                    }

                    try {
                        debug["contentType"] = response.headers.get("content-type")
                    } catch {
                        // ignore
                    }

                    try {
                        debug["body"] = await response.clone().text()
                    } catch {
                        // ignore
                    }

                    // eslint-disable-next-line no-console
                    console.error("[HTTP] Request failed", debug)
                }

                if (response.status === 401) {
                    window.location.href = "/auth/login"
                }
                return response
            }
        ]
    }
})


import ky, { type KyInstance } from 'ky'

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

function isNetworkFailure(error: unknown): boolean {
    if (error instanceof TypeError) return true
    const message = (error as any)?.message
    return typeof message === "string" && (
        message.toLowerCase().includes("fetch failed") ||
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("failed to fetch")
    )
}

function getClientApiBases(): string[] {
    // IMPORTANTE: Next.js reemplaza process.env.NEXT_PUBLIC_* en tiempo de build
    // tanto para el servidor como para el cliente. Esto es más confiable que
    // usar variables globales en window.

    // Prioridad 1: Usar la variable de entorno en tiempo de build (más confiable)
    // Next.js inlinea este valor durante el build, así que estará disponible inmediatamente
    const buildTimeUrl = process.env.NEXT_PUBLIC_API_URL

    // Prioridad 2: Fallback a la variable global (por si acaso)
    const windowUrl = typeof window !== 'undefined'
        ? (window as any).__NEXT_PUBLIC_API_URL__
        : undefined

    // Prioridad 3: En producción, detectar automáticamente la URL basándose en el hostname
    // Si estamos en un dominio de producción (no localhost), usar https://sapp-riobamba.com
    let autoDetectedUrl: string | undefined = undefined
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        // Si NO estamos en localhost, usar la URL de producción
        if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
            autoDetectedUrl = 'https://sapp-riobamba.com'
        }
    }

    const apiUrl = buildTimeUrl || windowUrl || autoDetectedUrl
    const configured = normalizeApiBase(apiUrl)

    if (!configured) {
        console.warn("[API] API_URL no está configurada. Usando localhost como fallback.");
        return ["http://localhost:3000"]
    }

    return [configured]
}

// IMPORTANTE: No evaluamos API_BASES al cargar el módulo porque la variable global
// puede no estar disponible aún. En su lugar, se obtiene dinámicamente en cada petición.

function createKyClient(prefixUrl: string): KyInstance {
    return ky.create({
        prefixUrl,
        credentials: "include",
        retry: 0,
        timeout: 20000,
        hooks: {
            beforeRequest: [
                async request => {
                    const token = await getAccessToken()
                    if (!token) return

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

                        let bodyText = ""
                        try {
                            bodyText = await response.clone().text()
                        } catch {
                            // ignore
                        }

                        // No loguear errores esperados
                        const isExpectedEmptyResponse = response.status === 400
                        const isSlaughterhouseInfoNotFound = url.includes("environment-variables/find-camal-info") && response.status === 404

                        if (!isExpectedEmptyResponse && !isSlaughterhouseInfoNotFound) {
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

                            debug["body"] = bodyText

                            // eslint-disable-next-line no-console
                            console.error("[HTTP] Request failed", debug)
                        }
                    }

                    if (response.status === 401) {
                        window.location.href = "/auth/login"
                    }
                    return response
                }
            ]
        }
    })
}

// Cliente principal con fallback automático
async function requestWithFallback<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    options?: any,
): Promise<T> {
    const apiBases = getClientApiBases()
    let lastError: unknown

    for (let i = 0; i < apiBases.length; i++) {
        const base = apiBases[i]
        const client = createKyClient(base)

        try {
            const response = await (client as any)[method](url, options)
            return await response.json() as T
        } catch (error) {
            lastError = error
            // Si es un fallo de red y aún quedan bases por intentar, reintentar con el siguiente
            if (isNetworkFailure(error) && i < apiBases.length - 1) {
                console.warn(`[HTTP] Fallo de conexión con ${base}, intentando fallback...`)
                continue
            }
            throw error
        }
    }

    throw lastError
}

// Exportar funciones con fallback para uso directo
export const httpWithFallback = {
    get: <T = unknown>(url: string, options?: any) => requestWithFallback<T>("get", url, options),
    post: <T = unknown>(url: string, options?: any) => requestWithFallback<T>("post", url, options),
    put: <T = unknown>(url: string, options?: any) => requestWithFallback<T>("put", url, options),
    patch: <T = unknown>(url: string, options?: any) => requestWithFallback<T>("patch", url, options),
    delete: <T = unknown>(url: string, options?: any) => requestWithFallback<T>("delete", url, options),
}

// Función helper para crear el cliente HTTP dinámicamente
function getHttpClient(): KyInstance {
    const bases = getClientApiBases()
    return createKyClient(bases[0])
}

// Cliente ky tradicional - NOTA: Este cliente se crea dinámicamente para evitar
// problemas de race condition con la variable global
export const http = {
    get: (url: string, options?: any) => getHttpClient().get(url, options),
    post: (url: string, options?: any) => getHttpClient().post(url, options),
    put: (url: string, options?: any) => getHttpClient().put(url, options),
    patch: (url: string, options?: any) => getHttpClient().patch(url, options),
    delete: (url: string, options?: any) => getHttpClient().delete(url, options),
}


// Función para obtener las URLs base de la API (útil para fetch directo con fallback)
export function getApiBases(): string[] {
    const bases = getClientApiBases()
    return bases.map((base: string) => {
        // Si es el proxy de desarrollo, devolver la URL real para fetch directo
        if (base === '/api/proxy') {
            return normalizeApiBase(process.env.NEXT_PUBLIC_API_URL) || "http://localhost:3000"
        }
        return base
    })
}

// Fetch con fallback automático (para descargas de archivos, etc.)
export async function fetchWithFallback(
    path: string,
    options?: RequestInit
): Promise<Response> {
    const bases = getApiBases()
    let lastError: unknown

    for (let i = 0; i < bases.length; i++) {
        const base = bases[i]
        const url = `${base}${path.startsWith('/') ? path : '/' + path}`

        try {
            const response = await fetch(url, options)
            // Si la respuesta es exitosa o es un error del servidor (no de red), retornar
            return response
        } catch (error) {
            lastError = error
            // Si es un fallo de red y aún quedan bases por intentar, reintentar
            if (isNetworkFailure(error) && i < bases.length - 1) {
                console.warn(`[HTTP] Fallo de conexión con ${base}, intentando fallback...`)
                continue
            }
            throw error
        }
    }

    throw lastError
}

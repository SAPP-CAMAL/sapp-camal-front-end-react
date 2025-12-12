
import ky from 'ky'

export const http = ky.create({
    prefixUrl: "http://localhost:3001",
    credentials: "include",
    retry: 0,
    // timeout: 15000, // 15 second timeout
    hooks: {
        beforeRequest: [
            async request => {
                // Add cache control headers for better performance
                // request.headers.set("Cache-Control", "no-cache");

                const token = await window.cookieStore.get("accessToken")

                if (token) {
                    request.headers.set("Authorization", `Bearer ${token.value}`)
                }
            }
        ],
        afterResponse: [
            (request, options, response) => {
                if (response.status === 401) {
                    window.location.href = "/auth/login"
                }
                return response
            }
        ]
    }
})

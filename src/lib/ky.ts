
import ky from 'ky'

export const http = ky.create({
    prefixUrl: "http://localhost:3001/sappriobamba",
    credentials: "include",
    retry: 0,
    hooks: {
        beforeRequest: [
            async request => {
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
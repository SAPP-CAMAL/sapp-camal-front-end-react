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
        ],
    }
})

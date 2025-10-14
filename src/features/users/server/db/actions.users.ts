import { http } from "@/lib/ky";
import { CreateUserInput } from "../../domain";

export function createUserAction(body: CreateUserInput) {
    return http.post("v1/1.0.0/users/register", {
        json: body
    }).json()
}
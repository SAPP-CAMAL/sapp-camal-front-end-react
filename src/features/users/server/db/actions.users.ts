import { http } from "@/lib/ky";
import { CreateUserInput, UpdateUserInput } from "../../domain";

export function createUserAction(body: CreateUserInput) {
    return http.post("v1/1.0.0/users/register", {
        json: body
    }).json()
}


export function updateUserAction(userId: number, body: Partial<UpdateUserInput>) {
    return http.patch(`v1/1.0.0/users/${userId}`,
        { json: body }
    ).json()
}
import { http } from "@/lib/ky";
import { CreateUserInput, UpdateUserInput } from "../../domain";
import { CommonHttpResponseSingle } from "@/features/people/domain";
import type { GetUsersForUpdate } from "../../domain/get-users-for-update";

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


export function usersForUpdate(id: number): Promise<CommonHttpResponseSingle<GetUsersForUpdate>> {
    return http.get("v1/1.0.0/users/for-update", {
        searchParams: { id }
    }).json()
}

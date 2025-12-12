import { http } from "@/lib/ky";
import { GetUserByFilterQuery, ResponseGetUserByFilter } from "../../domain";

export function getUsersByFilter(query: GetUserByFilterQuery): Promise<ResponseGetUserByFilter> {
    return http.post("v1/1.0.0/users/by-filter", {
        json: query
    }).json<ResponseGetUserByFilter>();
}
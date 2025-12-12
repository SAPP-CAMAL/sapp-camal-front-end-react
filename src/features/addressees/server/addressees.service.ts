import { http } from "@/lib/ky"
import { ADDRESSEES_LIST_BY_FILTER_TAG } from "../constants"
import { Addressees, CreateAdresseesRequest, FiltersAddressees, ResponseAddresseesByFilter, UpdateAdresseesRequest } from "../domain"

export function getAdresseesByFilterService(filters: FiltersAddressees = {}): Promise<ResponseAddresseesByFilter> {
    return http.post("v1/1.0.0/addressees/search", {
        next: {
            tags: [ADDRESSEES_LIST_BY_FILTER_TAG],
        },
        json: filters
    }).json<ResponseAddresseesByFilter>()
}

export function createAdresseesService(body: Omit<CreateAdresseesRequest, "id" | "status">): Promise<Addressees> {
    return http.post("v1/1.0.0/addressees", {
        json: body
    }).json<Addressees>()
}

export function updateAdresseesService(id: number,body:UpdateAdresseesRequest): Promise<Addressees> {
  return http.patch(`v1/1.0.0/addressees/${id}`,
        { json: body }
    ).json()
}
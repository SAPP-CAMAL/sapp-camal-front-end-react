import { http } from "@/lib/ky"
import { ADDRESSEES_LIST_BY_FILTER_TAG } from "../constants"
import { Addressees, CreateAdresseesRequest, FiltersAddressees, ResponseAddresseesByFilter, UpdateAdresseesRequest } from "../domain"
import { CommonHttpResponse } from "@/features/people/domain"

export function getAdresseesByFilterService(filters: FiltersAddressees = {}): Promise<ResponseAddresseesByFilter> {
    return http.post("v1/1.0.0/addressees/search", {
        next: {
            tags: [ADDRESSEES_LIST_BY_FILTER_TAG],
        },
        json: filters
    }).json<ResponseAddresseesByFilter>()
}

export function getAddresseesByFiltersWeighingService(filters: { names?: string; brand?: string; brandId?: number }): Promise<CommonHttpResponse<Addressees>> {
    const searchParams = new URLSearchParams();
    if (filters.names) searchParams.append("names", filters.names);
    if (filters.brand) searchParams.append("brand", filters.brand);
    if (filters.brandId) searchParams.append("brandId", filters.brandId.toString());

    return http.get("v1/1.0.0/addressees/by-filters", {
        searchParams
    }).json<CommonHttpResponse<Addressees>>()
}

export function createAdresseesService(body: Omit<CreateAdresseesRequest, "id" | "status">): Promise<Addressees> {
    return http.post("v1/1.0.0/addressees", {
        json: body
    }).json<Addressees>()
}

export function updateAdresseesService(id: number, body: UpdateAdresseesRequest): Promise<Addressees> {
    return http.patch(`v1/1.0.0/addressees/${id}`,
        { json: body }
    ).json()
}

export function assignBrandToAddresseeService(addresseeId: number, brandId: number | null): Promise<Addressees> {
    const params = new URLSearchParams({
        addresseeId: String(addresseeId),
        ...(brandId !== null && { brandId: String(brandId) })
    });

    return http.patch(`v1/1.0.0/addressees/update-brand?${params.toString()}`).json();
}
import { http } from "@/lib/ky";
import {
    CreateCantonBody,
    CreateParishBody,
    CreateProvinceBody,
    ResponseCantonsAdmin,
    ResponseParishesAdmin,
    ResponseProvincesAdmin,
    SearchParamsCanton,
    SearchParamsLocation,
    SearchParamsParish,
} from "@/features/provinces/domain/locations-admin.domain";

export function getProvincesAdminService(searchParams: SearchParamsLocation): Promise<ResponseProvincesAdmin> {
    return http.get("v1/1.0.0/provinces/admin", { searchParams }).json();
}

export function createProvinceService(body: CreateProvinceBody) {
    return http.post("v1/1.0.0/provinces", { json: body }).json();
}

export function updateProvinceService(id: number, body: Partial<CreateProvinceBody>) {
    return http.patch(`v1/1.0.0/provinces/${id}`, { json: body }).json();
}

export function deleteProvinceService(id: number) {
    return http.delete(`v1/1.0.0/provinces/${id}`).json();
}

export function deleteProvincePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/provinces/${id}/permanent`).json();
}

export function getCantonsAdminService(searchParams: SearchParamsCanton): Promise<ResponseCantonsAdmin> {
    return http.get("v1/1.0.0/cantons/admin", { searchParams }).json();
}

export function createCantonService(body: CreateCantonBody) {
    return http.post("v1/1.0.0/cantons", { json: body }).json();
}

export function updateCantonService(id: number, body: Partial<CreateCantonBody>) {
    return http.patch(`v1/1.0.0/cantons/${id}`, { json: body }).json();
}

export function deleteCantonService(id: number) {
    return http.delete(`v1/1.0.0/cantons/${id}`).json();
}

export function deleteCantonPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/cantons/${id}/permanent`).json();
}

export function getParishesAdminService(searchParams: SearchParamsParish): Promise<ResponseParishesAdmin> {
    return http.get("v1/1.0.0/parishes/admin", { searchParams }).json();
}

export function createParishService(body: CreateParishBody) {
    return http.post("v1/1.0.0/parishes", { json: body }).json();
}

export function updateParishService(id: number, body: Partial<CreateParishBody>) {
    return http.patch(`v1/1.0.0/parishes/${id}`, { json: body }).json();
}

export function deleteParishService(id: number) {
    return http.delete(`v1/1.0.0/parishes/${id}`).json();
}

export function deleteParishPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/parishes/${id}/permanent`).json();
}

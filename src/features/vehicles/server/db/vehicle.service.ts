import { http } from "@/lib/ky";
import { VEHICLE_LIST_BY_FILTER_TAG } from "@/features/vehicles/constants";
import { CreateVehicleRequest, FiltersVehicle, ResponseCreateVehicle, ResponseVehicleByFilter } from "@/features/vehicles/domain/vehicle-detail-service";

export function getVehicleByFilterService(filters: FiltersVehicle = {}): Promise<ResponseVehicleByFilter> {
    return http.post("v1/1.0.0/vehicle/vehicle-by-filter", {
        next: {
            tags: [VEHICLE_LIST_BY_FILTER_TAG],
        },
        json: filters
    }).json<ResponseVehicleByFilter>()
}

export function createVehicleService(body: Omit<CreateVehicleRequest, "id" | "status">): Promise<ResponseCreateVehicle> {
    return http.post("v1/1.0.0/vehicle", {
        json: body
    }).json<ResponseCreateVehicle>()
}

export function getVehicleByIdService(id: number): Promise<ResponseCreateVehicle> {
    return http.get("v1/1.0.0/vehicle", {
        searchParams: {
            id
        }
    }).json<ResponseCreateVehicle>()
}

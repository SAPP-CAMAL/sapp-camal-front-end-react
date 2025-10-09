import { http } from "@/lib/ky";
import { ResponseVehicleDetailByTransport } from "../../domain/vehicle-detail-service";

export function getDetailVehicleByTransportIdService(transportId: number): Promise<ResponseVehicleDetailByTransport> {
    return http.get("v1/1.0.0/vehicle-detail/by-transport-id", {
        searchParams: {
            transportId
        }
    }).json<ResponseVehicleDetailByTransport>()
}

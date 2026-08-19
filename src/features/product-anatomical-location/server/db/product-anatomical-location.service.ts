import { http } from "@/lib/ky";
import { CreateProductAnatomicalLocationBody, ResponseProductAnatomicalLocationService } from "@/features/product-anatomical-location/domain/product-anatomical-location.domain";

export function createProductAnatomicalLocationService(body: CreateProductAnatomicalLocationBody) {
    return http.post("v1/1.0.0/product-anatomical-location", { json: body }).json()
}

export function getProductAnatomicalLocationsService(): Promise<ResponseProductAnatomicalLocationService> {
    return http.get("v1/1.0.0/product-anatomical-location/all").json()
}

export function updateProductAnatomicalLocationService(id: number, body: Partial<CreateProductAnatomicalLocationBody>) {
    return http.patch(`v1/1.0.0/product-anatomical-location/${id}`, { json: body }).json()
}

export function deleteProductAnatomicalLocationService(id: number) {
    return http.delete(`v1/1.0.0/product-anatomical-location/${id}`).json()
}

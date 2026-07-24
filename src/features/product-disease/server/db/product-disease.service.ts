import { http } from "@/lib/ky";
import { CreateProductDiseaseBody, ResponseProductDiseaseService } from "@/features/product-disease/domain/product-disease.domain";

export function createProductDiseaseService(body: CreateProductDiseaseBody) {
    return http.post("v1/1.0.0/product-disease", { json: body }).json()
}

export function getProductDiseasesService(): Promise<ResponseProductDiseaseService> {
    return http.get("v1/1.0.0/product-disease/all").json()
}

export function updateProductDiseaseService(id: number, body: Partial<CreateProductDiseaseBody>) {
    return http.patch(`v1/1.0.0/product-disease/${id}`, { json: body }).json()
}

export function deleteProductDiseaseService(id: number) {
    return http.delete(`v1/1.0.0/product-disease/${id}`).json()
}

import { http } from "@/lib/ky";
import {
    CreateEquipmentBody,
    CreateEquipmentTypeBody,
    ResponseEquipmentsService,
    ResponseEquipmentTypesService,
} from "@/features/equipment/domain/equipment.domain";

export function createEquipmentTypeService(body: CreateEquipmentTypeBody) {
    return http.post("v1/1.0.0/equipment-type", { json: body }).json()
}

export function getEquipmentTypesService(): Promise<ResponseEquipmentTypesService> {
    return http.get("v1/1.0.0/equipment-type/all").json()
}

export function updateEquipmentTypeService(id: number, body: Partial<CreateEquipmentTypeBody>) {
    return http.patch(`v1/1.0.0/equipment-type/${id}`, { json: body }).json()
}

export function deleteEquipmentTypeService(id: number) {
    return http.delete(`v1/1.0.0/equipment-type/${id}`).json()
}

export function deleteEquipmentTypePermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/equipment-type/${id}/permanent`).json()
}

export function createEquipmentService(body: CreateEquipmentBody) {
    return http.post("v1/1.0.0/equipment", { json: body }).json()
}

export function getEquipmentsService(): Promise<ResponseEquipmentsService> {
    return http.get("v1/1.0.0/equipment/all").json()
}

export function updateEquipmentService(id: number, body: Partial<CreateEquipmentBody>) {
    return http.patch(`v1/1.0.0/equipment/${id}`, { json: body }).json()
}

export function deleteEquipmentService(id: number) {
    return http.delete(`v1/1.0.0/equipment/${id}`).json()
}

export function deleteEquipmentPermanentlyService(id: number) {
    return http.delete(`v1/1.0.0/equipment/${id}/permanent`).json()
}

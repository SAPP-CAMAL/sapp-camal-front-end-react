import { CommonHttpResponsePagination } from "@/features/people/domain";

export type FiltersVehicle = {
    page?:            number;
    limit?:           number;
    plate?:           string;
    brand?:           string;
    transportTypeId?: number;
    vehicleTypeId?:   number;
    status?:          boolean;
}

export type ResponseVehicleByFilter = CommonHttpResponsePagination<Vehicle>

export interface Vehicle {
    id:              number;
    plate:           string;
    model:           string;
    color:           string;
    brand:           string;
    description:     string;
    categoryId:      null;
    manufactureYear: number;
    status:          boolean;
    vehicleDetailId: number;
    vehicleDetail:   VehicleDetail;
}

export interface VehicleDetail {
    id:              number;
    transportTypeId: number;
    vehicleTypeId:   number;
    status:          boolean;
    transportType:   Type;
    vehicleType:     Type;
}

export interface Type {
    id:              number;
    code:            string;
    name:            string;
    description:     string;
    catalogueTypeId: number;
    status:          boolean;
    parentId:        null;
}

export type ResponseCreateVehicle = {
    code: number
    message: string
    data: Vehicle
}

export type ResponseVehicleDetailByTransport = {
    code: number;
    message: string;
    data: TransportType[];
}


/**
 * This data comes from administration.vehicle-detail table, so
 * the data mapped looks like:
 *    id: vehicleDetail.id,
 *    vehicleTypeId: vehicleDetail.vehicleType?.id ?? null,
 *    name: vehicleDetail.vehicleType?.name ?? null,
 *    code: vehicleDetail.vehicleType?.code ?? null,
 *    description: vehicleDetail.vehicleType?.description ?? null,
 */
export interface TransportType {
	/** @property id - Unique identifier for the transport type. */
	id: number;
	/** @property vehicleTypeId - Identifier referencing the associated vehicle type. */
	vehicleTypeId: number;
	/** @property name - Name of the transport type. */
	name: string;
	/** @property code - Code representing the transport type. */
    code:          string;
    /** @property description - Description of the transport type. */
	description: string;
}

export interface CreateVehicleRequest {
    vehicleDetailId?: number;
    plate:           string;
    brand:           string;
    description?:     string;
    model:           string;
    color:           string;
    status:          boolean;
    manufactureYear: number;
}

export interface CreateVehicleCatalogueRequest {
    vehicleTypeId:   number;
    transportTypeId: number;
    plate:           string;
    brand:           string;
    description?:     string;
    model:           string;
    color:           string;
    status:          boolean;
    manufactureYear: number;
}

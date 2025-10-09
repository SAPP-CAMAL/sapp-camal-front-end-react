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

export interface  TransportType{
    id:            number;
    vehicleTypeId: number;
    name:          string;
    code:          string;
    description:   string;
}

export interface CreateVehicleRequest {
    vehicleDetailId: number;
    plate:           string;
    brand:           string;
    description?:     string;
    model:           string;
    color:           string;
    status:          boolean;
    manufactureYear: number;
}